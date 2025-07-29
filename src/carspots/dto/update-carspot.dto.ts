import { PartialType } from '@nestjs/mapped-types';
import { CreateCarspotDto } from './create-carspot.dto';

export class UpdateCarspotDto extends PartialType(CreateCarspotDto) {}
