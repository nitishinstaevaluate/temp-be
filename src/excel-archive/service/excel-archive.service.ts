import { Injectable, NotFoundException } from '@nestjs/common';
import { ExcelArchiveDocument } from '../schema/excel-archive.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { catchError } from 'rxjs';
import { ExcelArchiveDto } from '../dto/excel-archive.dto';

@Injectable()
export class ExcelArchiveService {
    constructor(@InjectModel('excelArchive')
    private readonly excelArchiveModel: Model<ExcelArchiveDocument>){}

    async upsertExcel(payload){
        try{
            const id = payload?.id;
            
            if(id){
                const excelArchiveExist = await this.excelArchiveModel.findById(id);
                if(excelArchiveExist){
                    return await this.excelArchiveModel.findOneAndUpdate(
                        { _id: id },
                        {
                          $set: {
                            data: payload.data,
                            importedBy: payload.importedBy,
                            modifiedOn: new Date()
                          },
                        },
                        { new:true }
                    )
                }
                else{
                    throw new NotFoundException({msg:'Record not found', status:false, description:"Id found to be incorrect"})
                }
            }
            else{
                return await new this.excelArchiveModel(payload).save();
            }
        }
        catch(error){
            throw error;
        }
    }
}
