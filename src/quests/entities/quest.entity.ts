import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Quest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterID: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Skill', required: true })
  skillID: Types.ObjectId;

  @Prop({ required: true })
  location: string;

  @Prop({ default: 0 })
  payment: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  })
  urgency: string;

  @Prop({
    enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Open',
  })
  status: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  applicants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop()
  completedAt?: Date;
}

export const QuestSchema = SchemaFactory.createForClass(Quest);
export type QuestDocument = Quest & Document;
