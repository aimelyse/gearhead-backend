import { PartialType } from '@nestjs/mapped-types';
import { CreateGarageVehicleDto } from './create-garage-vehicle.dto';

export class UpdateGarageVehicleDto extends PartialType(CreateGarageVehicleDto) {}
