import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { Quest, QuestDocument } from './entities/quest.entity';

@Injectable()
export class QuestsService {
  constructor(
    @InjectModel(Quest.name) private questModel: Model<QuestDocument>,
  ) {}

  async create(
    createQuestDto: CreateQuestDto,
    requesterId: string,
  ): Promise<Quest> {
    const createdQuest = new this.questModel({
      ...createQuestDto,
      requesterID: requesterId,
    });
    return await createdQuest.save();
  }

  async findAll(): Promise<Quest[]> {
    return await this.questModel
      .find({ status: 'Open' })
      .populate({
        path: 'requesterID',
        foreignField: 'firebaseUid',
        select: 'name profileImage location',
      })
      .populate('skillID')
      .populate({
        path: 'applicants',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStatus(status: string): Promise<Quest[]> {
    return await this.questModel
      .find({ status })
      .populate({
        path: 'requesterID',
        foreignField: 'firebaseUid',
        select: 'name profileImage location',
      })
      .populate('skillID')
      .populate({
        path: 'applicants',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .populate({
        path: 'assignedTo',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findBySkill(skillId: string): Promise<Quest[]> {
    return await this.questModel
      .find({ skillID: skillId, status: 'Open' })
      .populate({
        path: 'requesterID',
        foreignField: 'firebaseUid',
        select: 'name profileImage location',
      })
      .populate({
        path: 'applicants',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByRequester(requesterId: string): Promise<Quest[]> {
    return await this.questModel
      .find({ requesterID: requesterId })
      .populate({
        path: 'requesterID',
        foreignField: 'firebaseUid',
        select: 'name profileImage location',
      })
      .populate('skillID')
      .populate({
        path: 'applicants',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .populate({
        path: 'assignedTo',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByApplicant(userId: string): Promise<Quest[]> {
    return await this.questModel
      .find({ applicants: userId })
      .populate({
        path: 'requesterID',
        foreignField: 'firebaseUid',
        select: 'name profileImage location',
      })
      .populate('skillID')
      .populate({
        path: 'applicants',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .populate({
        path: 'assignedTo',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAssignedToUser(userId: string): Promise<Quest[]> {
    return await this.questModel
      .find({ assignedTo: userId })
      .populate({
        path: 'requesterID',
        foreignField: 'firebaseUid',
        select: 'name profileImage location',
      })
      .populate('skillID')
      .populate({
        path: 'applicants',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .populate({
        path: 'assignedTo',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Quest> {
    const quest = await this.questModel
      .findById(id)
      .populate({
        path: 'requesterID',
        foreignField: 'firebaseUid',
        select: 'name profileImage location',
      })
      .populate('skillID')
      .populate({
        path: 'applicants',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .populate({
        path: 'assignedTo',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .exec();

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }
    return quest;
  }

  async update(
    id: string,
    updateQuestDto: UpdateQuestDto,
    userId: string,
  ): Promise<Quest> {
    const quest = await this.questModel.findById(id);

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    if (quest.requesterID.toString() !== userId) {
      throw new ForbiddenException('You can only update your own quests');
    }

    const updatedQuest = await this.questModel
      .findByIdAndUpdate(id, updateQuestDto, { new: true })
      .populate({
        path: 'requesterID',
        foreignField: 'firebaseUid',
        select: 'name profileImage location',
      })
      .populate('skillID')
      .populate({
        path: 'applicants',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .populate({
        path: 'assignedTo',
        foreignField: 'firebaseUid',
        select: 'name profileImage',
      })
      .exec();

    return updatedQuest;
  }

  async remove(id: string, userId: string): Promise<void> {
    const quest = await this.questModel.findById(id);

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    if (quest.requesterID.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own quests');
    }

    await this.questModel.findByIdAndDelete(id);
  }

  async applyToQuest(questId: string, userId: string): Promise<Quest> {
    const quest = await this.questModel.findById(questId);

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    if (quest.status !== 'Open') {
      throw new BadRequestException('Cannot apply to this quest');
    }

    if (quest.requesterID.toString() === userId) {
      throw new BadRequestException('Cannot apply to your own quest');
    }

    if (quest.applicants.includes(userId as any)) {
      throw new BadRequestException('You have already applied to this quest');
    }

    const updatedQuest = await this.questModel
      .findByIdAndUpdate(
        questId,
        { $push: { applicants: userId } },
        { new: true },
      )
      .populate('requesterID', 'name profileImage location')
      .populate('skillID')
      .populate('applicants', 'name profileImage')
      .populate('assignedTo', 'name profileImage')
      .exec();

    return updatedQuest;
  }

  async withdrawApplication(questId: string, userId: string): Promise<Quest> {
    const quest = await this.questModel.findById(questId);

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    if (!quest.applicants.includes(userId as any)) {
      throw new BadRequestException('You have not applied to this quest');
    }

    const updatedQuest = await this.questModel
      .findByIdAndUpdate(
        questId,
        { $pull: { applicants: userId } },
        { new: true },
      )
      .populate('requesterID', 'name profileImage location')
      .populate('skillID')
      .populate('applicants', 'name profileImage')
      .populate('assignedTo', 'name profileImage')
      .exec();

    return updatedQuest;
  }

  async assignQuest(
    questId: string,
    applicantId: string,
    requesterId: string,
  ): Promise<Quest> {
    const quest = await this.questModel.findById(questId);

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    if (quest.requesterID.toString() !== requesterId) {
      throw new ForbiddenException('Only quest requester can assign the quest');
    }

    if (!quest.applicants.includes(applicantId as any)) {
      throw new BadRequestException('User has not applied to this quest');
    }

    const updatedQuest = await this.questModel
      .findByIdAndUpdate(
        questId,
        {
          assignedTo: applicantId,
          status: 'In Progress',
        },
        { new: true },
      )
      .populate('requesterID', 'name profileImage location')
      .populate('skillID')
      .populate('applicants', 'name profileImage')
      .populate('assignedTo', 'name profileImage')
      .exec();

    return updatedQuest;
  }

  async completeQuest(questId: string, userId: string): Promise<Quest> {
    const quest = await this.questModel.findById(questId);

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    const canComplete =
      quest.requesterID.toString() === userId ||
      quest.assignedTo?.toString() === userId;

    if (!canComplete) {
      throw new ForbiddenException(
        'Only requester or assigned user can complete the quest',
      );
    }

    const updatedQuest = await this.questModel
      .findByIdAndUpdate(
        questId,
        {
          status: 'Completed',
          completedAt: new Date(),
        },
        { new: true },
      )
      .populate('requesterID', 'name profileImage location')
      .populate('skillID')
      .populate('applicants', 'name profileImage')
      .populate('assignedTo', 'name profileImage')
      .exec();

    return updatedQuest;
  }

  async search(query: string): Promise<Quest[]> {
    return await this.questModel
      .find({
        $and: [
          { status: 'Open' },
          {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { location: { $regex: query, $options: 'i' } },
            ],
          },
        ],
      })
      .populate('requesterID', 'name profileImage location')
      .populate('skillID')
      .populate('applicants', 'name profileImage')
      .sort({ createdAt: -1 })
      .exec();
  }
}
