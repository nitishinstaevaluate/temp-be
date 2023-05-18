import { Injectable } from '@nestjs/common';
import { CompaniesService } from 'src/masters/masters.service';
import {
  netWorthOfCompany,
  earningPerShare,
  ebitdaMethod,
  debtMethod,
  incomeFromOperation,
} from 'src/excelFileServices/relativeValuation.methods';
import { findAverage, findMedian } from 'src/excelFileServices/common.methods';
import { columnsList } from '../excelFileServices/excelSheetConfig';
import { getYearsList } from './common.methods';

@Injectable()
export class RelativeValuationService {
  constructor(private companiesService: CompaniesService) {}
  async Relative_Valuation(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    const { outstandingShares, discountRateValue, valuationDate } = inputs;
    const years = await getYearsList(worksheet1);
    if (years === null)
      return {
        result: null,
        msg: 'Please Separate Text Label and year with comma in B1 Cell in P&L Sheet1.',
      };
    const year = new Date(valuationDate).getFullYear().toString();
    const columnIndex = years.indexOf(year);
    console.log(columnsList[columnIndex], columnIndex, year);
    const column = columnsList[columnIndex];
    const companies = inputs.companies;
    const peRatio = [];
    const pbRatio = [];
    const ebitda = [];
    const sales = [];
    companies.map((company) => {
      peRatio.push(company.peRatio);
      pbRatio.push(company.pbRatio);
      ebitda.push(company.ebitda);
      sales.push(company.sales);
    });
    const companiesInfo = {
      peRatioAvg: findAverage(peRatio),
      peRatioMed: findMedian(peRatio),
      pbRatioAvg: findAverage(pbRatio),
      pbRatioMed: findMedian(pbRatio),
      ebitdaAvg: findAverage(ebitda),
      ebitdaMed: findMedian(ebitda),
      salesAvg: findAverage(sales),
      salesMed: findMedian(sales),
    };
    const netWorth = await netWorthOfCompany(column, worksheet2);
    const bookValue = netWorth / outstandingShares;
    const pbMarketPriceAvg = bookValue * companiesInfo.pbRatioAvg;
    const pbMarketPriceMed = bookValue * companiesInfo.pbRatioMed;

    const eps = await earningPerShare(column, worksheet1);
    const peMarketPriceAvg = eps * companiesInfo.peRatioAvg;
    const peMarketPriceMed = eps * companiesInfo.peRatioMed;

    const ebitdaValue = await ebitdaMethod(column, worksheet1);
    const enterpriseAvg = ebitdaValue * companiesInfo.ebitdaAvg;
    const enterpriseMed = ebitdaValue * companiesInfo.ebitdaMed;

    const debt = await debtMethod(column, worksheet2);
    const ebitdaEquityAvg = enterpriseAvg - debt;
    const ebitdaEquityMed = enterpriseMed - debt;
    const ebitdaMarketPriceAvg = ebitdaEquityAvg / outstandingShares;
    const ebitdaMarketPriceMed = ebitdaEquityMed / outstandingShares;

    const salesValue = await incomeFromOperation(column, worksheet1);
    const salesEquityAvg = salesValue * companiesInfo.salesAvg;
    const salesEquityMed = salesValue * companiesInfo.salesMed;
    const salesMarketPriceAvg = salesEquityAvg / outstandingShares;
    const salesMarketPriceMed = salesEquityMed / outstandingShares;

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

    const locAvg = avgPricePerShareAvg * discountRateValue;
    const locMed = avgPricePerShareMed * discountRateValue;
    const finalPriceAvg = avgPricePerShareAvg - locAvg;
    const finalPriceMed = avgPricePerShareMed - locMed;

    const tentativeIssuePrice = Math.round(
      findAverage([finalPriceAvg, finalPriceMed]),
    );
    const finalResult = {
      companies: companies,
      companiesInfo: companiesInfo,
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
    return { result: finalResult, msg: 'Executed Successfully' };
  }
}
