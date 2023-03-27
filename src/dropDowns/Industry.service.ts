import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Industry, IndustryDocument } from './schema/industries.schema';

@Injectable()
export class IndustriesService {
    constructor(
        @InjectModel('industry') private readonly industryModel: Model<IndustryDocument>,
      ) {}
    
      async createIndustry(industry:object): Promise<Industry> {
        return this.industryModel.create(industry);
    }
      async getIndustries(): Promise<Industry[]> {
        return this.industryModel.find().exec();
      }
}
