import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizerID: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  eventDate: Date;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ type: [{ type: String, ref: 'User' }], default: [] })
  attendees: String[];

  @Prop({ required: true })
  maxAttendees: number;

  @Prop({ default: 0 })
  entryFee: number;

  @Prop({
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  })
  status: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
export type EventDocument = Event & Document;
