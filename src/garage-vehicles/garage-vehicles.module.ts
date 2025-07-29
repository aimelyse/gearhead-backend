import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GarageVehiclesService } from './garage-vehicles.service';
import { GarageVehiclesController } from './garage-vehicles.controller';
import {
  GarageVehicle,
  GarageVehicleSchema,
} from './entities/garage-vehicle.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GarageVehicle.name, schema: GarageVehicleSchema },
    ]),
  ],
  controllers: [GarageVehiclesController],
  providers: [GarageVehiclesService],
  exports: [GarageVehiclesService],
})
export class GarageVehiclesModule {}
