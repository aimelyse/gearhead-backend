import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProjectUpdateDto } from './dto/create-project-update.dto';
import { UpdateProjectUpdateDto } from './dto/update-project-update.dto';
import {
  ProjectUpdate,
  ProjectUpdateDocument,
} from './entities/project-update.entity';

@Injectable()
export class ProjectUpdatesService {
  constructor(
    @InjectModel(ProjectUpdate.name)
    private projectUpdateModel: Model<ProjectUpdateDocument>,
  ) {}

  async create(
    createProjectUpdateDto: CreateProjectUpdateDto,
  ): Promise<ProjectUpdate> {
    const createdProjectUpdate = new this.projectUpdateModel(
      createProjectUpdateDto,
    );
    return await createdProjectUpdate.save();
  }

  async findAll(): Promise<ProjectUpdate[]> {
    return await this.projectUpdateModel
      .find()
      .populate({
        path: 'garageVehicleID',
        populate: [
          { path: 'carID' },
          {
            path: 'garageID',
            populate: { path: 'ownerID', select: 'name profileImage' },
          },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByGarageVehicle(garageVehicleId: string): Promise<ProjectUpdate[]> {
    return await this.projectUpdateModel
      .find({ garageVehicleID: garageVehicleId })
      .populate({
        path: 'garageVehicleID',
        populate: [
          { path: 'carID' },
          {
            path: 'garageID',
            populate: { path: 'ownerID', select: 'name profileImage' },
          },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ProjectUpdate> {
    const projectUpdate = await this.projectUpdateModel
      .findById(id)
      .populate({
        path: 'garageVehicleID',
        populate: [
          { path: 'carID' },
          {
            path: 'garageID',
            populate: { path: 'ownerID', select: 'name profileImage' },
          },
        ],
      })
      .exec();

    if (!projectUpdate) {
      throw new NotFoundException('Project update not found');
    }
    return projectUpdate;
  }

  async update(
    id: string,
    updateProjectUpdateDto: UpdateProjectUpdateDto,
  ): Promise<ProjectUpdate> {
    const updatedProjectUpdate = await this.projectUpdateModel
      .findByIdAndUpdate(id, updateProjectUpdateDto, { new: true })
      .populate({
        path: 'garageVehicleID',
        populate: [
          { path: 'carID' },
          {
            path: 'garageID',
            populate: { path: 'ownerID', select: 'name profileImage' },
          },
        ],
      })
      .exec();

    if (!updatedProjectUpdate) {
      throw new NotFoundException('Project update not found');
    }
    return updatedProjectUpdate;
  }

  async remove(id: string): Promise<void> {
    const result = await this.projectUpdateModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Project update not found');
    }
  }

  async likeUpdate(id: string): Promise<ProjectUpdate> {
    const projectUpdate = await this.projectUpdateModel
      .findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true })
      .populate({
        path: 'garageVehicleID',
        populate: [
          { path: 'carID' },
          {
            path: 'garageID',
            populate: { path: 'ownerID', select: 'name profileImage' },
          },
        ],
      })
      .exec();

    if (!projectUpdate) {
      throw new NotFoundException('Project update not found');
    }
    return projectUpdate;
  }

  async incrementComments(id: string): Promise<void> {
    await this.projectUpdateModel.findByIdAndUpdate(id, {
      $inc: { comments: 1 },
    });
  }
}
