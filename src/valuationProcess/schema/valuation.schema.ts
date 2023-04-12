import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

//ValuationData (output Result) Schema
class ValuationData {}

//Valuations Table Schema
@Schema()
export class Valuation {
  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  valuationData: ValuationData;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}
export type ValuationDocument = Valuation & Document;
export const ValuationSchema = SchemaFactory.createForClass(Valuation);
