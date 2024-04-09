import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Valuation, ValuationDocument } from './schema/valuation.schema';
//Valuations Service
@Injectable()
export class ValuationsService {
  constructor(
    @InjectModel('valuation')
    private readonly valuationModel: Model<ValuationDocument>,
  ) {}

  async createValuation(valuation: any, id?): Promise<string> {
    try {
      if(id){
        return await this.valuationModel.findByIdAndUpdate(id, valuation, {new : true});
      }
      const createdFoo = await this.valuationModel.create(valuation);
      return createdFoo._id;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getValuationById(id: string): Promise<Valuation> {
    return this.valuationModel.findById(id);
  }

  async getValuationsByUserId(userId: string): Promise<Valuation[]> {
    return this.valuationModel.find({ userId: userId }).select('company model valuation createdAt').exec();
  }
}
