import { Injectable } from '@nestjs/common';
import {
  netWorthOfCompany,
  profitLossValues,
  ebitdaMethod,
  debtMethod,
  incomeFromOperation,
  netWorthOfComp,
  cashAndCashEquivalent,
} from 'src/excelFileServices/relativeValuation.methods';

import {
  getShareholderFunds,
} from 'src/excelFileServices/fcfeAndFCFF.method';
import {
  getYearsList,
  findAverage,
  findMedian,
} from '../excelFileServices/common.methods';
import { columnsList } from '../excelFileServices/excelSheetConfig';
import { CustomLogger } from 'src/loggerService/logger.service';
import { GET_MULTIPLIER_UNITS, RELATIVE_PREFERENCE_RATIO } from 'src/constants/constants';
import { versionTwoNetWorthOfCompany, versionTwoProfitLossValues } from 'src/excelFileServices/v2-relative-valuation.method';
@Injectable()
export class RelativeValuationService {
  constructor(private readonly customLogger: CustomLogger) {}
  async Relative_Valuation(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
    // companiesInfo: any,
  ): Promise<any> {
 try{
     this.customLogger.log({
      message: 'Request is entered into Relative Valuation Service.',
      userId: inputs.userId,
    });
    const { outstandingShares, discountRateValue, valuationDate } = inputs;
    const years = await getYearsList(worksheet1);
    let multiplier = GET_MULTIPLIER_UNITS[`${inputs.reportingUnit}`];
    if (years === null)
      return {
        result: null,
        msg: 'Please Separate Text Label and year with comma in B1 Cell in P&L Sheet1.',
      };
    const year = new Date(valuationDate).getFullYear().toString();
    const columnIndex = years.indexOf(year);
    console.log(columnsList[columnIndex], columnIndex, year);
    
    const column = columnsList[columnIndex];
    // const column = 1;
    const companies = inputs.companies;
    const industries = inputs.industries;
    const ratiotypebased = inputs.type;
    // const peRatio = [];
    // const pbRatio = [];
    // const ebitda = [];
    // const sales = [];
    var companiesInfo: any;
    let colNum =1;

    let newPeRatioAvg,newPeRatioMed, newPbRatioAvg, newPbRatioMed, newEbitdaAvg, newEbitdaMed, newSalesAvg, newSalesMed;
    

      companies.map((indCompanies)=>{
        if(indCompanies.company === 'Average'){
          newPeRatioAvg = indCompanies.peRatio.toFixed(2) * (1-discountRateValue/100);
          newPbRatioAvg = indCompanies.pbRatio.toFixed(2) * (1-discountRateValue/100);
          newEbitdaAvg = indCompanies.ebitda.toFixed(2) * (1-discountRateValue/100);
          newSalesAvg = indCompanies.sales.toFixed(2) * (1-discountRateValue/100);
        }
        if(indCompanies.company === 'Median'){
          newPeRatioMed = indCompanies.peRatio.toFixed(2) * (1-discountRateValue/100);
          newPbRatioMed = indCompanies.pbRatio.toFixed(2) * (1-discountRateValue/100);
          newEbitdaMed = indCompanies.ebitda.toFixed(2) * (1-discountRateValue/100);
          newSalesMed = indCompanies.sales.toFixed(2) * (1-discountRateValue/100);
        }
      })
    // const companiesInfo = {
    //   peRatioAvg: findAverage(peRatio),
    //   peRatioMed: findMedian(peRatio),
    //   pbRatioAvg: findAverage(pbRatio),
    //   pbRatioMed: findMedian(pbRatio),
    //   ebitdaAvg: findAverage(ebitda),
    //   ebitdaMed: findMedian(ebitda),
    //   salesAvg: findAverage(sales),
    //   salesMed: findMedian(sales),
    // };
    
    // if (inputs.type == 'manual') {                // Make it smarter in next release
    //   companies.map((company) => {
    //     peRatio.push(company.peRatio);
    //     pbRatio.push(company.pbRatio);
    //     ebitda.push(company.ebitda);
    //     sales.push(company.sales);
    //   });

    //    companiesInfo = {
    //     peRatioAvg: findAverage(peRatio),
    //     peRatioMed: findMedian(peRatio),
    //     pbRatioAvg: findAverage(pbRatio),
    //     pbRatioMed: findMedian(pbRatio),
    //     ebitdaAvg: findAverage(ebitda),
    //     ebitdaMed: findMedian(ebitda),
    //     salesAvg: findAverage(sales),
    //     salesMed: findMedian(sales),
    //   };
    // } else if (inputs.preferenceRatioSelect == RELATIVE_PREFERENCE_RATIO[0]){
    //     companiesInfo = {
    //     peRatioAvg: industries[0].currentPE,
    //     peRatioMed: industries[0].currentPE,
    //     pbRatioAvg: industries[0].pbv,
    //     pbRatioMed: industries[0].pbv,
    //     ebitdaAvg: industries[0].evEBITDA_PV,
    //     ebitdaMed: industries[0].evEBITDA_PV,
    //     salesAvg: industries[0].priceSales,
    //     salesMed: industries[0].priceSales,
    //   };
    // }
    // else if (inputs.preferenceRatioSelect === RELATIVE_PREFERENCE_RATIO[1]){
    //   companies.map((company) => {
    //     peRatio.push(company.peRatio);
    //     pbRatio.push(company.pbRatio);
    //     ebitda.push(company.ebitda);
    //     sales.push(company.sales);
    //   });
    //   companiesInfo = {
    //     peRatioAvg: findAverage(peRatio),
    //     peRatioMed: findMedian(peRatio),
    //     pbRatioAvg: findAverage(pbRatio),
    //     pbRatioMed: findMedian(pbRatio),
    //     ebitdaAvg: findAverage(ebitda),
    //     ebitdaMed: findMedian(ebitda),
    //     salesAvg: findAverage(sales),
    //     salesMed: findMedian(sales),
    //   }
    // }
    //   else
    //     // Do nothing for now
    //   ;

    // const abc= await netWorthOfComp(column, worksheet2);
    // console.log('Hello Abc - ', abc);

    // Valuation based on P/B Ratio

    // version 1 starts
    // const prefShareCap = await netWorthOfCompany(colNum, worksheet2);
    // let netWorth = 0;
    // netWorth = await getShareholderFunds(0, worksheet2);        // Always need the first column
    // version 1 ends
    let netWorth = await versionTwoNetWorthOfCompany(0, worksheet2);

    const bookValue = netWorth * multiplier / outstandingShares;
    const pbMarketPriceAvg = netWorth * newPbRatioAvg.toFixed(2);
    const pbMarketPriceMed = netWorth * newPbRatioMed.toFixed(2);

    // Valuation based on P/E Ratio
    // version 1 starts
    // let resProfitLoss = await profitLossValues(colNum-1, worksheet1);
    // let eps = (resProfitLoss.profitLossForYear * multiplier) / outstandingShares;
    // const peMarketPriceAvg = resProfitLoss.profitLossForYear * newPeRatioAvg;
    // const peMarketPriceMed = resProfitLoss.profitLossForYear * newPeRatioMed;
    // version 1 ends
    let profitLossOfYear = await versionTwoProfitLossValues(0, worksheet1);
    const peMarketPriceAvg = profitLossOfYear * newPeRatioAvg.toFixed(2);
    const peMarketPriceMed = profitLossOfYear * newPeRatioMed.toFixed(2);

    // Valuation based on EV/EBITDA
    const ebitdaValue = await ebitdaMethod(colNum-1, worksheet1);
    const cashEquivalent = await cashAndCashEquivalent(colNum-1, worksheet2);
    const enterpriseAvg = ebitdaValue * newEbitdaAvg.toFixed(2);
    const enterpriseMed = ebitdaValue * newEbitdaMed.toFixed(2);

    const debt = await debtMethod(colNum-1, worksheet2);

    const ebitdaEquityAvg = enterpriseAvg - debt + cashEquivalent;
    const ebitdaEquityMed = enterpriseMed - debt + cashEquivalent;
    const ebitdaMarketPriceAvg = ebitdaEquityAvg * multiplier/ outstandingShares;
    const ebitdaMarketPriceMed = ebitdaEquityMed* multiplier / outstandingShares;

    // Valuation based on Price/Sales
    const salesValue = await incomeFromOperation(colNum-1, worksheet1);
    const salesEquityAvg = salesValue * newSalesAvg.toFixed(2);
    const salesEquityMed = salesValue * newSalesMed.toFixed(2);
    const salesMarketPriceAvg = salesEquityAvg / outstandingShares;
    const salesMarketPriceMed = salesEquityMed  / outstandingShares;

    const avgPricePerShareAvg = findAverage([
      pbMarketPriceAvg,
      peMarketPriceAvg,
      // ebitdaMarketPriceAvg,
      ebitdaEquityAvg,
      salesEquityAvg,
    ]);
    const avgPricePerShareMed = findAverage([
      pbMarketPriceMed,
      peMarketPriceMed,
      // ebitdaMarketPriceMed,
      ebitdaEquityMed,
      salesEquityMed,
    ]);

    const locAvg = avgPricePerShareAvg;
    const locMed = avgPricePerShareAvg;
    const finalPriceAvg = avgPricePerShareAvg - locAvg;
    const finalPriceMed = avgPricePerShareMed - locMed;
    const fairValuePerShareAvg = avgPricePerShareAvg * multiplier / outstandingShares;
    const fairValuePerShareMed = avgPricePerShareAvg * multiplier / outstandingShares

    // const tentativeIssuePrice = Math.round(
    //   findAverage([finalPriceAvg, finalPriceMed]),
    // );
    const finalResult = {
      companies: companies,
      companiesInfo: companiesInfo,
      industries : industries,
      ratiotypebased : ratiotypebased,
      valuation: [
        {
          particular: 'pbRatio',
          netWorthAvg: netWorth,
          netWorthMed: netWorth,
          pbSharesAvg: outstandingShares,
          pbSharesMed: outstandingShares,
          bookValueAvg: bookValue,
          bookValueMed: bookValue,
          pbRatioAvg: newPbRatioAvg,
          pbRatioMed: newPbRatioMed,
          pbMarketPriceAvg: pbMarketPriceAvg,
          pbMarketPriceMed: pbMarketPriceMed,
        },
        {
          particular: 'peRatio',
          pat:profitLossOfYear,
          // version 1 starts
          // epsAvg: eps,
          // epsMed: eps,
          // version 1 ends
          peRatioAvg: newPeRatioAvg,
          peRatioMed: newPeRatioMed,
          peMarketPriceAvg: peMarketPriceAvg,
          peMarketPriceMed: peMarketPriceMed,
        },
        {
          particular: 'ebitda',
          ebitda: ebitdaValue,
          // ebitdaAvg: ebitdaAvg,
          // ebitdaMed: ebitdaAvg,
          evAvg: newEbitdaAvg,
          evMed: newEbitdaMed,
          enterpriseAvg: enterpriseAvg,
          enterpriseMed: enterpriseMed,
          debtAvg: debt,
          debtMed: debt,
          cashEquivalent: cashEquivalent,
          ebitdaEquityAvg: ebitdaEquityAvg,
          ebitdaEquityMed: ebitdaEquityMed,
          ebitdaSharesAvg: outstandingShares,
          ebitdaSharesMed: outstandingShares,
          ebitdaMarketPriceAvg: ebitdaMarketPriceAvg,
          ebitdaMarketPriceMed: ebitdaMarketPriceMed,
        },
        {
          particular: 'sales',
          salesAvg: salesValue,
          salesMed: salesValue,
          salesRatioAvg: newSalesAvg,
          salesRatioMed: newSalesMed,
          salesEquityAvg: salesEquityAvg,
          salesEquityMed: salesEquityMed,
          salesSharesAvg: outstandingShares,
          salesSharesMed: outstandingShares,
          salesMarketPriceAvg: salesMarketPriceAvg,
          salesMarketPriceMed: salesMarketPriceMed,
        },
        {
          particular: 'result',
          avgPricePerShareAvg: avgPricePerShareAvg,
          avgPricePerShareMed: avgPricePerShareMed,
          // averageAvg: avgPricePerShareAvg,
          // averageMed: avgPricePerShareMed,
          locAvg: locAvg,
          locMed: locMed,
          finalPriceAvg: finalPriceAvg,
          finalPriceMed: finalPriceMed,
          outstandingShares: outstandingShares,
          // outstandingShares: outstandingShares,
          fairValuePerShareAvg: fairValuePerShareAvg,
          fairValuePerShareMed:fairValuePerShareMed,

          // tentativeIssuePrice: tentativeIssuePrice,
        },
      ],
    };
    this.customLogger.log({
      message: 'Request is sucessfully executed in Relative Valuation Service.',
      userId: inputs.userId,
    });
    return {
      result: finalResult,
      valuation: { finalPriceAvg: avgPricePerShareAvg, finalPriceMed: avgPricePerShareAvg },
      msg: 'Executed Successfully',
    };
 }
 catch(error){
  console.log("Relative Valuation Error:",error);
  throw error;
 }
  }
}
