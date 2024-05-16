import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

//Industry Beta Schema
// @Schema()
// export class BetaIndustry {
//   @Prop({ required: true })
//   industry: string;

//   // @Prop({ required: false })
//   // industryId: string;

//   @Prop({ required: false })
//   noOfFirms: number;

//   @Prop({ required: true })
//   beta: number;

//   @Prop({ required: true })
//   taxType: String;

//   @Prop({ required: true })
//   deRatio: String;

//   @Prop({ required: true })
//   effectiveTaxRate: String;

//   @Prop({ required: false })
//   unleveredBeta: number;

//   @Prop({ required: false })
//   cashFirmValue: String;

//   @Prop({ required: false })
//   unleveredBetaCash: number;


//   @Prop({ required: false })
//   hiloRisk: number;

//   @Prop({ required: false })
//   stdEquity: String;

//   @Prop({ required: false })
//   stdOprIncome: String;

//   @Prop({ required: false })
//   beta_2019: number;

//   @Prop({ required: false })
//   beta_2020: number;

//   @Prop({ required: false })
//   beta_2021: number;

//   @Prop({ required: false })
//   beta_2022: number;

//   @Prop({ required: false })
//   yearlyBetaAv: number;

//   @Prop({ default: () => new Date(), required: false })
//   modifiedAt: Date;

//   @Prop({ default: () => new Date(), required: false })
//   createdAt: Date;
// }
// export type BetaIndustryDocument = BetaIndustry & Document;
// export const BetaIndustrySchema = SchemaFactory.createForClass(BetaIndustry);

@Schema()
export class IndianBetaIndustry {
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
  deRatio: String;

  @Prop({ required: true })
  effectiveTaxRate: String;

  @Prop({ required: false })
  unleveredBeta: number;

  @Prop({ required: false })
  cashFirmValue: String;

  @Prop({ required: false })
  unleveredBetaCash: number;


  @Prop({ required: false })
  hiloRisk: number;

  @Prop({ required: false })
  stdEquity: String;

  @Prop({ required: false })
  stdOprIncome: String;

  @Prop({ required: false })
  beta_2019: number;

  @Prop({ required: false })
  beta_2020: number;

  @Prop({ required: false })
  beta_2021: number;

  @Prop({ required: false })
  beta_2022: number;

  @Prop({ required: false })
  beta_2023: number;

  @Prop({ required: false })
  betaAv: number;

  @Prop({ default: () => new Date(), required: false })
  modifiedAt: Date;

  @Prop({ default: () => new Date(), required: false })
  createdAt: Date;
}
export type IndianBetaIndustryDocument = IndianBetaIndustry & Document;
export const IndianBetaIndustrySchema = SchemaFactory.createForClass(IndianBetaIndustry);

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

//Historical BSE500 Returns Schema
@Schema()
export class HistoricalBSE500Returns {
  @Prop({ required: true })
  Date: Date;
  @Prop({ required: false })
  High: number ;
  @Prop({ required: true })
  Close: number;
  @Prop({ required: false })
  Low: number;
  @Prop({ required: false })
  Open: number;
  @Prop({ required: false })
  'Adj Close': number;
  @Prop({required: false})
  Volume: number ;

}
export type HistoricalBSE500ReturnsDocument = HistoricalBSE500Returns & Document;
export const HistoricalBSE500ReturnsSchema = SchemaFactory.createForClass(HistoricalBSE500Returns);

@Schema()
export class HistoricalNifty50Returns {
  @Prop({ required: true })
  Date: Date;
  @Prop({ required: false })
  High: number ;
  @Prop({ required: true })
  Close: number;
  @Prop({ required: false })
  Low: number;
  @Prop({ required: false })
  Open: number;
  @Prop({ required: false })
  'Adj Close': number;
  @Prop({required: false})
  Volume: number ;

}
export type HistoricalNifty50ReturnsDocument = HistoricalBSE500Returns & Document;
export const HistoricalNifty50ReturnsSchema = SchemaFactory.createForClass(HistoricalNifty50Returns);

@Schema()
export class HistoricalSensex30Returns {
  @Prop({ required: true })
  Date: Date;
  @Prop({ required: false })
  High: number ;
  @Prop({ required: true })
  Close: number;
  @Prop({ required: false })
  Low: number;
  @Prop({ required: false })
  Open: number;
  // @Prop({ required: false })
  // 'Adj Close': number;
  @Prop({required: false})
  Volume: number ;

}
export type HistoricalSensex30ReturnsDocument = HistoricalBSE500Returns & Document;
export const HistoricalSensex30ReturnsSchema = SchemaFactory.createForClass(HistoricalSensex30Returns);

@Schema()
export class HistoricalBankNiftyReturns {
  @Prop({ required: true })
  Date: Date;
  @Prop({ required: false })
  High: number ;
  @Prop({ required: true })
  Close: number;
  @Prop({ required: false })
  Low: number;
  @Prop({ required: false })
  Open: number;
  @Prop({ required: false })
  'Adj Close': number;
  @Prop({required: false})
  Volume: number ;

}
export type HistoricalBankNiftyReturnsDocument = HistoricalBSE500Returns & Document;
export const HistoricalBankNiftyReturnsSchema = SchemaFactory.createForClass(HistoricalBankNiftyReturns);

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

// Purpose Of Report
@Schema()
export class reportDetails {
  @Prop({ required: true })
  srNo: number;

  @Prop({ required: true })
  section: string;

  @Prop({required: false })
  Description: string;
}
@Schema()
export class PurposeOfReport {
  @Prop({ type: String, required: true })
  reportObjective:string;

  @Prop({ type: Array<object>, required: true })
  reportPurpose: reportDetails[];

  @Prop({ default: Date.now })
  createdAt: Date;
}
export type PurposeOfReportDocument = PurposeOfReport & Document;
export const PurposeOfReportSchema = SchemaFactory.createForClass(PurposeOfReport);