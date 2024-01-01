import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export class modelWeightageValue{
    @Prop({ required: true,type:Number,default:0 })
    weightedVal:Number

    @Prop({ required: true,type:[] })
    modelValue:[]
}

@Schema({versionKey:false})
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

    @Prop({ required: true, type: String })
    natureOfInstrument: string;

    @Prop({ required: false, type: [] }) 
    regulationReference: [];

    @Prop({ required: true, type: String }) 
    reportPurpose:string;

    @Prop({ required: false, type: [] }) 
    reportSection:[];

    @Prop({ required: false, type: modelWeightageValue }) 
    modelWeightageValue:modelWeightageValue;

    @Prop({ required: true, type: String }) 
    dateOfIncorporation:string;

    @Prop({ required: true, type: String }) 
    cinNumber:string;

    @Prop({ required: true, type: String }) 
    companyAddress:string;
    
    @Prop({ type:String,default:'' }) 
    fileName:string; 
}

export type ReportDocument = Report & Document;
export const ReportSchema = SchemaFactory.createForClass(Report);
