import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsMongoId,
} from 'class-validator';

export class CreateCarDto {
  @ApiProperty()
  @IsMongoId()
  brandID: string;

  @ApiProperty()
  @IsString()
  make: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsString()
  bodyType: string;

  @ApiProperty()
  @IsString()
  engineType: string;

  @ApiProperty()
  @IsString()
  transmission: string;

  @ApiProperty()
  @IsString()
  fuelType: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;
}
