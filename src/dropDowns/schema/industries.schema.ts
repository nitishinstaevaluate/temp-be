import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IndustryDocument = Industry & Document;

@Schema()
export class Industry {
    @Prop({ required: true })
  industry: string;

  @Prop({ default: () => new Date() })
  modifiedAt: Date;
  
  @Prop({ default: () => new Date() })
  createdAt: Date;
}

export const IndustrySchema = SchemaFactory.createForClass(Industry);