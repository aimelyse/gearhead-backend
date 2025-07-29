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
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';
import { AchievementsService } from './achievements.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Body() createAchievementDto: CreateAchievementDto) {
    return this.achievementsService.create(createAchievementDto);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('recent') recent?: string,
  ) {
    if (recent === 'true') {
      const limit = parseInt(recent) || 10;
      return this.achievementsService.findRecentAchievements(limit);
    }
    if (category) {
      return this.achievementsService.findByCategory(category);
    }
    return this.achievementsService.findAll();
  }

  @Get('my-achievements')
  @UseGuards(FirebaseAuthGuard)
  getMyAchievements(@Request() req) {
    return this.achievementsService.findByUser(req.user.uid);
  }

  @Get('my-stats')
  @UseGuards(FirebaseAuthGuard)
  getMyStats(@Request() req) {
    return this.achievementsService.getUserAchievementStats(req.user.uid);
  }

  @Get('leaderboard')
  getLeaderboard(
    @Query('category') category?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.achievementsService.getLeaderboard(category, limitNum);
  }

  @Get('user/:userId/stats')
  getUserStats(@Param('userId') userId: string) {
    return this.achievementsService.getUserAchievementStats(userId);
  }

  @Get('user/:userId/points')
  getUserPoints(@Param('userId') userId: string) {
    return this.achievementsService.getUserTotalPoints(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.achievementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateAchievementDto: UpdateAchievementDto,
  ) {
    return this.achievementsService.update(id, updateAchievementDto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.achievementsService.remove(id);
  }

  @Post('check/:userId')
  @UseGuards(FirebaseAuthGuard)
  checkAchievements(
    @Param('userId') userId: string,
    @Body('actionType') actionType: string,
    @Body('count') count?: number,
  ) {
    return this.achievementsService.checkAndAwardAchievements(
      userId,
      actionType,
      count,
    );
  }
}
