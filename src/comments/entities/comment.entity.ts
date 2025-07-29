import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userID: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['carspot', 'projectUpdate', 'event', 'quest'],
  })
  postType: string;

  @Prop({ required: true })
  postID: string;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  replies: number;

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parentCommentID?: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
export type CommentDocument = Comment & Document;
