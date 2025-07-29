import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Photo Url', required: false })
  @IsString()
  name: string;

  @ApiProperty({ example: 'moss@gmail.com', required: false })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0788608271', required: false })
  @IsString()
  phone: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  carBrands?: string[];

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
