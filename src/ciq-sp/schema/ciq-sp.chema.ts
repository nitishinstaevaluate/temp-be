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