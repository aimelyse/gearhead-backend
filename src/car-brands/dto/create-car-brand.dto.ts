import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCarBrandDto {
  @ApiProperty()
  @IsString()
  brandName: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
