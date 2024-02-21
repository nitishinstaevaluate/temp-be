import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey:false })
export class Mandate {
  @Prop()
  uniqueLinkId: string;

  @Prop()
  expirationDate: Date;

  @Prop({default:false})
  isSubmitted: boolean;
  
  @Prop({type: String})
  companyName: string;
  
  @Prop({type: String})
  companyAddress: string;

  @Prop({type: String})
  totalFees: string;
}

export type MandateDocument = Mandate & Document;
export const MandateSchema = SchemaFactory.createForClass(Mandate);