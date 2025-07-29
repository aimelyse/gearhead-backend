import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class ChallengeSubmission {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userID: Types.ObjectId;

  @Prop({ required: true })
  imageURL: string;

  @Prop({ default: 0 })
  votes: number;

  @Prop({ required: true })
  submittedAt: Date;
}

export type ChallengeDocument = Challenge & Document;

@Schema({ timestamps: true })
export class Challenge {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  participants: Types.ObjectId[];

  @Prop({ type: [ChallengeSubmission], default: [] })
  submissions: ChallengeSubmission[];

  @Prop()
  prize?: string;

  @Prop({
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active',
  })
  status: string;

  @Prop()
  winnerID?: Types.ObjectId;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
