import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectUpdateDto } from './create-project-update.dto';

export class UpdateProjectUpdateDto extends PartialType(CreateProjectUpdateDto) {}
