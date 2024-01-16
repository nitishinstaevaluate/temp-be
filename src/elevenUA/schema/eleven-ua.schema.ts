import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({versionKey:false})
export class ElevenUa {
  @Prop({ type: Number, required: true })
  bookValueOfAllAssets: number;

  @Prop({ type: Number, required: true })
  totalIncomeTaxPaid: number;

  @Prop({ type: Number, required: true })
  unamortisedAmountOfDeferredExpenditure: Number; 

  @Prop({ type: Number, required: true })
  bookValueOfLiabilities: number;

  @Prop({ type: Number, required: true })
  paidUpCapital: number;

  @Prop({ type: Number, required: true })
  paymentDividends: number;

  @Prop({ type: Number, required: true })
  reserveAndSurplus: number;

  @Prop({ type: Number, required: true })
  totalInvestmentSharesAndSecurities: number;

  @Prop({ type: Number, required: true })
  provisionForTaxation: number;

  @Prop({ required: true })
  userId: string;

  @Prop({type:Object, required:true})
  inputData: object;

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

export type ElevenUaDocument = ElevenUa & Document;
export const ElevenUaSchema = SchemaFactory.createForClass(ElevenUa);