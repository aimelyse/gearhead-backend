import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty()
  @IsString()
  businessName: string;

  @ApiProperty()
  @IsString()
  businessType: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  workingHours?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
