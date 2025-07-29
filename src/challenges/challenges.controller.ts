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
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { SubmitChallengeDto } from './dto/submit-challenge.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Body() createChallengeDto: CreateChallengeDto) {
    return this.challengesService.create(createChallengeDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('active') active?: string,
    @Query('completed') completed?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    if (active === 'true') {
      return this.challengesService.findActive();
    }
    if (completed === 'true') {
      return this.challengesService.findCompleted();
    }
    if (upcoming === 'true') {
      return this.challengesService.getUpcomingChallenges();
    }
    if (status) {
      return this.challengesService.findByStatus(status);
    }
    return this.challengesService.findAll();
  }

  @Get(':id/stats')
  getChallengeStats(@Param('id') id: string) {
    return this.challengesService.getChallengeStats(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.challengesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
  ) {
    return this.challengesService.update(id, updateChallengeDto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.challengesService.remove(id);
  }

  @Post(':id/join')
  @UseGuards(FirebaseAuthGuard)
  joinChallenge(@Param('id') id: string, @Request() req) {
    return this.challengesService.joinChallenge(id, req.user.uid);
  }

  @Post(':id/leave')
  @UseGuards(FirebaseAuthGuard)
  leaveChallenge(@Param('id') id: string, @Request() req) {
    return this.challengesService.leaveChallenge(id, req.user.uid);
  }

  @Post(':id/submit')
  @UseGuards(FirebaseAuthGuard)
  submitToChallenge(
    @Param('id') id: string,
    @Body() submitChallengeDto: SubmitChallengeDto,
    @Request() req,
  ) {
    return this.challengesService.submitToChallenge(
      id,
      submitChallengeDto,
      req.user.uid,
    );
  }

  @Post(':id/vote/:userId')
  @UseGuards(FirebaseAuthGuard)
  voteForSubmission(@Param('id') id: string, @Param('userId') userId: string) {
    return this.challengesService.voteForSubmission(id, userId);
  }

  @Post(':id/complete')
  @UseGuards(FirebaseAuthGuard)
  completeChallenge(@Param('id') id: string) {
    return this.challengesService.completeChallenge(id);
  }
}
