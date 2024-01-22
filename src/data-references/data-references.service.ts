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
  IndianTreasuryYieldDocument,
  PurposeOfReportDocument
} from './schema/data-references.schema';

const date = require('date-and-time');

@Injectable()
export class DataReferencesService { }

// Beta Industries Service
@Injectable()
export class BetaIndustriesService {
  constructor(
    @InjectModel('betaIndustry')
    private readonly betaIndustryModel: Model<BetaIndustryDocument>
  ) { }

  async getBetaIndustries(): Promise<BetaIndustry[]> {
    return await this.betaIndustryModel.find({ 'isActive': true });
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
  ) { }

  async getIndustriesRatio(): Promise<IndustriesRatio[]> {
    return await this.industriesRatioModel.find({ 'isActive': true }).exec();
  }

  async getIndustriesRatioById(id: string): Promise<IndustriesRatio[]> {
    return await this.industriesRatioModel.find({ 'industryId': id });
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
  ) { }

  async getHistoricalReturns(): Promise<HistoricalReturns[]> {
    return await this.historicalReturnsModel.find({ 'isActive': true }).sort({ 'year': 1 }).exec();
  }

  async getHistoricalReturnsById(id: string): Promise<HistoricalReturns[]> {
    return await this.historicalReturnsModel.findById(id);
  }

  async getBSE(baseYrs: number, asOnDate: number): Promise<any> {
    try {

      // Approach. This will be eiter inception, last 5 yrs, 10 yrs, 15 yrs. Latest date will always be valution date. Hence from that date
      // the previous date will be calculated backwards.

      let previous_year;
      let open;
      let close;
      const newAsOnDate = (asOnDate/1000 + 24*60*60) * 1000;
      let valuationDate = new Date(newAsOnDate);

      // It is possible Market was closed on a give date hence we choose the most recent available data from DB/Service. If value is null choose the next best
      close = await this.historicalBSE500ReturnsModel.find({ 'Date': { "$lte": new Date(valuationDate)},'Close': { $ne: null }}).sort({ "Date": -1 }).limit(1);
      if (baseYrs === 0) {
        open = [
          {
            'Open': 0,
            'Close': 1000,
          }
        ];
        previous_year = new Date('1999-02-01');                 // Move to config file later.
      } else {
        const negativeBase = -baseYrs;
        previous_year = date.addYears(valuationDate, negativeBase);
        open = await this.historicalBSE500ReturnsModel.find({ 'Date': { "$lte": new Date(previous_year)},'Close': { $ne: null }}).sort({ "Date": -1 }).limit(1);
      }
      const multiplier = date.subtract(valuationDate, previous_year).toDays() / 365;
      console.log(multiplier);
      const factor = close[0].Close / open[0].Close
      const cagr = ((factor ** (1 / multiplier)) - 1) * 100;
      return {
        result: cagr,
        valuationDate : valuationDate,
        close: close[0],
        open: open[0],
        message: 'BSE 500 historical return CAGR in %',
        status: true
      }
    }
    catch (err) {
      return {
        status: false,
        msg: 'BSE 500 Request Failed',
        error: err.message
      }
    }
  }

  async getHistoricalBSE500Date(date){
    try{
      const newAsOnDate = (date/1000 + 24*60*60) * 1000;
      let valuationDate = new Date(newAsOnDate);

      return await this.historicalBSE500ReturnsModel.findOne({ 'Date': { "$lte": new Date(valuationDate)},'Close': { $ne: null }}).sort({ "Date": -1 }).limit(1);
    }
    catch(error){
      return {
        error:error,
        status:false,
        msg:"historical BSE500 date not found"
      }
    }
  }
}

// Indian Treasury Yield Service
@Injectable()
export class IndianTreasuryYieldService {
  constructor(
    @InjectModel('indianTreasuryYield')
    private readonly indianTresauryYieldModel: Model<IndianTreasuryYieldDocument>
  ) { }

  async getIndianTreasuryYield(): Promise<IndianTreasuryYield[]> {
    return (await this.indianTresauryYieldModel.find({ 'maturityInYrs': { $in: [5, 10, 20, 30] } }).sort({ 'maturityInYrs': 1 }).exec());
  }

  async getIndianTreasuryYieldById(id: string): Promise<IndianTreasuryYield[]> {
    return await this.indianTresauryYieldModel.findById(id);
  }
}

@Injectable()
export class PurposeOfReportService {
  constructor(
    @InjectModel('purposeOfReport')
    private readonly reportPurpose: Model<PurposeOfReportDocument>
  ) { }

  async addPurposeOfReport(purpose) {
    return await this.reportPurpose.create(purpose);
  }

  async getPurposeOfReport(reportPurpose) {
    return await this.reportPurpose.findOne({ reportObjective: reportPurpose }).exec();
  }
}