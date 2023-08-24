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

  async createValuation(valuation: object): Promise<string> {
    try {
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

  async paginateValuationByUserId(userId: string, page: number, pageSize: number) {
    try{
      const skip = (page - 1) * pageSize;

      const totalPage = await this.getValuationsByUserId(userId);
  
      const response = await this.valuationModel
      .find({ userId: userId })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }) 
      .select('company model valuation createdAt')
      .exec();
  
      return { response:response, totalPage:Math.ceil(totalPage.length/pageSize)};
    }
    catch (error){
      throw new NotFoundException({error,message:'Something went wrong'})
    }
  }
}
