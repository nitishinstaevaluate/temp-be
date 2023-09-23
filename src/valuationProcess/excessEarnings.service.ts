import { Injectable } from '@nestjs/common';
import { IndustryService } from 'src/industry/industry.service';

import {
  getShareholderFunds,
  GetPAT,
  CapitalStruc,
} from 'src/excelFileServices/fcfeAndFCFF.method';
import {
  getYearsList,
  findAverage,
  findMedian,
  getDiscountingPeriod,
  calculateDaysFromDate,
  getCellValue
} from '../excelFileServices/common.methods';
import { sheet1_PLObj, sheet2_BSObj, columnsList } from '../excelFileServices/excelSheetConfig';
import { CustomLogger } from 'src/loggerService/logger.service';
import { TerminalGrowthRate } from 'src/masters/schema/masters.schema';
@Injectable()
export class ExcessEarningsService {
  constructor(
    private readonly industryService: IndustryService,
    private readonly customLogger: CustomLogger) { }
  discountingFactorWACC: any;
  stubAdjRequired: boolean = false;
  async Excess_Earnings(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
    // companiesInfo: any,
  ): Promise<any> {
    this.customLogger.log({
      message: 'Request is entered into Excess Earnings Model Service.',
      userId: inputs.userId,
    });
    console.log('Inside Excess Earnings');
    const { outstandingShares, discountRateValue, valuationDate, discountingPeriod } = inputs;
    const years = await getYearsList(worksheet1);
    let multiplier = 100000;
    if (years === null)
      return {
        result: null,
        msg: 'Please Separate Text Label and year with comma in B1 Cell in P&L Sheet1.',
      };
    const year = new Date(valuationDate).getFullYear().toString();
    const columnIndex = years.indexOf(year);
    console.log(columnsList[columnIndex], columnIndex, year);

    const column = columnsList[columnIndex];

    const discountingPeriodObj = await getDiscountingPeriod(
      discountingPeriod
    );

    var vdate = await calculateDaysFromDate(new Date(inputs.valuationDate));
    // console.log('Days left ',vdate);
    // var vdayLeft = 365 - vdate;
    console.log('total days ', vdate.totalDays);
    console.log('is leap ', vdate.isLeapYear);
    if (vdate.dateDiff < vdate.totalDays) {
      this.stubAdjRequired = true;
    }

    let discountingPeriodValue = 0;
    let calculatedWacc = 0;
    let patAtPerpetuity = 0;
        let expectedProfitCOEAtPerpetuity = 0;
        let excessReturnAtPerpetuity = 0;
        let pvExcessReturnAtPerpetuity = 0;
        let netWorthAtPerpetuity = 0;
    
    if (discountingPeriodObj.result == null) return discountingPeriodObj;
    discountingPeriodValue = discountingPeriodObj.result;

    let valuation = null;
    let finalWacc = 0;
    let finalDebt = 0;
    let yearstoUse = years.slice(0, -1);
    let yearsLength = years.length;
    const yearLengthT = yearsLength - 1;
    let sumOfCashFlows = 0;
    let presentValueOfExcessReturn = 0;
    var bookValueAsOnDate;

    console.log('Discoun Val ', discountingPeriodValue);

    let fractionOfYearLeft = this.stubAdjRequired == true ? (vdate.dateDiff - 1) / vdate.totalDays : vdate.dateDiff / vdate.totalDays;            // Adjust based on next fiscal year
    console.log('Faction Year left ', fractionOfYearLeft);
    discountingPeriodValue = fractionOfYearLeft * discountingPeriodValue;
    console.log('Running Excess Earnings');
    const finalResult = await Promise.all(
      years.map(async (year: string, i: number) => {

        let result = {};

        let netWorth = await getShareholderFunds(i + 1, worksheet2);          // This is shareholder funds
        let pat = await GetPAT(i + 1, worksheet1);
        
        const adjustedCostOfEquity = await this.industryService.CAPM_Method(inputs);
        const expectedProfitCOE = netWorth * adjustedCostOfEquity;
        const excessReturn = pat - expectedProfitCOE;

        if (i === yearLengthT && inputs.model.includes('Excess_Earnings')) {
          discountingPeriodValue = discountingPeriodValue - 1;
        }
        
        if (inputs.model.includes('Excess_Earnings')) {
          if (i === yearLengthT) {
            // Do nothing
          } else {
            this.discountingFactorWACC = 1/ (1+adjustedCostOfEquity/100) ** (discountingPeriodValue)
          }
        }
        
        console.log('Excess years',i,"-",yearLengthT);
        if  (i === yearLengthT && inputs.model.includes('Excess_Earnings')) {
          console.log("i am inside",pat);
          patAtPerpetuity = await this.patPP(pat, inputs.terminalGrowthRate);
          console.log(patAtPerpetuity);
          netWorthAtPerpetuity = netWorth + patAtPerpetuity;
          expectedProfitCOEAtPerpetuity = netWorth * adjustedCostOfEquity;
          excessReturnAtPerpetuity = (patAtPerpetuity - expectedProfitCOEAtPerpetuity)/(adjustedCostOfEquity - parseFloat(inputs.terminalGrowthRate));
          pvExcessReturnAtPerpetuity = excessReturnAtPerpetuity * this.discountingFactorWACC;
        }
        console.log(patAtPerpetuity,"----",pat,'----',inputs.terminalGrowthRate) ;
        presentValueOfExcessReturn = excessReturn * this.discountingFactorWACC;
        sumOfCashFlows = presentValueOfExcessReturn + sumOfCashFlows + pvExcessReturnAtPerpetuity;

        bookValueAsOnDate = await getShareholderFunds(i, worksheet2);
        
        // const netProfitAtPerpetuity = 1 * (1 + parseFloat(TerminalGrowthRate))     //=+F6*(1+Sheet2!C9)

        result = {
          particulars: (i === yearLengthT) ? 'Perpetuity' : `${year}-${parseInt(year) + 1}`,
          netWorth: (i === yearLengthT) ? netWorthAtPerpetuity : netWorth,
          pat: (i === yearLengthT) ? (pat * (1 + parseFloat(inputs.terminalGrowthRate)/100)) : pat,
          expectedProfitCOE: (i === yearLengthT) ? expectedProfitCOEAtPerpetuity : expectedProfitCOE,
          excessReturn: (i === yearLengthT) ? excessReturnAtPerpetuity : excessReturn,
          discountingPeriod: discountingPeriodValue,
          discountingFactor: this.discountingFactorWACC,
          presentValueOfExcessReturn: (i === yearLengthT) ?pvExcessReturnAtPerpetuity : presentValueOfExcessReturn,
          sumOfCashFlows: '',
          bookValue: i > 0 ? '' : bookValueAsOnDate,
          equityValue: '',
          noOfShares: i > 0 ? '' : outstandingShares,
          valuePerShare: ''
        };
        
        discountingPeriodValue = discountingPeriodValue + 1;
        return result;
      })
    )
    finalResult[0].sumOfCashFlows = sumOfCashFlows;
    finalResult[0].equityValue = bookValueAsOnDate + sumOfCashFlows;
    finalResult[0].valuePerShare = (finalResult[0].equityValue * 100000) / outstandingShares;       // Applying mulitplier for figures
    
    const data = await this.transformData(finalResult);
    
    return {
      result: finalResult,
      tableData:data,
      valuation: finalResult[0].valuePerShare, //to be defined
      message: 'Valuation calcuated using excess earnings model',
      status: true
    }
  }

  async patPP(an,bb){
    console.log(an * (1 + parseFloat(bb)/100));
    return an * (1 + parseFloat(bb)/100);
  }

  async transformData(data: any[]) { //only to render data on UI table
    const transformedData = [];
    const columnHeaders = data.length > 0 ? Object.keys(data[0]) : [];

    const columnIndexToRemove = columnHeaders.indexOf('particulars');
    if (columnIndexToRemove !== -1) {
      columnHeaders.splice(columnIndexToRemove, 1);
    }

    columnHeaders.unshift('particulars');
    transformedData.push(columnHeaders);

    for (const item of data) {
      const row = [];
      row.push(item.particulars);
      for (const key of columnHeaders.slice(1)) {
        row.push(item[key]);
      }
      transformedData.push(row);
    }
  return transformedData
  }
}

