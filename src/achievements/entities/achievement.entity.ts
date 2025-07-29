import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Achievement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userID: Types.ObjectId;

  @Prop({ required: true })
  badgeName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  earnedDate: Date;

  @Prop()
  badgeIcon?: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({
    required: true,
    enum: ['Spotting', 'Social', 'Garage', 'Events', 'Quests', 'General'],
  })
  category: string;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
export type AchievementDocument = Achievement & Document;
