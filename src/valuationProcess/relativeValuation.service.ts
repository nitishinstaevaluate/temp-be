import { Injectable } from '@nestjs/common';
import {
  netWorthOfCompany,
  profitLossValues,
  ebitdaMethod,
  debtMethod,
  incomeFromOperation,
  netWorthOfComp,
} from 'src/excelFileServices/relativeValuation.methods';

import {
  getShareholderFunds,
} from 'src/excelFileServices/fcfeAndFCFF.method';
import {getYearsList ,findAverage, findMedian } from '../excelFileServices/common.methods';
import { columnsList } from '../excelFileServices/excelSheetConfig';

@Injectable()
export class RelativeValuationService {
  async Relative_Valuation(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
    // companiesInfo: any,
  ): Promise<any> {
    const { outstandingShares, discountRateValue, valuationDate } = inputs;
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
    // const column = 1;
    const companies = inputs.companies;
    const industries = inputs.industries;
    const ratiotypebased = inputs.type;
    const peRatio = [];
    const pbRatio = [];
    const ebitda = [];
    const sales = [];
    var companiesInfo: any;
    let colNum =1;
    
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
    
    if (inputs.type == 'manual') {                // Make it smarter in next release
      companies.map((company) => {
        peRatio.push(company.peRatio);
        pbRatio.push(company.pbRatio);
        ebitda.push(company.ebitda);
        sales.push(company.sales);
      });

       companiesInfo = {
        peRatioAvg: findAverage(peRatio),
        peRatioMed: findMedian(peRatio),
        pbRatioAvg: findAverage(pbRatio),
        pbRatioMed: findMedian(pbRatio),
        ebitdaAvg: findAverage(ebitda),
        ebitdaMed: findMedian(ebitda),
        salesAvg: findAverage(sales),
        salesMed: findMedian(sales),
      };
    } else if (inputs.type =='industry'){
        companiesInfo = {
        peRatioAvg: industries.currentPE,
        peRatioMed: industries.currentPE,
        pbRatioAvg: industries.pbv,
        pbRatioMed: industries.pbv,
        ebitdaAvg: industries.evEBITDA_PV,
        ebitdaMed: industries.evEBITDA_PV,
        salesAvg: industries.priceSales,
        salesMed: industries.priceSales,
      };
    }
      else
        // Do nothing for now
      ;

    // const abc= await netWorthOfComp(column, worksheet2);
    // console.log('Hello Abc - ', abc);


    const prefShareCap = await netWorthOfCompany(colNum, worksheet2);
    let netWorth = 0;
    netWorth = await getShareholderFunds(0, worksheet2);
    netWorth = netWorth - prefShareCap;

    const bookValue = netWorth * multiplier / outstandingShares;
    const pbMarketPriceAvg = bookValue * companiesInfo.pbRatioAvg;
    const pbMarketPriceMed = bookValue * companiesInfo.pbRatioMed;

    let resProfitLoss = await profitLossValues(colNum-1, worksheet1);
    let eps = (resProfitLoss.profitLossForYear * multiplier) / outstandingShares;
    const peMarketPriceAvg = eps * companiesInfo.peRatioAvg;
    const peMarketPriceMed = eps * companiesInfo.peRatioMed;

    const ebitdaValue = await ebitdaMethod(colNum-1, worksheet1);
    const enterpriseAvg = ebitdaValue * companiesInfo.ebitdaAvg;
    const enterpriseMed = ebitdaValue * companiesInfo.ebitdaMed;

    const debt = await debtMethod(colNum-1, worksheet2);
    const ebitdaEquityAvg = enterpriseAvg - debt;
    const ebitdaEquityMed = enterpriseMed - debt;
    const ebitdaMarketPriceAvg = ebitdaEquityAvg * multiplier/ outstandingShares;
    const ebitdaMarketPriceMed = ebitdaEquityMed* multiplier / outstandingShares;

    const salesValue = await incomeFromOperation(colNum-1, worksheet1);
    const salesEquityAvg = salesValue * companiesInfo.salesAvg;
    const salesEquityMed = salesValue * companiesInfo.salesMed;
    const salesMarketPriceAvg = salesEquityAvg * multiplier/ outstandingShares;
    const salesMarketPriceMed = salesEquityMed * multiplier / outstandingShares;

    const avgPricePerShareAvg = findAverage([
      pbMarketPriceAvg,
      peMarketPriceAvg,
      ebitdaMarketPriceAvg,
      salesMarketPriceAvg,
    ]);
    const avgPricePerShareMed = findAverage([
      pbMarketPriceMed,
      peMarketPriceMed,
      ebitdaMarketPriceMed,
      salesMarketPriceMed,
    ]);

    const locAvg = avgPricePerShareAvg * discountRateValue/100;
    const locMed = avgPricePerShareMed * discountRateValue/100;
    const finalPriceAvg = avgPricePerShareAvg - locAvg;
    const finalPriceMed = avgPricePerShareMed - locMed;

    const tentativeIssuePrice = Math.round(
      findAverage([finalPriceAvg, finalPriceMed]),
    );
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
          pbRatioAvg: companiesInfo.pbRatioAvg,
          pbRatioMed: companiesInfo.pbRatioMed,
          pbMarketPriceAvg: pbMarketPriceAvg,
          pbMarketPriceMed: pbMarketPriceMed,
        },
        {
          particular: 'peRatio',
          epsAvg: eps,
          epsMed: eps,
          peRatioAvg: companiesInfo.peRatioAvg,
          peRatioMed: companiesInfo.peRatioMed,
          peMarketPriceAvg: peMarketPriceAvg,
          peMarketPriceMed: peMarketPriceMed,
        },
        {
          particular: 'ebitda',
          ebitdaAvg: ebitdaValue,
          ebitdaMed: ebitdaValue,
          evAvg: companiesInfo.ebitdaAvg,
          evMed: companiesInfo.ebitdaMed,
          enterpriseAvg: enterpriseAvg,
          enterpriseMed: enterpriseMed,
          debtAvg: debt,
          debtMed: debt,
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
          salesRatioAvg: companiesInfo.salesAvg,
          salesRatioMed: companiesInfo.salesMed,
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
          averageAvg: avgPricePerShareAvg,
          averageMed: avgPricePerShareMed,
          locAvg: locAvg,
          locMed: locMed,
          finalPriceAvg: finalPriceAvg,
          finalPriceMed: finalPriceMed,
          tentativeIssuePrice: tentativeIssuePrice,
        },
      ],
    };
    return {
      result: finalResult,
      valuation: { finalPriceAvg: finalPriceAvg, finalPriceMed: finalPriceMed },
      msg: 'Executed Successfully',
    };
  }
}
