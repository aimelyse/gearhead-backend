import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Business {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerID: Types.ObjectId;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true })
  businessType: string;

  @Prop({ required: true })
  location: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Skill' }], default: [] })
  services: Types.ObjectId[];

  @Prop({ required: true })
  phone: string;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  reviews: number;

  @Prop()
  workingHours?: string;

  @Prop()
  description?: string;

  @Prop()
  website?: string;

  @Prop()
  email?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
export type BusinessDocument = Business & Document;
