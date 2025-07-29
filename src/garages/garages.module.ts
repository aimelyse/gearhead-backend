import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GaragesService } from './garages.service';
import { GaragesController } from './garages.controller';
import { Garage, GarageSchema } from './entities/garage.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Garage.name, schema: GarageSchema }]),
  ],
  controllers: [GaragesController],
  providers: [GaragesService],
  exports: [GaragesService],
})
export class GaragesModule {}
