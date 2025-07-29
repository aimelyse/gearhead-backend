import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event, EventDocument } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    organizerId: string,
  ): Promise<Event> {
    const createdEvent = new this.eventModel({
      ...createEventDto,
      organizerID: organizerId,
    });
    return await createdEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return await this.eventModel
      .find({ status: { $in: ['upcoming', 'ongoing'] } })
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .sort({ eventDate: 1 })
      .exec();
  }

  async findUpcoming(): Promise<Event[]> {
    const now = new Date();
    return await this.eventModel
      .find({
        status: 'upcoming',
        eventDate: { $gte: now },
      })
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .sort({ eventDate: 1 })
      .exec();
  }

  async findByType(eventType: string): Promise<Event[]> {
    return await this.eventModel
      .find({
        eventType,
        status: { $in: ['upcoming', 'ongoing'] },
      })
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .sort({ eventDate: 1 })
      .exec();
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return await this.eventModel
      .find({ organizerID: organizerId })
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .sort({ eventDate: -1 })
      .exec();
  }

  async findByAttendee(userId: string): Promise<Event[]> {
    return await this.eventModel
      .find({ attendees: userId })
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .sort({ eventDate: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventModel
      .findById(id)
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .exec();

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<Event> {
    const event = await this.eventModel.findById(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerID.toString() !== userId) {
      throw new ForbiddenException('You can only update your own events');
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .exec();

    return updatedEvent;
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.eventModel.findById(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerID.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    await this.eventModel.findByIdAndDelete(id);
  }

  async joinEvent(eventId: string, userId: string): Promise<Event> {
    const event = await this.eventModel.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.attendees.includes(userId as any)) {
      throw new BadRequestException('You are already attending this event');
    }

    if (event.attendees.length >= event.maxAttendees) {
      throw new BadRequestException('Event is full');
    }

    if (event.status !== 'upcoming') {
      throw new BadRequestException('Cannot join this event');
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $push: { attendees: userId } },
        { new: true },
      )
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .exec();

    return updatedEvent;
  }

  async leaveEvent(eventId: string, userId: string): Promise<Event> {
    const event = await this.eventModel.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.attendees.includes(userId as any)) {
      throw new BadRequestException('You are not attending this event');
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $pull: { attendees: userId } },
        { new: true },
      )
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .exec();

    return updatedEvent;
  }

  async updateStatus(
    eventId: string,
    status: string,
    userId: string,
  ): Promise<Event> {
    const event = await this.eventModel.findById(eventId);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerID.toString() !== userId) {
      throw new ForbiddenException('Only organizer can update event status');
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(eventId, { status }, { new: true })
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .exec();

    return updatedEvent;
  }

  async search(query: string): Promise<Event[]> {
    return await this.eventModel
      .find({
        $and: [
          { status: { $in: ['upcoming', 'ongoing'] } },
          {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { location: { $regex: query, $options: 'i' } },
              { eventType: { $regex: query, $options: 'i' } },
            ],
          },
        ],
      })
      .populate('organizerID', 'name profileImage location')
      .populate('attendees', 'name profileImage')
      .sort({ eventDate: 1 })
      .exec();
  }
}
