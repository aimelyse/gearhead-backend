import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCarspotDto } from './dto/create-carspot.dto';
import { UpdateCarspotDto } from './dto/update-carspot.dto';
import { Carspot, CarspotDocument } from './entities/carspot.entity';

@Injectable()
export class CarspotsService {
  constructor(
    @InjectModel(Carspot.name) private carspotModel: Model<CarspotDocument>,
  ) {}

  async create(
    createCarspotDto: CreateCarspotDto,
    userId: string,
  ): Promise<Carspot> {
    const createdCarspot = new this.carspotModel({
      ...createCarspotDto,
      userID: userId,
    });
    return await createdCarspot.save();
  }

  async findAll(): Promise<Carspot[]> {
    return await this.carspotModel
      .find({ isPublic: true })
      .populate('userID', 'name profileImage')
      .populate('carID')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Carspot[]> {
    return await this.carspotModel
      .find({ userID: userId })
      .populate('userID', 'name profileImage')
      .populate('carID')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radius: number = 10,
  ): Promise<Carspot[]> {
    // Simple distance calculation - in production, use MongoDB geospatial queries
    return await this.carspotModel
      .find({
        isPublic: true,
        latitude: { $gte: latitude - radius, $lte: latitude + radius },
        longitude: { $gte: longitude - radius, $lte: longitude + radius },
      })
      .populate('userID', 'name profileImage')
      .populate('carID')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Carspot> {
    const carspot = await this.carspotModel
      .findById(id)
      .populate('userID', 'name profileImage')
      .populate('carID')
      .exec();

    if (!carspot) {
      throw new NotFoundException('Car spot not found');
    }
    return carspot;
  }

  async update(
    id: string,
    updateCarspotDto: UpdateCarspotDto,
    userId: string,
  ): Promise<Carspot> {
    const carspot = await this.carspotModel.findById(id);

    if (!carspot) {
      throw new NotFoundException('Car spot not found');
    }

    if (carspot.userID.toString() !== userId) {
      throw new ForbiddenException('You can only update your own car spots');
    }

    const updatedCarspot = await this.carspotModel
      .findByIdAndUpdate(id, updateCarspotDto, { new: true })
      .populate('userID', 'name profileImage')
      .populate('carID')
      .exec();

    return updatedCarspot;
  }

  async remove(id: string, userId: string): Promise<void> {
    const carspot = await this.carspotModel.findById(id);

    if (!carspot) {
      throw new NotFoundException('Car spot not found');
    }

    if (carspot.userID.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own car spots');
    }

    await this.carspotModel.findByIdAndDelete(id);
  }

  async likeCarspot(id: string): Promise<Carspot> {
    const carspot = await this.carspotModel
      .findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true })
      .populate('userID', 'name profileImage')
      .populate('carID')
      .exec();

    if (!carspot) {
      throw new NotFoundException('Car spot not found');
    }
    return carspot;
  }

  async incrementComments(id: string): Promise<void> {
    await this.carspotModel.findByIdAndUpdate(id, { $inc: { comments: 1 } });
  }
}
