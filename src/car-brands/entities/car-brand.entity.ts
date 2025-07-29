import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CarBrand {
  @Prop({ required: true })
  brandName: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  logo?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CarBrandSchema = SchemaFactory.createForClass(CarBrand);
export type CarBrandDocument = CarBrand & Document;
