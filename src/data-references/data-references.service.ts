import { Injectable, Param, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import {
  // BetaIndustry,
  // BetaIndustryDocument,
  IndustriesRatio,
  IndustriesRatioDocument,
  HistoricalReturns,
  HistoricalReturnsDocument,
  HistoricalBSE500Returns,
  HistoricalBSE500ReturnsDocument,
  IndianTreasuryYield,
  IndianTreasuryYieldDocument,
  PurposeOfReportDocument,
  IndianBetaIndustryDocument,
  HistoricalSensex30ReturnsDocument,
  HistoricalNifty50ReturnsDocument,
  HistoricalBankNiftyReturnsDocument,
} from './schema/data-references.schema';
import { NOTFOUND } from 'dns';
import { EXPECTED_MARKET_RETURN_HISTORICAL_TYPE } from 'src/constants/constants';

const date = require('date-and-time');

@Injectable()
export class DataReferencesService { }

// Beta Industries Service
@Injectable()
export class BetaIndustriesService {
  constructor(
    // @InjectModel('betaIndustry')
    // private readonly betaIndustryModel: Model<BetaIndustryDocument>
    @InjectModel('indianBetaIndustry')
    private readonly indianBetaIndustryModel: Model<IndianBetaIndustryDocument>
  ) { }

  // async getBetaIndustries(): Promise<BetaIndustry[]> {
  //   return await this.betaIndustryModel.find({ 'isActive': true });
  // }

  // async getBetaIndustriesById(id: string): Promise<BetaIndustry[]> {
  //   return await this.betaIndustryModel.findById(id);
  // }
  async getIndianBetaIndustries(){
    return await this.indianBetaIndustryModel.find();
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
    @InjectModel('historicalSensex30Returns')
    private readonly historicalSensex30ReturnsModel: Model<HistoricalSensex30ReturnsDocument>,
    @InjectModel('historicalNifty50Returns')
    private readonly historicalNifty50ReturnsModel: Model<HistoricalNifty50ReturnsDocument>,
    @InjectModel('historicalBankNiftyReturns')
    private readonly historicalBankNiftyReturnsModel: Model<HistoricalBankNiftyReturnsDocument>,
  ) { }

  async getHistoricalReturns(): Promise<HistoricalReturns[]> {
    return await this.historicalReturnsModel.find({ 'isActive': true }).sort({ 'year': 1 }).exec();
  }

  async getHistoricalReturnsById(id: string): Promise<HistoricalReturns[]> {
    return await this.historicalReturnsModel.findById(id);
  }

  async computeHistoricalReturns(baseYrs: number, asOnDate: number, historicalType: any): Promise<any> {
    try {

      // Approach. This will be eiter inception, last 5 yrs, 10 yrs, 15 yrs. Latest date will always be valution date. Hence from that date
      // the previous date will be calculated backwards.

      const newAsOnDate = (asOnDate/1000 + 24*60*60) * 1000;
      let valuationDate = new Date(newAsOnDate);

      let  cagr, openingValue, closingValue;
      if (baseYrs === 0) {
        ({ cagr, openingValue, closingValue } = await this.calculateCagr(valuationDate, baseYrs, historicalType, true));
      } else {
        ({ cagr, openingValue, closingValue } = await this.calculateCagr(valuationDate, baseYrs, historicalType, false));
      }
      return {
        result: cagr,
        valuationDate : valuationDate,
        close: closingValue[0],
        open: openingValue[0],
        message: `${historicalType} historical return CAGR in %`,
        status: true
      }
    }
    catch (err) {
      return {
        status: false,
        msg: `${historicalType} Request Failed`,
        error: err.message
      }
    }
  }

  async calculateCagr(valuationDate, baseYrs, historicalType, isSinceInception){
    try{
      /**
       * Closing Date data should always come from the date of valuation 
      */
      const closingData = await this.getHistoricalReturn(valuationDate, historicalType);

      // Check if it is since inception (baseYrs = 0)
      if(isSinceInception){
        const { openingValue, previousYear } = await this.getInceptionReturn(historicalType);
    
        // CAGR operations
        const multiplier = date.subtract(valuationDate, previousYear).toDays() / 365;
        const factor = closingData.data[0].Close / openingValue[0].Close
        const cagr = ((factor ** (1 / multiplier)) - 1) * 100;
        return { cagr, openingValue, closingValue: closingData.data};
      }
      else{
        // Calculating new  date by subtracting number of base years from valuation date
        const negativeBase = -baseYrs;
        const previousYear = date.addYears(valuationDate, negativeBase);

        // Fetching data for the above subtracted date
        const { data: openingValue} = await this.getHistoricalReturn(previousYear, historicalType);

        // CAGR operations
        const multiplier = date.subtract(valuationDate, previousYear).toDays() / 365;
        const factor = closingData.data[0].Close / openingValue[0].Close
        const cagr = ((factor ** (1 / multiplier)) - 1) * 100;
        return { cagr, openingValue, closingValue: closingData.data};
      }
    }
    catch(error){
      return{
        error,
        msg:"cagr computation failed",
        status:false
      }
    }
  }

  async getInceptionReturn(historicalType){
    let previousYear;
    let openingValue = [
      {
        'Open': 0,
        'Close': 1000,
      }
    ];

    if(historicalType === EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.BSE500.value){
     previousYear = new Date(EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.BSE500.historicalDate);    
    }
    else if(historicalType === EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.BSE_SENSEX30.value){
      openingValue[0]['Close'] = EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.BSE_SENSEX30.historicalValue;
      previousYear = new Date(EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.BSE_SENSEX30.historicalDate);  
    }
    else if(historicalType === EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.NIFTY50.value){
      previousYear = new Date(EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.NIFTY50.historicalDate);  
    }
    else{   //bank nifty default 
      previousYear = new Date(EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.BANK_NIFTY.historicalDate);  
    }
    return { openingValue, previousYear };
  }

  async getHistoricalReturn(valuationDate, historicalType){
    /**
    * It is possible Market was closed on a give date hence we choose the most recent available data from DB/Service. If value is null choose the next best
    */
    let data;
    if(historicalType === EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.BSE500.value){
      data = await this.historicalBSE500ReturnsModel.find({ 'Date': { "$lte": new Date(valuationDate)},'Close': { $ne: null }}).sort({ "Date": -1 }).limit(1);
    }
    else if(historicalType === EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.BSE_SENSEX30.value){
      data = await this.historicalSensex30ReturnsModel.find({ 'Date': { "$lte": new Date(valuationDate)},'Close': { $ne: null }}).sort({ "Date": -1 }).limit(1);
    }
    else if(historicalType === EXPECTED_MARKET_RETURN_HISTORICAL_TYPE.NIFTY50.value){
      data = await this.historicalNifty50ReturnsModel.find({ 'Date': { "$lte": new Date(valuationDate)},'Close': { $ne: null }}).sort({ "Date": -1 }).limit(1);
    }
    else{ //bank nifty default 
      data = await this.historicalBankNiftyReturnsModel.find({ 'Date': { "$lte": new Date(valuationDate)},'Close': { $ne: null }}).sort({ "Date": -1 }).limit(1);
    }
    return { data:data || [] };
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
  
  async getMultiplePurposeOfReport(reportPurpose) {
    const purpose = reportPurpose.split(",")
    const purposeDetails = await this.reportPurpose.find({ reportObjective: { $in: purpose } }).exec();
    let reportPurposes=[];
    for await (const indPurposeDetails of purposeDetails){
      reportPurposes.push(...indPurposeDetails.reportPurpose)
    }
    return {
      status:true,
      reportPurpose,
      reportPurposes
    }
  }
}