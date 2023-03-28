import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

//Industry Schema
@Schema()
export class Industry {
    @Prop({ required: true })
  industry: string;

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