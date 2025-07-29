import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsMongoId } from 'class-validator';

export class CreateProjectUpdateDto {
  @ApiProperty()
  @IsMongoId()
  garageVehicleID: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
