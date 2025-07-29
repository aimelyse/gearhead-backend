import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Car {
  @Prop({ type: Types.ObjectId, ref: 'CarBrand', required: true })
  brandID: Types.ObjectId;

  @Prop({ required: true })
  make: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  bodyType: string;

  @Prop({ required: true })
  engineType: string;

  @Prop({ required: true })
  transmission: string;

  @Prop({ required: true })
  fuelType: string;

  @Prop()
  image?: string;

  @Prop({ default: false })
  isPopular: boolean;
}

export const CarSchema = SchemaFactory.createForClass(Car);
export type CarDocument = Car & Document;
