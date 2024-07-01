import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class sensitivityAnalysis {
  @Prop({ required: true })
  processStateId: string;

  @Prop({ type: String, required: true })
  primaryReportId: string;

  @Prop({ required: false })
  secondaryReportId: Array<string>;

  @Prop({ required: false })
  selectedReportId: string;

  @Prop({ required: true })
  primaryValuation: Array<object>; 

  @Prop({ required: false, default:'tvCashFlowBased' })
  terminalSelectionType: string; 

  @Prop({ type: Array<object>, required: false })
  secondaryValuation: Array<object>;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ default: () => new Date() })
  modifiedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ required: false })
  deletedAt: Date;
}

export type sensitivityAnalysisDocument = sensitivityAnalysis & Document;
export const sensitivityAnalysisSchema = SchemaFactory.createForClass(sensitivityAnalysis);