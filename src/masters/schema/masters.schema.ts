import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

//Industry Schema
@Schema()
export class Industry {
    @Prop({ required: true })
  industry: string;

  @Prop({ default:true })
  isActive: boolean;

  @Prop({ default: () => new Date() })
  modifiedAt: Date;
  
  @Prop({ default: () => new Date() })
  createdAt: Date;
}
export type IndustryDocument = Industry & Document;
export const IndustrySchema = SchemaFactory.createForClass(Industry);

//ValuationMethod Schema
@Schema()
export class ValuationMethod {
 @Prop({ required: true })
    method: string;

  @Prop({ default:true })
    isActive: boolean;

  @Prop({ default: () => new Date() })
  modifiedAt: Date;
  
  @Prop({ default: () => new Date() })
  createdAt: Date;
}
export type ValuationMethodDocument = ValuationMethod & Document;
export const ValuationMethodSchema = SchemaFactory.createForClass(ValuationMethod);

//Tax Rate Schema
@Schema()
export class TaxRate {
 @Prop({ required: true })
    name: string;

  @Prop({ required:true })
    rate:number;

  @Prop({ default:true })
    isActive: boolean;

  @Prop({ default: () => new Date() })
  modifiedAt: Date;
  
  @Prop({ default: () => new Date() })
  createdAt: Date;
}
export type TaxRateDocument = TaxRate & Document;
export const TaxRateSchema = SchemaFactory.createForClass(TaxRate);

//Discount Rate Schema
@Schema()
export class DiscountRate {
 @Prop({ required: true })
    name: string;

  @Prop({ required:true })
    rate:number;

    @Prop({ default:true })
    isActive: boolean;

    @Prop({ default: () => new Date() })
  modifiedAt: Date;
  
  @Prop({ default: () => new Date() })
  createdAt: Date;
}
export type DiscountRateDocument = DiscountRate & Document;
export const DiscountRateSchema = SchemaFactory.createForClass(DiscountRate);

//Terminal Growth Rate Schema
@Schema()
export class TerminalGrowthRate {

  @Prop({ required:true })
    rate:number;

    @Prop({ default:true })
    isActive: boolean;
    
    @Prop({ default: () => new Date() })
  modifiedAt: Date;
  
  @Prop({ default: () => new Date() })
  createdAt: Date;
}
export type TerminalGrowthRateDocument = TerminalGrowthRate & Document;
export const TerminalGrowthRateSchema = SchemaFactory.createForClass(TerminalGrowthRate);

//Cost of Equity Method Schema
@Schema()
export class COEMethod {

  @Prop({ required:true })
    method:string;

    @Prop({ default:true })
    isActive: boolean;
    
    @Prop({ default: () => new Date() })
  modifiedAt: Date;
  
  @Prop({ default: () => new Date() })
  createdAt: Date;
}
export type COEMethodDocument = COEMethod & Document;
export const COEMethodSchema = SchemaFactory.createForClass(COEMethod);