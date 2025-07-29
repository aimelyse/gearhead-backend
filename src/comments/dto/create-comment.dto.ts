import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsEnum(['carspot', 'projectUpdate', 'event', 'quest'])
  postType: string;

  @ApiProperty()
  @IsString()
  postID: string;

  @ApiProperty()
  @IsString()
  comment: string;

  @ApiProperty()
  @IsOptional()
  @IsMongoId()
  parentCommentID?: string;
}
