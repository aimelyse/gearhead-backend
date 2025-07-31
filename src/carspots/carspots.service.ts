import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { CreateCarspotDto } from './dto/create-carspot.dto';
import { UpdateCarspotDto } from './dto/update-carspot.dto';
import { Carspot, CarspotDocument } from './entities/carspot.entity';

@Injectable()
export class CarspotsService {
  constructor(
    @InjectModel(Carspot.name) private carspotModel: Model<CarspotDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
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

  async findAll(): Promise<any[]> {
    const carspots = await this.carspotModel
      .find({ isPublic: true })
      .populate('carID')
      .sort({ createdAt: -1 })
      .exec();

    // Manually populate user data using Firebase UID
    const populatedCarspots = await Promise.all(
      carspots.map(async (carspot) => {
        const user = await this.userModel.findOne({
          firebaseUid: carspot.userID,
        });
        return {
          ...carspot.toObject(),
          user: user
            ? {
                name: user.name,
                profileImage: user.profileImage,
                uid: user.firebaseUid || carspot.userID,
              }
            : null,
        };
      }),
    );

    return populatedCarspots;
  }

  // Option B: If User _id is Firebase UID (Recommended)
  async findAllWithFirebaseUID(): Promise<any[]> {
    return await this.carspotModel
      .find({ isPublic: true })
      .populate('userID', 'name profileImage') // This will work if User._id = Firebase UID
      .populate('carID')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Carspot[]> {
    return await this.carspotModel
      .find({ userID: userId }) // Direct string comparison
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
