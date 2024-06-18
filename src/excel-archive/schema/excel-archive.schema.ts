import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey:false })
export class ExcelArchive {
    @Prop({ type: String })
    fileName: string;

    @Prop({ type: String })
    sheetName: string;

    @Prop({ type: Number })
    rowCount: number;

    @Prop({ type: String })
    fileSize: string;

    @Prop({ type: String })
    fileType: string;

    @Prop({ type: String })
    importedBy: string;

    @Prop({ type: String })
    status: string;

    @Prop({ type: Array<Object>, required:true })
    data: Array<object>;

    @Prop({ default: () => new Date(), required: false })
    createdOn: Date;

    @Prop({ default: () => new Date(), required: false })
    modifiedOn: Date;
}

export type ExcelArchiveDocument = ExcelArchive & Document;
export const ExcelArchiveSchema = SchemaFactory.createForClass(ExcelArchive);