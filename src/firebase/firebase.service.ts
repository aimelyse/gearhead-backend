// src/firebase/firebase.service.ts (Updated with Configuration)
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private configService: ConfigService<AppConfig>) {}

  onModuleInit() {
    try {
      const projectId = this.configService.get<string>('app.projectId', {
        infer: true,
      });
      const clientEmail = this.configService.get<string>('app.clientEmail', {
        infer: true,
      });
      const privateKey = this.configService.get<string>('app.privateKey', {
        infer: true,
      });

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

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      this.logger.debug(`✅ Token verified for user: ${decodedToken.uid}`);
      return decodedToken;
    } catch (error) {
      this.logger.error('❌ Token verification failed:', error.message);
      throw error;
    }
  }

  getAuth() {
    return admin.auth();
  }

  // Helper method to create custom tokens
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

  // Helper method to get user by UID
  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return userRecord;
    } catch (error) {
      this.logger.error(`❌ Failed to get user ${uid}:`, error.message);
      throw error;
    }
  }
}
