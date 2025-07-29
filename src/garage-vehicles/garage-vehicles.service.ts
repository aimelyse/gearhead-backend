import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGarageVehicleDto } from './dto/create-garage-vehicle.dto';
import { UpdateGarageVehicleDto } from './dto/update-garage-vehicle.dto';
import {
  GarageVehicle,
  GarageVehicleDocument,
} from './entities/garage-vehicle.entity';

@Injectable()
export class GarageVehiclesService {
  constructor(
    @InjectModel(GarageVehicle.name)
    private garageVehicleModel: Model<GarageVehicleDocument>,
  ) {}

  async create(
    createGarageVehicleDto: CreateGarageVehicleDto,
  ): Promise<GarageVehicle> {
    const createdGarageVehicle = new this.garageVehicleModel(
      createGarageVehicleDto,
    );
    return await createdGarageVehicle.save();
  }

  async findAll(): Promise<GarageVehicle[]> {
    return await this.garageVehicleModel
      .find()
      .populate('garageID')
      .populate('carID')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByGarage(garageId: string): Promise<GarageVehicle[]> {
    return await this.garageVehicleModel
      .find({ garageID: garageId })
      .populate('garageID')
      .populate('carID')
      .sort({ isMainVehicle: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<GarageVehicle> {
    const garageVehicle = await this.garageVehicleModel
      .findById(id)
      .populate('garageID')
      .populate('carID')
      .exec();

    if (!garageVehicle) {
      throw new NotFoundException('Garage vehicle not found');
    }
    return garageVehicle;
  }

  async update(
    id: string,
    updateGarageVehicleDto: UpdateGarageVehicleDto,
  ): Promise<GarageVehicle> {
    const updatedGarageVehicle = await this.garageVehicleModel
      .findByIdAndUpdate(id, updateGarageVehicleDto, { new: true })
      .populate('garageID')
      .populate('carID')
      .exec();

    if (!updatedGarageVehicle) {
      throw new NotFoundException('Garage vehicle not found');
    }
    return updatedGarageVehicle;
  }

  async remove(id: string): Promise<void> {
    const result = await this.garageVehicleModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Garage vehicle not found');
    }
  }

  async addModification(
    id: string,
    modification: string,
  ): Promise<GarageVehicle> {
    const updatedGarageVehicle = await this.garageVehicleModel
      .findByIdAndUpdate(
        id,
        { $push: { modifications: modification } },
        { new: true },
      )
      .populate('garageID')
      .populate('carID')
      .exec();

    if (!updatedGarageVehicle) {
      throw new NotFoundException('Garage vehicle not found');
    }
    return updatedGarageVehicle;
  }

  async addImage(id: string, imageUrl: string): Promise<GarageVehicle> {
    const updatedGarageVehicle = await this.garageVehicleModel
      .findByIdAndUpdate(id, { $push: { images: imageUrl } }, { new: true })
      .populate('garageID')
      .populate('carID')
      .exec();

    if (!updatedGarageVehicle) {
      throw new NotFoundException('Garage vehicle not found');
    }
    return updatedGarageVehicle;
  }

  async updateSpending(id: string, amount: number): Promise<GarageVehicle> {
    const updatedGarageVehicle = await this.garageVehicleModel
      .findByIdAndUpdate(id, { $inc: { totalSpent: amount } }, { new: true })
      .populate('garageID')
      .populate('carID')
      .exec();

    if (!updatedGarageVehicle) {
      throw new NotFoundException('Garage vehicle not found');
    }
    return updatedGarageVehicle;
  }
}
