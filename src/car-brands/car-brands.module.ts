import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarBrandsService } from './car-brands.service';
import { CarBrandsController } from './car-brands.controller';
import { CarBrand, CarBrandSchema } from './entities/car-brand.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CarBrand.name, schema: CarBrandSchema },
    ]),
  ],
  controllers: [CarBrandsController],
  providers: [CarBrandsService],
  exports: [CarBrandsService],
})
export class CarBrandsModule {}
