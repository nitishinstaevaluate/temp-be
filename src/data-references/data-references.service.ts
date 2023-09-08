import { Injectable, Param, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import {
    BetaIndustry,
    BetaIndustryDocument,
    IndustriesRatio,
    IndustriesRatioDocument,
    HistoricalReturns,
    HistoricalReturnsDocument,
    HistoricalBSE500Returns,
    HistoricalBSE500ReturnsDocument,
    IndianTreasuryYield,
    IndianTreasuryYieldDocument
  } from './schema/data-references.schema';

  const date = require('date-and-time');

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
    private readonly historicalReturnsModel: Model<HistoricalReturnsDocument>,
    @InjectModel('historicalBSE500Returns')
    private readonly historicalBSE500ReturnsModel: Model<HistoricalBSE500ReturnsDocument>,
  ) {}

  async getHistoricalReturns(): Promise<HistoricalReturns[]> {
    return await this.historicalReturnsModel.find({'isActive' : true}).sort({ 'year' : 1 }).exec();
  }

  async getHistoricalReturnsById(id: string): Promise<HistoricalReturns[]> {
    return await this.historicalReturnsModel.findById(id);
  }

async getBSE(baseYrs: number,asOnDate: number): Promise<any>{
  
 // Approach. This will be eiter inception, last 5 yrs, 10 yrs, 15 yrs. Latest date will always be valution date. Hence from that date
      // the previous date will be calculated backwards.
    
      var previous_year;
      var open;
      var close;
      
      var valuationDate = new Date(asOnDate);
      close = await this.historicalBSE500ReturnsModel.find({'Date': { "$lt": new Date(valuationDate) }}).sort({ "Date": -1 }).limit(1);
      if (baseYrs === 0){
        open = [{
                'Open':1000
        }];
        previous_year = new Date('1999-08-09');
      } else {
        const negativeBase = -baseYrs;
        previous_year = date.addYears(valuationDate, negativeBase);
        open =  await this.historicalBSE500ReturnsModel.find({'Date': { "$lt": new Date(previous_year) }}).sort({ "Date": -1 }).limit(1);
      }
      const multiplier = date.subtract(valuationDate,previous_year).toDays()/365;
      const factor = close[0].Close/open[0].Open 
      const cagr = factor**(1/multiplier);
      return {
          result: cagr,
          close: close[0],
          open : open[0],
          message:'BSE 500 historical return'
      }
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