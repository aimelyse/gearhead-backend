import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectUpdateDocument = ProjectUpdate & Document;

@Schema({ timestamps: true })
export class ProjectUpdate {
  @Prop({ type: Types.ObjectId, ref: 'GarageVehicle', required: true })
  garageVehicleID: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  comments: number;
}

export const ProjectUpdateSchema = SchemaFactory.createForClass(ProjectUpdate);
