import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userID: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'like',
      'comment',
      'follow',
      'quest_application',
      'quest_assigned',
      'event_reminder',
      'achievement',
    ],
  })
  type: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  fromUser?: Types.ObjectId;

  @Prop()
  postID?: string;

  @Prop()
  actionURL?: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
export type NotificationDocument = Notification & Document;
