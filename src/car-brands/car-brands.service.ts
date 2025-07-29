import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCarBrandDto } from './dto/create-car-brand.dto';
import { UpdateCarBrandDto } from './dto/update-car-brand.dto';
import { CarBrand, CarBrandDocument } from './entities/car-brand.entity';

@Injectable()
export class CarBrandsService {
  constructor(
    @InjectModel(CarBrand.name) private carBrandModel: Model<CarBrandDocument>,
  ) {}

  async create(createCarBrandDto: CreateCarBrandDto): Promise<CarBrand> {
    const createdCarBrand = new this.carBrandModel(createCarBrandDto);
    return await createdCarBrand.save();
  }

  async findAll(): Promise<CarBrand[]> {
    return await this.carBrandModel.find({ isActive: true }).exec();
  }

  async findByCountry(country: string): Promise<CarBrand[]> {
    return await this.carBrandModel.find({ country, isActive: true }).exec();
  }

  async findOne(id: string): Promise<CarBrand> {
    const carBrand = await this.carBrandModel.findById(id).exec();
    if (!carBrand) {
      throw new NotFoundException('Car brand not found');
    }
    return carBrand;
  }

  async update(
    id: string,
    updateCarBrandDto: UpdateCarBrandDto,
  ): Promise<CarBrand> {
    const updatedCarBrand = await this.carBrandModel
      .findByIdAndUpdate(id, updateCarBrandDto, { new: true })
      .exec();

    if (!updatedCarBrand) {
      throw new NotFoundException('Car brand not found');
    }
    return updatedCarBrand;
  }

  async remove(id: string): Promise<void> {
    const result = await this.carBrandModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Car brand not found');
    }
  }

  async search(query: string): Promise<CarBrand[]> {
    return await this.carBrandModel
      .find({
        $and: [
          { isActive: true },
          { brandName: { $regex: query, $options: 'i' } },
        ],
      })
      .exec();
  }
}
