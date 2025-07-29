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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';
@Controller('events')
@UseGuards(FirebaseAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user.uid);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('upcoming') upcoming?: string,
    @Query('organizerId') organizerId?: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.eventsService.search(search);
    }
    if (upcoming === 'true') {
      return this.eventsService.findUpcoming();
    }
    if (type) {
      return this.eventsService.findByType(type);
    }
    if (organizerId) {
      return this.eventsService.findByOrganizer(organizerId);
    }
    return this.eventsService.findAll();
  }

  @Get('my-events')
  getMyEvents(@Request() req) {
    return this.eventsService.findByOrganizer(req.user.uid);
  }

  @Get('attending')
  getAttendingEvents(@Request() req) {
    return this.eventsService.findByAttendee(req.user.uid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ) {
    return this.eventsService.update(id, updateEventDto, req.user.uid);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.eventsService.remove(id, req.user.uid);
  }

  @Post(':id/join')
  joinEvent(@Param('id') id: string, @Request() req) {
    return this.eventsService.joinEvent(id, req.user.uid);
  }

  @Post(':id/leave')
  leaveEvent(@Param('id') id: string, @Request() req) {
    return this.eventsService.leaveEvent(id, req.user.uid);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req,
  ) {
    return this.eventsService.updateStatus(id, status, req.user.uid);
  }
}
