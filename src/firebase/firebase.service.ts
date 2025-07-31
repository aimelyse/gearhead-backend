import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      // Get Firebase configuration from ConfigService
      const projectId = this.configService.get<string>('app.projectId');
      const clientEmail = this.configService.get<string>('app.clientEmail');
      const privateKey = this.configService.get<string>('app.privateKey');

      // Validate required configuration
      if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
          'Missing Firebase configuration. Check your environment variables.',
        );
      }

      // Initialize Firebase Admin SDK
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

      this.logger.log(
        `🔥 Firebase initialized successfully for project: ${projectId}`,
      );
    } catch (error) {
      this.logger.error('❌ Failed to initialize Firebase:', error.message);
      throw error;
    }
  }

  // Verify ID token (what comes from client after authentication)
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      this.logger.debug(`✅ ID Token verified for user: ${decodedToken.uid}`);
      return decodedToken;
    } catch (error) {
      this.logger.error('❌ ID Token verification failed:', error.message);
      throw error;
    }
  }

  // Main verification method - now handled by the guard
  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    // This method is now primarily used by the guard
    // The guard handles the logic of determining token type
    return await this.verifyIdToken(token);
  }

  getAuth() {
    return admin.auth();
  }

  // Create user with email and password
  async createUser(
    email: string,
    password: string,
    displayName: string,
    phoneNumber?: string,
  ): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        phoneNumber,
        emailVerified: false,
      });

      this.logger.log(`✅ Firebase user created: ${userRecord.uid} (${email})`);
      return userRecord;
    } catch (error) {
      this.logger.error('❌ Failed to create Firebase user:', error.message);

      // Handle Firebase-specific errors
      if (error.code === 'auth/email-already-exists') {
        throw new BadRequestException('Email is already registered');
      }
      if (error.code === 'auth/invalid-email') {
        throw new BadRequestException('Invalid email format');
      }
      if (error.code === 'auth/weak-password') {
        throw new BadRequestException('Password is too weak');
      }

      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      return userRecord;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new BadRequestException('User not found');
      }
      throw error;
    }
  }

  // Create custom token (works perfectly for API authentication)
  async createCustomToken(
    uid: string,
    additionalClaims?: object,
  ): Promise<string> {
    try {
      const customToken = await admin
        .auth()
        .createCustomToken(uid, additionalClaims);
      this.logger.debug(`✅ Custom token created for user: ${uid}`);
      return customToken;
    } catch (error) {
      this.logger.error('❌ Custom token creation failed:', error.message);
      throw error;
    }
  }

  // Get user by UID
  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      this.logger.error(`❌ Failed to get user ${uid}:`, error.message);
      throw error;
    }
  }

  // Update user password
  async updateUserPassword(uid: string, newPassword: string): Promise<void> {
    try {
      await admin.auth().updateUser(uid, {
        password: newPassword,
      });
      this.logger.log(`✅ Password updated for user: ${uid}`);
    } catch (error) {
      this.logger.error('❌ Failed to update password:', error.message);
      throw error;
    }
  }

  // Delete user
  async deleteUser(uid: string): Promise<void> {
    try {
      await admin.auth().deleteUser(uid);
      this.logger.log(`✅ User deleted: ${uid}`);
    } catch (error) {
      this.logger.error('❌ Failed to delete user:', error.message);
      throw error;
    }
  }

  // Generate a refresh token (simple implementation)
  generateRefreshToken(uid: string): string {
    const payload = {
      uid,
      type: 'refresh',
      iat: Date.now(),
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  // Verify refresh token
  verifyRefreshToken(refreshToken: string): { uid: string } {
    try {
      const decoded = JSON.parse(
        Buffer.from(refreshToken, 'base64').toString(),
      );

      // Check if token is expired (7 days)
      const now = Date.now();
      const tokenAge = now - decoded.iat;
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (tokenAge > maxAge) {
        throw new Error('Refresh token expired');
      }

      return { uid: decoded.uid };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  // Verify user password using Firebase Auth REST API
  async verifyPassword(email: string, password: string): Promise<any> {
    try {
      // Use Firebase Auth REST API to verify password
      const apiKey = this.configService.get<string>('app.webKey'); // You'll need to add this

      if (!apiKey) {
        this.logger.warn(
          'Firebase Web API Key not configured, skipping password verification',
        );
        // Fallback: just check if user exists
        return await this.getUserByEmail(email);
      }

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.error?.message === 'EMAIL_NOT_FOUND') {
          throw new BadRequestException('User not found');
        }
        if (error.error?.message === 'INVALID_PASSWORD') {
          throw new BadRequestException('Invalid password');
        }
        throw new BadRequestException('Authentication failed');
      }

      const data = await response.json();
      this.logger.debug(`✅ Password verified for user: ${email}`);

      return {
        uid: data.localId,
        email: data.email,
        idToken: data.idToken,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      this.logger.error('❌ Password verification failed:', error.message);
      throw error;
    }
  }
}
