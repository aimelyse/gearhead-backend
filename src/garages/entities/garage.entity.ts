import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Garage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerID: Types.ObjectId;

  @Prop({ required: true })
  garageName: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  description?: string;

  @Prop({ default: 0 })
  totalCars: number;

  @Prop({ default: 0 })
  totalProjects: number;

  @Prop({ default: true })
  isPublic: boolean;
}

export const GarageSchema = SchemaFactory.createForClass(Garage);
export type GarageDocument = Garage & Document;
