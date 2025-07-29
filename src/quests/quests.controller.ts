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
import { QuestsService } from './quests.service';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';

@Controller('quests')
@UseGuards(FirebaseAuthGuard)
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Post()
  create(@Body() createQuestDto: CreateQuestDto, @Request() req) {
    return this.questsService.create(createQuestDto, req.user.uid);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('skillId') skillId?: string,
    @Query('requesterId') requesterId?: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.questsService.search(search);
    }
    if (status) {
      return this.questsService.findByStatus(status);
    }
    if (skillId) {
      return this.questsService.findBySkill(skillId);
    }
    if (requesterId) {
      return this.questsService.findByRequester(requesterId);
    }
    return this.questsService.findAll();
  }

  @Get('my-quests')
  getMyQuests(@Request() req) {
    return this.questsService.findByRequester(req.user.uid);
  }

  @Get('my-applications')
  getMyApplications(@Request() req) {
    return this.questsService.findByApplicant(req.user.uid);
  }

  @Get('assigned-to-me')
  getAssignedQuests(@Request() req) {
    return this.questsService.findAssignedToUser(req.user.uid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestDto: UpdateQuestDto,
    @Request() req,
  ) {
    return this.questsService.update(id, updateQuestDto, req.user.uid);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.questsService.remove(id, req.user.uid);
  }

  @Post(':id/apply')
  applyToQuest(@Param('id') id: string, @Request() req) {
    return this.questsService.applyToQuest(id, req.user.uid);
  }

  @Post(':id/withdraw')
  withdrawApplication(@Param('id') id: string, @Request() req) {
    return this.questsService.withdrawApplication(id, req.user.uid);
  }

  @Post(':id/assign')
  assignQuest(
    @Param('id') id: string,
    @Body('applicantId') applicantId: string,
    @Request() req,
  ) {
    return this.questsService.assignQuest(id, applicantId, req.user.uid);
  }

  @Post(':id/complete')
  completeQuest(@Param('id') id: string, @Request() req) {
    return this.questsService.completeQuest(id, req.user.uid);
  }
}
