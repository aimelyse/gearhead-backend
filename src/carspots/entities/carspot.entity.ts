import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Carspot {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userID: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  carID: Types.ObjectId;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  imageURL: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;

  @Prop({ default: true })
  isPublic: boolean;
}

export const CarspotSchema = SchemaFactory.createForClass(Carspot);
export type CarspotDocument = Carspot & Document;
