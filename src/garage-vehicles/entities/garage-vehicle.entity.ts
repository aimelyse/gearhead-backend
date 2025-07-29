import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class GarageVehicle {
  @Prop({ type: Types.ObjectId, ref: 'Garage', required: true })
  garageID: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  carID: Types.ObjectId;

  @Prop()
  nickname?: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  modifications: string[];

  @Prop()
  currentProject?: string;

  @Prop({ default: 0 })
  totalSpent: number;

  @Prop({ default: false })
  isMainVehicle: boolean;

  @Prop({
    enum: ['active', 'project', 'sold', 'inactive'],
    default: 'active',
  })
  status: string;
}

export const GarageVehicleSchema = SchemaFactory.createForClass(GarageVehicle);
export type GarageVehicleDocument = GarageVehicle & Document;
