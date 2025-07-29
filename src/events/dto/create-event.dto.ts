import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  eventType: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsDateString()
  eventDate: string;

  @ApiProperty()
  @IsString()
  startTime: string;

  @ApiProperty()
  @IsString()
  endTime: string;

  @ApiProperty()
  @IsNumber()
  maxAttendees: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  entryFee?: number;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['upcoming', 'ongoing', 'completed', 'cancelled'])
  status?: string;
}
