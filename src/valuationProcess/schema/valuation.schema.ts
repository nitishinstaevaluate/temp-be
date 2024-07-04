import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Value {
  @Prop()
  finalPriceAvg: number | null;

  @Prop()
  finalPriceMed: number | null;
}
@Schema()
export class CompanyModelResult {
  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  valuationData: Array<object>;

  @Prop({ type: Number, default: null }) // Allow a single number or null
  valuation: number | Value | null;
}

@Schema()
export class Valuation {
  @Prop({ required: true })
  company: string;

  @Prop({ type: [String], required: true })
  model: string[];

  @Prop({ required: false })
  provisionalDate: Date;

  @Prop({ required: true })
  inputData: Array<object>; 

  @Prop({ type: Array<object>, required: true })
  modelResults: CompanyModelResult[];

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  processStateId: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ required: false })
  deletedAt: Date;
}

export type ValuationDocument = Valuation & Document;
export const ValuationSchema = SchemaFactory.createForClass(Valuation);
