import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateGarageDto } from './dto/create-garage.dto';
import { UpdateGarageDto } from './dto/update-garage.dto';
import { Garage, GarageDocument } from './entities/garage.entity';

@Injectable()
export class GaragesService {
  constructor(
    @InjectModel(Garage.name) private garageModel: Model<GarageDocument>,
  ) {}

  async create(
    createGarageDto: CreateGarageDto,
    userId: string,
  ): Promise<Garage> {
    const createdGarage = new this.garageModel({
      ...createGarageDto,
      ownerID: userId,
    });
    return await createdGarage.save();
  }

  async findAll(): Promise<Garage[]> {
    return await this.garageModel
      .find({ isPublic: true })
      .populate('ownerID', 'name profileImage location')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByOwner(ownerId: string): Promise<Garage[]> {
    return await this.garageModel
      .find({ ownerID: ownerId })
      .populate('ownerID', 'name profileImage location')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Garage> {
    const garage = await this.garageModel
      .findById(id)
      .populate('ownerID', 'name profileImage location')
      .exec();

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }
    return garage;
  }

  async update(
    id: string,
    updateGarageDto: UpdateGarageDto,
    userId: string,
  ): Promise<Garage> {
    const garage = await this.garageModel.findById(id);

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }

    if (garage.ownerID.toString() !== userId) {
      throw new ForbiddenException('You can only update your own garage');
    }

    const updatedGarage = await this.garageModel
      .findByIdAndUpdate(id, updateGarageDto, { new: true })
      .populate('ownerID', 'name profileImage location')
      .exec();

    return updatedGarage;
  }

  async remove(id: string, userId: string): Promise<void> {
    const garage = await this.garageModel.findById(id);

    if (!garage) {
      throw new NotFoundException('Garage not found');
    }

    if (garage.ownerID.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own garage');
    }

    await this.garageModel.findByIdAndDelete(id);
  }

  async incrementCars(garageId: string): Promise<void> {
    await this.garageModel.findByIdAndUpdate(garageId, {
      $inc: { totalCars: 1 },
    });
  }

  async decrementCars(garageId: string): Promise<void> {
    await this.garageModel.findByIdAndUpdate(garageId, {
      $inc: { totalCars: -1 },
    });
  }

  async incrementProjects(garageId: string): Promise<void> {
    await this.garageModel.findByIdAndUpdate(garageId, {
      $inc: { totalProjects: 1 },
    });
  }

  async decrementProjects(garageId: string): Promise<void> {
    await this.garageModel.findByIdAndUpdate(garageId, {
      $inc: { totalProjects: -1 },
    });
  }
}
