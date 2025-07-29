import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import {
  Notification,
  NotificationDocument,
} from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const createdNotification = new this.notificationModel(
      createNotificationDto,
    );
    return await createdNotification.save();
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationModel
      .find()
      .populate('userID', 'name profileImage')
      .populate('fromUser', 'name profileImage')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return await this.notificationModel
      .find({ userID: userId })
      .populate('userID', 'name profileImage')
      .populate('fromUser', 'name profileImage')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return await this.notificationModel
      .find({ userID: userId, isRead: false })
      .populate('userID', 'name profileImage')
      .populate('fromUser', 'name profileImage')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByType(type: string): Promise<Notification[]> {
    return await this.notificationModel
      .find({ type })
      .populate('userID', 'name profileImage')
      .populate('fromUser', 'name profileImage')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findById(id)
      .populate('userID', 'name profileImage')
      .populate('fromUser', 'name profileImage')
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const updatedNotification = await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .populate('userID', 'name profileImage')
      .populate('fromUser', 'name profileImage')
      .exec();

    if (!updatedNotification) {
      throw new NotFoundException('Notification not found');
    }
    return updatedNotification;
  }

  async remove(id: string): Promise<void> {
    const result = await this.notificationModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Notification not found');
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(id, { isRead: true }, { new: true })
      .populate('userID', 'name profileImage')
      .populate('fromUser', 'name profileImage')
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userID: userId, isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationModel.countDocuments({
      userID: userId,
      isRead: false,
    });
  }

  // Helper methods to create specific types of notifications
  async createLikeNotification(
    userId: string,
    fromUserId: string,
    postId: string,
    postType: string,
  ): Promise<Notification> {
    return await this.create({
      userID: userId,
      type: 'like',
      message: 'Someone liked your ' + postType,
      fromUser: fromUserId,
      postID: postId,
      actionURL: `/${postType}/${postId}`,
    });
  }

  async createCommentNotification(
    userId: string,
    fromUserId: string,
    postId: string,
    postType: string,
  ): Promise<Notification> {
    return await this.create({
      userID: userId,
      type: 'comment',
      message: 'Someone commented on your ' + postType,
      fromUser: fromUserId,
      postID: postId,
      actionURL: `/${postType}/${postId}`,
    });
  }

  async createQuestApplicationNotification(
    userId: string,
    fromUserId: string,
    questId: string,
  ): Promise<Notification> {
    return await this.create({
      userID: userId,
      type: 'quest_application',
      message: 'Someone applied to your quest',
      fromUser: fromUserId,
      postID: questId,
      actionURL: `/quests/${questId}`,
    });
  }

  async createQuestAssignedNotification(
    userId: string,
    fromUserId: string,
    questId: string,
  ): Promise<Notification> {
    return await this.create({
      userID: userId,
      type: 'quest_assigned',
      message: 'You have been assigned to a quest',
      fromUser: fromUserId,
      postID: questId,
      actionURL: `/quests/${questId}`,
    });
  }

  async createEventReminderNotification(
    userId: string,
    eventId: string,
    eventTitle: string,
  ): Promise<Notification> {
    return await this.create({
      userID: userId,
      type: 'event_reminder',
      message: `Reminder: ${eventTitle} is starting soon`,
      postID: eventId,
      actionURL: `/events/${eventId}`,
    });
  }

  async createAchievementNotification(
    userId: string,
    achievementName: string,
  ): Promise<Notification> {
    return await this.create({
      userID: userId,
      type: 'achievement',
      message: `Congratulations! You earned the "${achievementName}" badge`,
      actionURL: '/achievements',
    });
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.notificationModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true,
    });
  }
}
