import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill, SkillDocument } from './entities/skill.entity';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skill.name) private skillModel: Model<SkillDocument>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    const createdSkill = new this.skillModel(createSkillDto);
    return await createdSkill.save();
  }

  async findAll(): Promise<Skill[]> {
    return await this.skillModel.find({ isActive: true }).exec();
  }

  async findByCategory(category: string): Promise<Skill[]> {
    return await this.skillModel.find({ category, isActive: true }).exec();
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillModel.findById(id).exec();
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const updatedSkill = await this.skillModel
      .findByIdAndUpdate(id, updateSkillDto, { new: true })
      .exec();

    if (!updatedSkill) {
      throw new NotFoundException('Skill not found');
    }
    return updatedSkill;
  }

  async remove(id: string): Promise<void> {
    const result = await this.skillModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Skill not found');
    }
  }

  async search(query: string): Promise<Skill[]> {
    return await this.skillModel
      .find({
        $and: [
          { isActive: true },
          {
            $or: [
              { skillName: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
            ],
          },
        ],
      })
      .exec();
  }
}
