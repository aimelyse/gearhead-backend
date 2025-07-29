import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsMongoId,
  IsEnum,
} from 'class-validator';

export class CreateGarageVehicleDto {
  @ApiProperty()
  @IsMongoId()
  garageID: string;

  @ApiProperty()
  @IsMongoId()
  carID: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modifications?: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  currentProject?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  totalSpent?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isMainVehicle?: boolean;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['active', 'project', 'sold', 'inactive'])
  status?: string;
}
