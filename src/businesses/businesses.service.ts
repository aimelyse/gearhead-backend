import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Business, BusinessDocument } from './entities/business.entity';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
  ) {}

  async create(
    createBusinessDto: CreateBusinessDto,
    ownerId: string,
  ): Promise<Business> {
    const createdBusiness = new this.businessModel({
      ...createBusinessDto,
      ownerID: ownerId,
    });
    return await createdBusiness.save();
  }

  async findAll(): Promise<Business[]> {
    return await this.businessModel
      .find({ isActive: true })
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .sort({ isVerified: -1, rating: -1 })
      .exec();
  }

  async findByType(businessType: string): Promise<Business[]> {
    return await this.businessModel
      .find({ businessType, isActive: true })
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .sort({ isVerified: -1, rating: -1 })
      .exec();
  }

  async findByLocation(location: string): Promise<Business[]> {
    return await this.businessModel
      .find({
        location: { $regex: location, $options: 'i' },
        isActive: true,
      })
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .sort({ isVerified: -1, rating: -1 })
      .exec();
  }

  async findByService(serviceId: string): Promise<Business[]> {
    return await this.businessModel
      .find({
        services: serviceId,
        isActive: true,
      })
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .sort({ isVerified: -1, rating: -1 })
      .exec();
  }

  async findByOwner(ownerId: string): Promise<Business[]> {
    return await this.businessModel
      .find({ ownerID: ownerId })
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findVerified(): Promise<Business[]> {
    return await this.businessModel
      .find({ isVerified: true, isActive: true })
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .sort({ rating: -1 })
      .exec();
  }

  async findTopRated(limit: number = 10): Promise<Business[]> {
    return await this.businessModel
      .find({ isActive: true, rating: { $gte: 4 } })
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .sort({ rating: -1, reviews: -1 })
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<Business> {
    const business = await this.businessModel
      .findById(id)
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .exec();

    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
    userId: string,
  ): Promise<Business> {
    const business = await this.businessModel.findById(id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerID.toString() !== userId) {
      throw new ForbiddenException('You can only update your own business');
    }

    const updatedBusiness = await this.businessModel
      .findByIdAndUpdate(id, updateBusinessDto, { new: true })
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .exec();

    return updatedBusiness;
  }

  async remove(id: string, userId: string): Promise<void> {
    const business = await this.businessModel.findById(id);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerID.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own business');
    }

    await this.businessModel.findByIdAndDelete(id);
  }

  async updateRating(businessId: string, rating: number): Promise<Business> {
    const business = await this.businessModel.findById(businessId);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Calculate new average rating
    const totalRating = business.rating * business.reviews + rating;
    const newReviewCount = business.reviews + 1;
    const newAverageRating = totalRating / newReviewCount;

    const updatedBusiness = await this.businessModel
      .findByIdAndUpdate(
        businessId,
        {
          rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal place
          reviews: newReviewCount,
        },
        { new: true },
      )
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .exec();

    return updatedBusiness;
  }

  async addService(
    businessId: string,
    serviceId: string,
    userId: string,
  ): Promise<Business> {
    const business = await this.businessModel.findById(businessId);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerID.toString() !== userId) {
      throw new ForbiddenException('You can only modify your own business');
    }

    if (business.services.includes(serviceId as any)) {
      return business;
    }

    const updatedBusiness = await this.businessModel
      .findByIdAndUpdate(
        businessId,
        { $push: { services: serviceId } },
        { new: true },
      )
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .exec();

    return updatedBusiness;
  }

  async removeService(
    businessId: string,
    serviceId: string,
    userId: string,
  ): Promise<Business> {
    const business = await this.businessModel.findById(businessId);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerID.toString() !== userId) {
      throw new ForbiddenException('You can only modify your own business');
    }

    const updatedBusiness = await this.businessModel
      .findByIdAndUpdate(
        businessId,
        { $pull: { services: serviceId } },
        { new: true },
      )
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .exec();

    return updatedBusiness;
  }

  async toggleVerification(businessId: string): Promise<Business> {
    const business = await this.businessModel.findById(businessId);

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const updatedBusiness = await this.businessModel
      .findByIdAndUpdate(
        businessId,
        { isVerified: !business.isVerified },
        { new: true },
      )
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .exec();

    return updatedBusiness;
  }

  async search(query: string): Promise<Business[]> {
    return await this.businessModel
      .find({
        $and: [
          { isActive: true },
          {
            $or: [
              { businessName: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { businessType: { $regex: query, $options: 'i' } },
              { location: { $regex: query, $options: 'i' } },
            ],
          },
        ],
      })
      .populate('ownerID', 'name profileImage')
      .populate('services')
      .sort({ isVerified: -1, rating: -1 })
      .exec();
  }

  async getBusinessStats(businessId: string): Promise<any> {
    const business = await this.findOne(businessId);

    return {
      totalServices: business.services.length,
      rating: business.rating,
      totalReviews: business.reviews,
      isVerified: business.isVerified,
      isActive: business.isActive,
    };
  }
}
