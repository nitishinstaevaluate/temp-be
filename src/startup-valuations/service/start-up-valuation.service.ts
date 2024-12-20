import { Injectable, NotFoundException } from '@nestjs/common';
import { StartupValuationDto } from '../dto/startup-valuation.dto';
import { BerkusService } from './berkus.service';
import { StartupValuationDocument } from '../schema/startup-valuation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StartUpValuationService {

    constructor(@InjectModel('startupValuation')
    private readonly startupValuationModel: Model<StartupValuationDocument>,
    private berkusService: BerkusService){}

    async upsertValuation(payload){
        try{

            const pid = payload?.processStateId;

            if(!pid) throw new NotFoundException('PID not found').getResponse();

            switch(true){
                case payload.hasOwnProperty('berkus'):
                    return await this.berkusService.upsert(payload);
                default:
                    return await this.startupValuationModel.findOne({ processStateId: pid }).lean();
            }
            
        }
        catch(error){
            throw error;
        }
    }
}
