import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class ciqsimpleindustry {
  @Prop({ type:String, required:true })
  simpleindustryid: string;

  @Prop({ type: String, required: true})
  simpleindustrydescription: string;
}

export type ciqsimpleindustryDocument = ciqsimpleindustry & Document;
export const ciqsimpleindustrySchema = SchemaFactory.createForClass(ciqsimpleindustry);

@Schema()
export class ciqindustryhierarchy {
  @Prop({type:Number, required:true})
  subTypeId: number;

  @Prop({type:Number, required:true})
  GIC: number;
  
  @Prop({type:String, required:true})
  GICSDescriptor: string;

  @Prop({type:Number, required:true})
  childLevel: number;

  @Prop({type:Number, required:true})
  subParentId: number;
}

export type ciqindustryhierarchyDocument = ciqindustryhierarchy & Document;
export const ciqindustryhierarchySchema = SchemaFactory.createForClass(ciqindustryhierarchy);

@Schema()
export class ciqcompanystatustype {
  @Prop({type:Number,required:true})
  companystatustypeid:number;

  @Prop({type:String,required:true})
  companystatustypename:string
}

export type ciqcompanystatustypeDocument = ciqcompanystatustype & Document;
export const ciqcompanystatustypeSchema = SchemaFactory.createForClass(ciqcompanystatustype);

@Schema()
export class ciqcompanytype {
  @Prop({type:Number,required:true})
  companytypeid:number;

  @Prop({type:String,required:true})
  companytypename:string
}

export type ciqcompanytypeDocument = ciqcompanytype & Document;
export const ciqcompanytypeSchema = SchemaFactory.createForClass(ciqcompanytype);

@Schema({timestamps:true, versionKey:false})
export class betaWorking {
  @Prop({type:Array<Object>,required:true})
  coreBetaWorking:Array<object>;

  @Prop({type:Array<Object>,required:true})
  betaMeanMedianWorking:Array<object>;
  
  @Prop({type:Number,required:true})
  processIdentifierId:number;
}

export type BetaWorkingDocument = betaWorking & Document;
export const BetaWorkingSchema = SchemaFactory.createForClass(betaWorking);