import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DataCheckList {
  @Prop()
  uniqueLinkId: string;

  @Prop()
  expirationDate: Date;

  @Prop({default:false})
  isSubmitted: boolean;
}

export type DataCheckListDocument = DataCheckList & Document;
export const DataCheckListSchema = SchemaFactory.createForClass(DataCheckList);