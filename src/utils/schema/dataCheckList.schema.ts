import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps:true, versionKey:false })
export class DataCheckList {
  @Prop({type: String})
  uniqueLinkId: string;

  @Prop()
  valuationDate: Date;

  @Prop({type: String})
  taxRate: string;

  @Prop({type: String})
  outstandingShares: string;
 
  @Prop({type: Date})
  dateOfReport: Date;

  @Prop({type: String})
  appointingAuthority: string;
  
  @Prop({type: Date})
  dateOfAppointment: Date;
  
  @Prop({type: String})
  companyAddress: string;

  @Prop({type: String})
  companyInfo: string;
  
  @Prop({type: String})
  cinNumber: string;
  
  @Prop({type: Date})
  dateOfIncorporation: Date;
  
  @Prop({type: Array<String>})
  natureOfInstrument: Array<string>;

  @Prop({type: Array<String>})
  purposeOfReport: Array<string>;

  @Prop({type: Array<String>})
  section: Array<string>

  @Prop()
  expirationDate: Date;

  @Prop({default:false})
  isSubmitted: boolean;

  @Prop({type:String})
  emailFrom: string;

  @Prop({type:String})
  emailTo: string;

  @Prop({type:String})
  excelSheetId: string;

  @Prop({type:Number, default:1})
  emailSendFrequency: number;
}

export type DataCheckListDocument = DataCheckList & Document;
export const DataCheckListSchema = SchemaFactory.createForClass(DataCheckList);