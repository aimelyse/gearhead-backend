import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car, CarDocument } from './entities/car.entity';

@Injectable()
export class CarsService {
  constructor(@InjectModel(Car.name) private carModel: Model<CarDocument>) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    const createdCar = new this.carModel(createCarDto);
    return await createdCar.save();
  }

  async findAll(): Promise<Car[]> {
    return await this.carModel.find().populate('brandID').exec();
  }

  async findPopular(): Promise<Car[]> {
    return await this.carModel
      .find({ isPopular: true })
      .populate('brandID')
      .exec();
  }

  async findByBrand(brandId: string): Promise<Car[]> {
    return await this.carModel
      .find({ brandID: brandId })
      .populate('brandID')
      .exec();
  }

  async findByYear(year: number): Promise<Car[]> {
    return await this.carModel.find({ year }).populate('brandID').exec();
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.carModel.findById(id).populate('brandID').exec();

    if (!car) {
      throw new NotFoundException('Car not found');
    }
    return car;
  }

  async update(id: string, updateCarDto: UpdateCarDto): Promise<Car> {
    const updatedCar = await this.carModel
      .findByIdAndUpdate(id, updateCarDto, { new: true })
      .populate('brandID')
      .exec();

    if (!updatedCar) {
      throw new NotFoundException('Car not found');
    }
    return updatedCar;
  }

  async remove(id: string): Promise<void> {
    const result = await this.carModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Car not found');
    }
  }

  async search(query: string): Promise<Car[]> {
    return await this.carModel
      .find({
        $or: [
          { make: { $regex: query, $options: 'i' } },
          { model: { $regex: query, $options: 'i' } },
          { bodyType: { $regex: query, $options: 'i' } },
          { engineType: { $regex: query, $options: 'i' } },
        ],
      })
      .populate('brandID')
      .exec();
  }
}
