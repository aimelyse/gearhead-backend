import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Check for Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('No authorization header provided');
      throw new UnauthorizedException('No authorization header provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      this.logger.warn('No token provided in authorization header');
      throw new UnauthorizedException('No token provided');
    }

    try {
      // First, try to decode the token without verification to check its structure
      const decodedHeader = this.decodeTokenHeader(token);
      const decodedPayload = this.decodeTokenPayload(token);

      this.logger.debug(
        `Token type detected: ${decodedHeader.typ || 'Unknown'}`,
      );
      this.logger.debug(`Token issuer: ${decodedPayload.iss || 'Unknown'}`);

      let userInfo;

      // Check if it's a Firebase custom token (issued by our service account)
      if (this.isFirebaseCustomToken(decodedPayload)) {
        this.logger.debug('Detected Firebase custom token');
        userInfo = await this.handleCustomToken(decodedPayload);
      }
      // Check if it's a Firebase ID token
      else if (this.isFirebaseIdToken(decodedPayload)) {
        this.logger.debug('Detected Firebase ID token');
        userInfo = await this.firebaseService.verifyIdToken(token);
      }
      // Handle other token types if needed
      else {
        this.logger.warn('Unknown token type');
        throw new UnauthorizedException('Unsupported token type');
      }

      // Add user info to request object
      request.user = {
        uid: userInfo.uid,
        email: userInfo.email || userInfo.claims?.email,
        name: userInfo.name || userInfo.claims?.name,
        picture: userInfo.picture,
        email_verified: userInfo.email_verified,
        phone_number: userInfo.phone_number,
        firebase: userInfo,
      };

      this.logger.debug(
        `User authenticated: ${userInfo.uid} (${userInfo.email || userInfo.claims?.email})`,
      );
      return true;
    } catch (error) {
      this.logger.error('Token verification failed:', error.message);

      // Provide specific error messages
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException(
          'Token has expired. Please login again.',
        );
      }

      if (error.code === 'auth/id-token-revoked') {
        throw new UnauthorizedException(
          'Token has been revoked. Please login again.',
        );
      }

      if (error.code === 'auth/invalid-id-token') {
        throw new UnauthorizedException('Invalid token format.');
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private decodeTokenHeader(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      return header;
    } catch (error) {
      throw new UnauthorizedException('Invalid token format');
    }
  }

  private decodeTokenPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token format');
    }
  }

  private isFirebaseCustomToken(payload: any): boolean {
    // Custom tokens have specific characteristics:
    // - Issued by our service account
    // - Have 'uid' in payload
    // - Have specific audience
    const serviceAccountEmail = process.env.FIREBASE_CLIENT_EMAIL;

    return (
      payload.iss === serviceAccountEmail &&
      payload.sub === serviceAccountEmail &&
      payload.uid &&
      payload.aud ===
        'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit'
    );
  }

  private isFirebaseIdToken(payload: any): boolean {
    // ID tokens have different characteristics:
    // - Issued by Firebase
    // - Have 'firebase' claim
    // - Different audience format
    const projectId = process.env.FIREBASE_PROJECT_ID;

    return (
      payload.iss === `https://securetoken.google.com/${projectId}` ||
      payload.firebase ||
      payload.aud === projectId
    );
  }

  private async handleCustomToken(payload: any): Promise<any> {
    try {
      // For custom tokens, we extract the user info directly from the payload
      // since we created it ourselves

      // Verify the token is not expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new UnauthorizedException('Custom token has expired');
      }

      // Return user info in the same format as ID tokens
      return {
        uid: payload.uid,
        email: payload.claims?.email || payload.email,
        name: payload.claims?.name || payload.name,
        email_verified: true, // Custom tokens are pre-verified
        claims: payload.claims || {},
        iss: payload.iss,
        aud: payload.aud,
        auth_time: payload.iat,
        user_id: payload.uid,
        sub: payload.uid,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      this.logger.error('Custom token handling failed:', error.message);
      throw new UnauthorizedException('Invalid custom token');
    }
  }
}
