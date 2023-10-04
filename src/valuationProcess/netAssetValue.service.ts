import { Injectable } from '@nestjs/common';

import {
  getYearsList,
  getCellValue
} from '../excelFileServices/common.methods';
import { columnsList,sheet2_BSObj,sheet1_PLObj } from '../excelFileServices/excelSheetConfig';
import { CustomLogger } from 'src/loggerService/logger.service';
@Injectable()
export class NetAssetValueService {
  constructor(private readonly customLogger: CustomLogger) {}
  async Net_Asset_Value(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
    // companiesInfo: any,
  ): Promise<any> {
    this.customLogger.log({
      message: 'Request is entered into Net Asset Value Service.',
      userId: inputs.userId,
    });
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
    
    // const column = columnsList[columnIndex];
    
    // ------------------------------- NAV --------------------------
      const fixedAsset = await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.tangibleAssetsRow}`,
      );
        
      const longTermLoansAdvances = await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.otherNonCurrentAssetsRow}`,
      );

      const nonCurrentInvestment = await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.nonCurrentInvestmentRow}`,
      );

      const deferredTaxAsset = await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.deferredTaxAssetsRow}`,
      );
      
      const totalNonCurrentAssets = fixedAsset + longTermLoansAdvances + nonCurrentInvestment + deferredTaxAsset;

      const inventories = await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.inventoriesRow}`,
      );

      const shortTermLoanAdvances =  await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.advancesRow}`,
      );

      const tradeReceivables =  await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.tradeReceivablesRow}`,
      );

      const cash =  await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.cashEquivalentsRow}`,
      );

      const otherCurrentAssets =  await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.otherCurrentAssetsRow}`,
      );

      const shortTermProvisions =  await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.shortTermProvisionsRow}`,
      );

      const shortTermBorrowings =  await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.shortTermBorrowingsRow}`,
      );

      const tradePayables =  await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.tradePayablesRow}`,
      );

      const otherCurrentLiabilities =  await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.otherCurrentLiabilitiesRow}`,
      );
      
      const netCurrentAsset = inventories + shortTermLoanAdvances + tradeReceivables + cash + otherCurrentAssets - 
      shortTermProvisions - shortTermBorrowings - tradePayables - otherCurrentLiabilities;

      const firmValue = totalNonCurrentAssets + netCurrentAsset

      const longTermBorrowings = await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.longTermBorrowingsRow}`,
      );

      const otherUnsecuredLoans = await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.otherUnsecuredLoansRow}`,
      );

      const longTermBrrw = longTermBorrowings + otherUnsecuredLoans;

      const longTermProvision = await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.longTermProvisionRow}`,
      );

      const shareApplicationMoney = await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.shareApplicationRow}`,
      );

      const equityValue = firmValue - longTermBrrw - longTermProvision - shareApplicationMoney;
      const noOfShares = inputs.outstandingShares;

      const valuePerShare = ( equityValue * multiplier )/noOfShares;


    // ------------------------------- NAV --------------------------
    const basisSelector = 'Book Value';     // Check how it varies between market and book value
    
    const finalResult = {
      basis: basisSelector,
      nonCurrentAssets : '',
      fixedAsset : fixedAsset,
      longTermLoansAdvances : longTermLoansAdvances,
      nonCurrentInvestment: nonCurrentInvestment,
      deferredTaxAsset: deferredTaxAsset,
      totalNonCurrentAssets : totalNonCurrentAssets,
      netCurrentAssetHeader:'',
      inventories : inventories,
      shortTermLoanAdvances:shortTermLoanAdvances,
      tradeReceivables : tradeReceivables,
      cash: cash,
      otherCurrentAssets : otherCurrentAssets,
      shortTermProvisions:shortTermProvisions,
      tradePayables: tradePayables,
      otherCurrentLiabilities : otherCurrentLiabilities,
      netCurrentAsset : netCurrentAsset,
      firmValue:firmValue,
      longTermBorrowings :longTermBrrw,
      longTermProvision: longTermProvision,
      shareApplicationMoney : shareApplicationMoney,
      equityValue : equityValue,
      noOfShares : noOfShares,
      valuePerShare :valuePerShare

    };
    this.customLogger.log({
      message: 'Request is sucessfully executed in Net Asset Value Service.',
      userId: inputs.userId,
    });

    console.log(finalResult);

    return {
      result: finalResult,
      valuation: equityValue,
      msg: 'Net Asset Value Calculated Successfully',
      status: true
    };
  }
}
