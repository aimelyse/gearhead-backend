import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Skill {
  @Prop({ required: true })
  skillName: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
export type SkillDocument = Skill & Document;
