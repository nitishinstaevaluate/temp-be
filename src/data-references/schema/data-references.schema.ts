import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

//Industry Beta Schema
@Schema()
export class BetaIndustry {
  @Prop({ required: true })
  industry: string;

  // @Prop({ required: false })
  // industryId: string;

  @Prop({ required: false })
  noOfFirms: number;

  @Prop({ required: true })
  beta: number;

  @Prop({ required: true })
  taxType: String;

  @Prop({ required: true })
  deRatio: number;

  @Prop({ required: true })
  effectiveTaxRate: number;

  @Prop({ required: false })
  unleveredBeta: number;

  @Prop({ required: false })
  cashFirmValue: number;

  @Prop({ required: false })
  unleveredBetaCash: number;


  @Prop({ required: false })
  hiloRisk: number;

  @Prop({ required: false })
  stdEquity: number;

  @Prop({ required: false })
  stdOprIncome: number;

  @Prop({ required: false })
  beta_2019: number;

  @Prop({ required: false })
  beta_2020: number;

  @Prop({ required: false })
  beta_2021: number;

  @Prop({ required: false })
  beta_2022: number;

  @Prop({ required: false })
  yearlyBetaAv: number;

  @Prop({ default: () => new Date() ,required: false})
  modifiedAt: Date;

  @Prop({ default: () => new Date(),required: false })
  createdAt: Date;
}
export type BetaIndustryDocument = BetaIndustry & Document;
export const BetaIndustrySchema = SchemaFactory.createForClass(BetaIndustry);