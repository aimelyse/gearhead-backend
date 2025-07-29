import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';
import {
  Achievement,
  AchievementDocument,
} from './entities/achievement.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectModel(Achievement.name)
    private achievementModel: Model<AchievementDocument>,
  ) {}

  async create(
    createAchievementDto: CreateAchievementDto,
  ): Promise<Achievement> {
    const createdAchievement = new this.achievementModel(createAchievementDto);
    return await createdAchievement.save();
  }

  async findAll(): Promise<Achievement[]> {
    return await this.achievementModel
      .find()
      .populate('userID', 'name profileImage')
      .sort({ earnedDate: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Achievement[]> {
    return await this.achievementModel
      .find({ userID: userId })
      .populate('userID', 'name profileImage')
      .sort({ earnedDate: -1 })
      .exec();
  }

  async findByCategory(category: string): Promise<Achievement[]> {
    return await this.achievementModel
      .find({ category })
      .populate('userID', 'name profileImage')
      .sort({ earnedDate: -1 })
      .exec();
  }

  async findRecentAchievements(limit: number = 10): Promise<Achievement[]> {
    return await this.achievementModel
      .find()
      .populate('userID', 'name profileImage')
      .sort({ earnedDate: -1 })
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<Achievement> {
    const achievement = await this.achievementModel
      .findById(id)
      .populate('userID', 'name profileImage')
      .exec();

    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }
    return achievement;
  }

  async update(
    id: string,
    updateAchievementDto: UpdateAchievementDto,
  ): Promise<Achievement> {
    const updatedAchievement = await this.achievementModel
      .findByIdAndUpdate(id, updateAchievementDto, { new: true })
      .populate('userID', 'name profileImage')
      .exec();

    if (!updatedAchievement) {
      throw new NotFoundException('Achievement not found');
    }
    return updatedAchievement;
  }

  async remove(id: string): Promise<void> {
    const result = await this.achievementModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Achievement not found');
    }
  }

  async getUserTotalPoints(userId: string): Promise<number> {
    const result = await this.achievementModel.aggregate([
      { $match: { userID: userId } },
      { $group: { _id: null, totalPoints: { $sum: '$points' } } },
    ]);

    return result.length > 0 ? result[0].totalPoints : 0;
  }

  async getUserAchievementStats(userId: string): Promise<any> {
    const achievements = await this.findByUser(userId);
    const totalPoints = await this.getUserTotalPoints(userId);

    const categoryStats = {};
    achievements.forEach((achievement) => {
      if (!categoryStats[achievement.category]) {
        categoryStats[achievement.category] = {
          count: 0,
          points: 0,
        };
      }
      categoryStats[achievement.category].count++;
      categoryStats[achievement.category].points += achievement.points;
    });

    return {
      totalAchievements: achievements.length,
      totalPoints,
      categoryStats,
      recentAchievements: achievements.slice(0, 5),
    };
  }

  // Helper methods to award specific achievements
  async awardFirstSpotAchievement(userId: string): Promise<Achievement> {
    const existing = await this.achievementModel.findOne({
      userID: userId,
      badgeName: 'First Spot',
    });

    if (existing) {
      return existing;
    }

    return await this.create({
      userID: userId,
      badgeName: 'First Spot',
      description: 'Posted your first car spot',
      earnedDate: new Date().toISOString(),
      badgeIcon: 'first_spot.png',
      points: 10,
      category: 'Spotting',
    });
  }

  async awardSpotMasterAchievement(userId: string): Promise<Achievement> {
    const existing = await this.achievementModel.findOne({
      userID: userId,
      badgeName: 'Spot Master',
    });

    if (existing) {
      return existing;
    }

    return await this.create({
      userID: userId,
      badgeName: 'Spot Master',
      description: 'Posted 100 car spots',
      earnedDate: new Date().toISOString(),
      badgeIcon: 'spot_master.png',
      points: 100,
      category: 'Spotting',
    });
  }

  async awardSocialButterflyAchievement(userId: string): Promise<Achievement> {
    const existing = await this.achievementModel.findOne({
      userID: userId,
      badgeName: 'Social Butterfly',
    });

    if (existing) {
      return existing;
    }

    return await this.create({
      userID: userId,
      badgeName: 'Social Butterfly',
      description: 'Attended 10 events',
      earnedDate: new Date().toISOString(),
      badgeIcon: 'social_butterfly.png',
      points: 50,
      category: 'Events',
    });
  }

  async awardHelpfulHandAchievement(userId: string): Promise<Achievement> {
    const existing = await this.achievementModel.findOne({
      userID: userId,
      badgeName: 'Helpful Hand',
    });

    if (existing) {
      return existing;
    }

    return await this.create({
      userID: userId,
      badgeName: 'Helpful Hand',
      description: 'Completed 5 quests',
      earnedDate: new Date().toISOString(),
      badgeIcon: 'helpful_hand.png',
      points: 75,
      category: 'Quests',
    });
  }

  async awardGarageMasterAchievement(userId: string): Promise<Achievement> {
    const existing = await this.achievementModel.findOne({
      userID: userId,
      badgeName: 'Garage Master',
    });

    if (existing) {
      return existing;
    }

    return await this.create({
      userID: userId,
      badgeName: 'Garage Master',
      description: 'Added 5 vehicles to your garage',
      earnedDate: new Date().toISOString(),
      badgeIcon: 'garage_master.png',
      points: 60,
      category: 'Garage',
    });
  }

  async checkAndAwardAchievements(
    userId: string,
    actionType: string,
    count?: number,
  ): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];

    switch (actionType) {
      case 'first_spot':
        newAchievements.push(await this.awardFirstSpotAchievement(userId));
        break;

      case 'spot_milestone':
        if (count >= 100) {
          newAchievements.push(await this.awardSpotMasterAchievement(userId));
        }
        break;

      case 'event_milestone':
        if (count >= 10) {
          newAchievements.push(
            await this.awardSocialButterflyAchievement(userId),
          );
        }
        break;

      case 'quest_milestone':
        if (count >= 5) {
          newAchievements.push(await this.awardHelpfulHandAchievement(userId));
        }
        break;

      case 'garage_milestone':
        if (count >= 5) {
          newAchievements.push(await this.awardGarageMasterAchievement(userId));
        }
        break;
    }

    return newAchievements.filter((achievement) => achievement !== null);
  }

  async getLeaderboard(category?: string, limit: number = 10): Promise<any[]> {
    const matchStage = category ? { category } : {};

    return await this.achievementModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userID',
          totalPoints: { $sum: '$points' },
          totalAchievements: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1, totalAchievements: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          totalPoints: 1,
          totalAchievements: 1,
          'user.name': 1,
          'user.profileImage': 1,
        },
      },
    ]);
  }
}
