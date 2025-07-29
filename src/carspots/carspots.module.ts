import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarspotsService } from './carspots.service';
import { CarspotsController } from './carspots.controller';
import { Carspot, CarspotSchema } from './entities/carspot.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Carspot.name, schema: CarspotSchema }]),
  ],
  controllers: [CarspotsController],
  providers: [CarspotsService],
  exports: [CarspotsService],
})
export class CarspotsModule {}
