import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import {
    BetaIndustry,
    BetaIndustryDocument,
    IndustriesRatio,
    IndustriesRatioDocument,
    HistoricalReturns,
    HistoricalReturnsDocument,
    IndianTreasuryYield,
    IndianTreasuryYieldDocument
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
    return await this.betaIndustryModel.find({'isActive': true});
  }

  async getBetaIndustriesById(id: string): Promise<BetaIndustry[]> {
    return await this.betaIndustryModel.findById(id);
  }
}

// Industries Ratio Service
@Injectable()
export class IndustriesRatioService {
  constructor(
    @InjectModel('industriesRatio')
    private readonly industriesRatioModel: Model<IndustriesRatioDocument>
  ) {}

  async getIndustriesRatio(): Promise<IndustriesRatio[]> {
    return await this.industriesRatioModel.find({'isActive' : true}).exec();
  }

  async getIndustriesRatioById(id: string): Promise<IndustriesRatio[]> {
    return await this.industriesRatioModel.find({'industryId':id});
  }
}

// Historical Returns Service
@Injectable()
export class HistoricalReturnsService {
  constructor(
    @InjectModel('historicalReturns')
    private readonly historicalReturnsModel: Model<HistoricalReturnsDocument>
  ) {}

  async getHistoricalReturns(): Promise<HistoricalReturns[]> {
    return await this.historicalReturnsModel.find({'isActive' : true}).sort({ 'year' : 1 }).exec();
  }

  async getHistoricalReturnsById(id: string): Promise<HistoricalReturns[]> {
    return await this.historicalReturnsModel.findById(id);
  }
}

// Indian Treasury Yield Service
@Injectable()
export class IndianTreasuryYieldService {
  constructor(
    @InjectModel('indianTreasuryYield')
    private readonly indianTresauryYieldModel: Model<IndianTreasuryYieldDocument>
  ) {}

  async getIndianTreasuryYield(): Promise<IndianTreasuryYield[]> {
    return (await this.indianTresauryYieldModel.find({'maturityInYrs': {$in :[5,10,20,30]}}).sort({ 'maturityInYrs' : 1 }).exec());
  }

  async getIndianTreasuryYieldById(id: string): Promise<IndianTreasuryYield[]> {
    return await this.indianTresauryYieldModel.findById(id);
  }
}