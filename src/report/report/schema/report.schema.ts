import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema()
export class Report {
    @Prop({ type: String })
    clientName: string;
  
    @Prop({ required: true, type: [] }) 
    registeredValuerDetails: [];

    @Prop({ required: false, type: [] }) 
    appointeeDetails: [];
  
    @Prop({ required: true, type: String })
    reportId: string;
  
    @Prop({ default: false, type: Boolean })
    useExistingValuer: boolean;

    @Prop({ required: true, type: Date, default: Date.now })
    reportDate: Date;
}

export type ReportDocument = Report & Document;
export const ReportSchema = SchemaFactory.createForClass(Report);
