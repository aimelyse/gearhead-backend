import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsBoolean,
} from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsMongoId()
  userID: string;

  @ApiProperty()
  @IsEnum([
    'like',
    'comment',
    'follow',
    'quest_application',
    'quest_assigned',
    'event_reminder',
    'achievement',
  ])
  type: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  fromUser?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  postID?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  actionURL?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
