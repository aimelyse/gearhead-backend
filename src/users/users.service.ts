import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(
    createUserDto: CreateUserDto,
    firebaseUid: string,
  ): Promise<User> {
    try {
      const createdUser = new this.userModel({
        ...createUserDto,
        firebaseUid,
      });
      return await createdUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userModel
      .find()
      .populate('skills')
      .populate('carBrands')
      .exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate('skills')
      .populate('carBrands')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User> {
    const user = await this.userModel
      .findOne({ firebaseUid })
      .populate('skills')
      .populate('carBrands')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .populate('skills')
      .populate('carBrands')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async incrementTotalSpots(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { $inc: { totalSpots: 1 } });
  }

  async incrementReputation(userId: string, points: number): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { reputation: points },
    });
  }
}
