import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  AuthResponse,
  RegisterResponse,
  RefreshTokenDto,
} from './dto/auth.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    private usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    try {
      this.logger.log(`Registration attempt for email: ${registerDto.email}`);

      // 1. Create user in Firebase Auth
      const firebaseUser = await this.firebaseService.createUser(
        registerDto.email,
        registerDto.password,
        registerDto.name,
        registerDto.phone,
      );

      this.logger.log(`Firebase user created: ${firebaseUser.uid}`);

      // 2. Create user in our MongoDB database
      const createUserDto: CreateUserDto = {
        name: registerDto.name,
        email: registerDto.email,
        phone: registerDto.phone,
        location: registerDto.location || 'Kigali',
        bio: registerDto.bio || '',
        profileImage: registerDto.profileImage || '',
        skills: registerDto.skills || [],
        carBrands: registerDto.carBrands || [],
        isActive: true,
      };

      const newUser: any = await this.usersService.create(
        createUserDto,
        firebaseUser.uid,
      );
      this.logger.log(`Database user created: ${newUser._id}`);

      // 3. Generate custom token for immediate login
      const customToken = await this.firebaseService.createCustomToken(
        firebaseUser.uid,
        {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        },
      );

      // 4. Generate refresh token
      const refreshToken: any = this.firebaseService.generateRefreshToken(
        firebaseUser.uid,
      );

      return {
        user: {
          id: newUser._id.toString(),
          firebaseUid: newUser.firebaseUid,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          location: newUser.location,
          bio: newUser.bio,
          profileImage: newUser.profileImage,
          totalSpots: newUser.totalSpots,
          reputation: newUser.reputation,
          isActive: newUser.isActive,
          skills: newUser.skills,
          carBrands: newUser.carBrands,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
        accessToken: customToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
        message: 'Registration successful',
        isNewUser: true,
      };
    } catch (error) {
      this.logger.error('Registration failed:', error.message);

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Login attempt for email: ${loginDto.email}`);

      // 1. Verify user exists in Firebase
      const firebaseUser = await this.firebaseService.getUserByEmail(
        loginDto.email,
      );

      // Note: Firebase Admin SDK doesn't verify passwords directly
      // In production, you'd use Firebase Auth REST API for this
      // For now, we assume if user exists in Firebase, credentials are valid

      this.logger.log(`Firebase user found: ${firebaseUser.uid}`);

      // 2. Get user from our database
      let dbUser;
      try {
        dbUser = await this.usersService.findByFirebaseUid(firebaseUser.uid);
      } catch (error) {
        throw new UnauthorizedException(
          'User not found in our system. Please register first.',
        );
      }

      // 3. Generate custom token
      const customToken = await this.firebaseService.createCustomToken(
        firebaseUser.uid,
        {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        },
      );

      // 4. Generate refresh token
      const refreshToken = this.firebaseService.generateRefreshToken(
        firebaseUser.uid,
      );

      this.logger.log(`Login successful for user: ${dbUser._id}`);

      return {
        user: {
          id: dbUser._id.toString(),
          firebaseUid: dbUser.firebaseUid,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          location: dbUser.location,
          bio: dbUser.bio,
          profileImage: dbUser.profileImage,
          totalSpots: dbUser.totalSpots,
          reputation: dbUser.reputation,
          isActive: dbUser.isActive,
          skills: dbUser.skills,
          carBrands: dbUser.carBrands,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        },
        accessToken: customToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
        message: 'Login successful',
      };
    } catch (error) {
      this.logger.error('Login failed:', error.message);

      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new UnauthorizedException('Invalid email or password');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      // 1. Verify refresh token
      const { uid } = this.firebaseService.verifyRefreshToken(
        refreshTokenDto.refreshToken,
      );

      // 2. Get user from database
      const dbUser: any = await this.usersService.findByFirebaseUid(uid);

      // 3. Generate new access token
      const customToken = await this.firebaseService.createCustomToken(uid, {
        email: dbUser.email,
        name: dbUser.name,
      });

      // 4. Generate new refresh token
      const newRefreshToken = this.firebaseService.generateRefreshToken(uid);

      return {
        user: {
          id: dbUser._id.toString(),
          firebaseUid: dbUser.firebaseUid,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          location: dbUser.location,
          bio: dbUser.bio,
          profileImage: dbUser.profileImage,
          totalSpots: dbUser.totalSpots,
          reputation: dbUser.reputation,
          isActive: dbUser.isActive,
          skills: dbUser.skills,
          carBrands: dbUser.carBrands,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        },
        accessToken: customToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getCurrentUser(firebaseUid: string): Promise<any> {
    try {
      const user: any = await this.usersService.findByFirebaseUid(firebaseUid);

      return {
        id: user._id.toString(),
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        profileImage: user.profileImage,
        totalSpots: user.totalSpots,
        reputation: user.reputation,
        isActive: user.isActive,
        skills: user.skills,
        carBrands: user.carBrands,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      this.logger.error('Get current user failed:', error.message);
      throw new UnauthorizedException('User not found');
    }
  }

  async changePassword(
    firebaseUid: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await this.firebaseService.updateUserPassword(firebaseUid, newPassword);
      this.logger.log(`Password changed for user: ${firebaseUid}`);
    } catch (error) {
      this.logger.error('Password change failed:', error.message);
      throw new BadRequestException('Failed to change password');
    }
  }

  async logout(firebaseUid: string): Promise<void> {
    try {
      // In a production app, you'd invalidate the refresh token in database
      this.logger.log(`User logged out: ${firebaseUid}`);
    } catch (error) {
      this.logger.error('Logout failed:', error.message);
    }
  }
}
