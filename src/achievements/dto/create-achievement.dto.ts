import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsMongoId,
} from 'class-validator';

export class CreateAchievementDto {
  @ApiProperty()
  @IsMongoId()
  userID: string;

  @ApiProperty()
  @IsString()
  badgeName: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDateString()
  earnedDate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  badgeIcon?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  points?: number;

  @ApiProperty()
  @IsEnum(['Spotting', 'Social', 'Garage', 'Events', 'Quests', 'General'])
  category: string;
}
