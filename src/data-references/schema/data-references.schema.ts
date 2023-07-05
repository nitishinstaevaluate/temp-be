import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

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

  @Prop({ default: () => new Date(), required: false })
  modifiedAt: Date;

  @Prop({ default: () => new Date(), required: false })
  createdAt: Date;
}
export type BetaIndustryDocument = BetaIndustry & Document;
export const BetaIndustrySchema = SchemaFactory.createForClass(BetaIndustry);

//Industry Ratio Schema
@Schema()
export class IndustriesRatio {
  @Prop({ required: true })
  industry: string;

  @Prop({ required: false })
  industryId: string;

  @Prop({ required: false })
  noOfFirms: number;

  @Prop({ required: false })
  moneyLosingFirms: string;
  @Prop({ required: false })
  currentPE: number;
  @Prop({ required: false })
  trailingPE: number;
  @Prop({ required: false })
  forwardPE: number;
  @Prop({required: false,type: mongoose.Schema.Types.Mixed})
  aggMktCapAll: any ;
  @Prop({ required: false })
  aggMktCapOnlyMoneyMaking: number;
  @Prop({ required: false })
  expectedGrowthRate: number;
  @Prop({required: false,type: mongoose.Schema.Types.Mixed})
  pegRatio: any ;
  @Prop({ required: false })
  priceSales: number;

  @Prop({ required: false })
  netMargin: string;
  @Prop({ required: false })
  evSales: number;
  @Prop({ required: false })
  preTaxOprMargin: string;
  @Prop({required: false,type: mongoose.Schema.Types.Mixed})
  pbv: any ;
  @Prop({ required: false })
  roe: string;
  @Prop({ required: false })
  evInvestedCapital: number;
  @Prop({ required: false })
  roic: string;
  @Prop({required: false,type: mongoose.Schema.Types.Mixed})
  evEBITDAR_D_PV: any ;
  @Prop({required: false,type: mongoose.Schema.Types.Mixed})
  evEBITDA_PV: any ;
  @Prop({required: false,type: mongoose.Schema.Types.Mixed})
  evEBIT_PV: any ;
  @Prop({required: false,type: mongoose.Schema.Types.Mixed})
  evEBIT1t_PV: any ;

  @Prop({ default: () => new Date(), required: false })
  modifiedAt: Date;

  @Prop({ default: () => new Date(), required: false })
  createdAt: Date;
}
export type IndustriesRatioDocument = IndustriesRatio & Document;
export const IndustriesRatioSchema = SchemaFactory.createForClass(IndustriesRatio);


//Historical Returns Schema
@Schema()
export class HistoricalReturns {
  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  index: string;
  @Prop({required: false,type: mongoose.Schema.Types.Mixed})
  yrs: any;
  @Prop({ required: false })
  high: number ;
  @Prop({ required: false })
  close: number;
  @Prop({ required: false })
  return: string;
  @Prop({ required: false })
  cagr: string;
  @Prop({required: false,type: mongoose.Schema.Types.Mixed})
  open: any ;
  @Prop({required: false,type: mongoose.Schema.Types.Mixed})
  low: any ;

  @Prop({required: false})
  isActive: boolean ;

  @Prop({ default: () => new Date(), required: false })
  modifiedAt: Date;

  @Prop({ default: () => new Date(), required: false })
  createdAt: Date;
}
export type HistoricalReturnsDocument = HistoricalReturns & Document;
export const HistoricalReturnsSchema = SchemaFactory.createForClass(HistoricalReturns);

//Industry Beta Schema
@Schema()
export class IndianTreasuryYield {
  @Prop({ required: true })
  maturityInYrs: number;

  @Prop({ required: false })
  latest: number;

  @Prop({required: false })
  modifiedAt: Date;

  @Prop({ required: false })
  createdAt: Date;
}
export type IndianTreasuryYieldDocument = IndianTreasuryYield & Document;
export const IndianTreasuryYieldSchema = SchemaFactory.createForClass(IndianTreasuryYield);
