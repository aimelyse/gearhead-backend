import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll(@Query('type') type?: string) {
    if (type) {
      return this.notificationsService.findByType(type);
    }
    return this.notificationsService.findAll();
  }

  @Get('my-notifications')
  getMyNotifications(@Request() req, @Query('unread') unread?: string) {
    if (unread === 'true') {
      return this.notificationsService.findUnreadByUser(req.user.uid);
    }
    return this.notificationsService.findByUser(req.user.uid);
  }

  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationsService.getUnreadCount(req.user.uid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('mark-all-read')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.uid);
  }

  @Delete('cleanup')
  cleanupOldNotifications(@Query('days') days?: string) {
    const daysOld = days ? parseInt(days) : 30;
    return this.notificationsService.deleteOldNotifications(daysOld);
  }
}
