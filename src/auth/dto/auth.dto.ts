import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsArray,
} from 'class-validator';
import { Types } from 'mongoose';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  skills?: string[]; // Array of skill IDs

  @ApiProperty()
  @IsOptional()
  @IsArray()
  carBrands?: string[]; // Array of car brand IDs
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class UserResponse {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio?: string;
  profileImage?: string;
  totalSpots: number;
  reputation: number;
  isActive: boolean;
  skills: Types.ObjectId[];
  carBrands: Types.ObjectId[];
  createdAt: Date;
  updatedAt?: Date;
}

export class AuthResponse {
  user: UserResponse;
  accessToken: string; // Firebase custom token
  refreshToken?: string;
  expiresIn: number; // Token expiry time in seconds
  message: string;
}

export class RegisterResponse extends AuthResponse {
  isNewUser: boolean;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
