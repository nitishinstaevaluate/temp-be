import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import {
    BetaIndustry,
    BetaIndustryDocument,
  } from './schema/data-references.schema';

@Injectable()
export class DataReferencesService {}

// Beta Industries Service
@Injectable()
export class BetaIndustriesService {
  constructor(
    @InjectModel('betaIndustry')
    private readonly betaIndustryModel: Model<BetaIndustryDocument>
  ) {}

  async getBetaIndustries(): Promise<BetaIndustry[]> {

    return await this.betaIndustryModel.find().exec();
  }

  async getBetaIndustriesById(id: string): Promise<BetaIndustry[]> {
    return await this.betaIndustryModel.findById(id);
  }
}