import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Valuation,ValuationDocument } from './schema/valuation.schema';

//Valuations Service
@Injectable()
export class ValuationsService {
    constructor(
        @InjectModel('valuation') private readonly valuationModel: Model<ValuationDocument>) {}
    
      async createValuation(valuation:object): Promise<Valuation> {
        return this.valuationModel.create(valuation);
    }

      async getValuations(): Promise<Valuation[]> {
        return this.valuationModel.find().exec();
      }
    
}