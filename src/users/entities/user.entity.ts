import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  firebaseUid: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  profileImage?: string;

  @Prop({ required: true })
  location: string;

  @Prop()
  bio?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Skill' }], default: [] })
  skills: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'CarBrand' }], default: [] })
  carBrands: Types.ObjectId[];

  @Prop({ default: 0 })
  totalSpots: number;

  @Prop({ default: 0 })
  reputation: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
