import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateChallengeDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  prize?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['Active', 'Completed', 'Cancelled'])
  status?: string;
}
