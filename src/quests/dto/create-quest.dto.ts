import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsMongoId,
} from 'class-validator';

export class CreateQuestDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsMongoId()
  skillID: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  payment?: number;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty()
  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High'])
  urgency?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['Open', 'In Progress', 'Completed', 'Cancelled'])
  status?: string;
}
