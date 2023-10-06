import { Injectable } from '@nestjs/common';

import {
  getYearsList,
  getCellValue
} from '../excelFileServices/common.methods';
import { columnsList, sheet2_BSObj, sheet1_PLObj } from '../excelFileServices/excelSheetConfig';
import { CustomLogger } from 'src/loggerService/logger.service';
@Injectable()
export class NetAssetValueService {
  constructor(private readonly customLogger: CustomLogger) { }
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

    // Read NAV Inputs
    let fixedAssetVal, longTermLoansAdvancesVal, nonCurrentInvestmentVal, deferredTaxAssetVal, inventoriesVal,
      shortTermLoanAdvancesVal, tradeReceivablesVal, cashVal, otherCurrentAssetsVal, shortTermProvisionsVal, shortTermBorrowingsVal,
      tradePayablesVal, otherCurrentLiabilitiesVal, lessLongTermBorrowingsVal, lessLongTermProvisionsVal, shareApplicationMoneyVal;
    let fixedAssetObj: {};
    let longTermLoansAdvancesObj: {};
    let nonCurrentInvestmentObj: {};
    let deferredTaxAssetObj: {};
    let inventoriesObj: {};
    let shortTermLoanAdvancesObj: {};
    let tradeReceivablesObj: {};
    let cashObj: {};
    let otherCurrentAssetsObj: {};
    let shortTermProvisionsObj: {};
    let shortTermBorrowingsObj: {};
    let tradePayablesObj: {};
    let otherCurrentLiabilitiesObj: {};
    let lessLongTermBorrowingsObj: {};
    let lessLongTermProvisionsObj: {};
    let shareApplicationMoneyObj: {};

    inputs.navInputs.map(async (resp) => {
      
      // if (resp.fieldName === 'fixedAsset' && resp.type === 'book_value') {
      //   // const fixedAsset = await getCellValue(
      //   //   worksheet2,
      //   //   `${columnsList[0] + sheet2_BSObj.tangibleAssetsRow}`,
      //   // );
      //   console.log(true, resp.value);
      // } else {
      //   console.log(resp.fieldName);
      // }
      const aaa = await getCellValue(
        worksheet2,
        `${columnsList[0] + sheet2_BSObj.tradePayablesRow}`,
      );
      console.log('value of aaa ' , aaa);
      switch (resp.fieldName) {
        case ('fixedAsset'):
          fixedAssetVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.tangibleAssetsRow}`,
          ) : resp.value

          fixedAssetObj = {
            fieldName: "Fixed Assets",
            value: fixedAssetVal,
            type: resp.type
          }

          break;
        case ('longTermLoansAdvances'):
          longTermLoansAdvancesVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.otherNonCurrentAssetsRow}`,
          ) : resp.value

          longTermLoansAdvancesObj = {
            fieldName: "Long-term loans and advances",
            value: longTermLoansAdvancesVal,
            type: resp.type
          }

          break;
        case ('nonCurrentInvestment'):
          nonCurrentInvestmentVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.nonCurrentInvestmentRow}`,
          ) : resp.value

          nonCurrentInvestmentObj = {
            fieldName: "Non Current Investments",
            value: nonCurrentInvestmentVal,
            type: resp.type
          }

          break;
        case ('deferredTaxAsset'):
          deferredTaxAssetVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.deferredTaxAssetsRow}`,
          ) : resp.value

          deferredTaxAssetObj = {
            fieldName: "Deffered Tax Assets",
            value: deferredTaxAssetVal,
            type: resp.type
          }

          break;
        case ('inventories'):
          inventoriesVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.inventoriesRow}`,
          ) : resp.value

          inventoriesObj = {
            fieldName: "Inventories",
            value: inventoriesVal,
            type: resp.type
          }

          break;
        case ('shortTermLoanAdvances'):
          shortTermLoanAdvancesVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.advancesRow}`,
          ) : resp.value

          shortTermLoanAdvancesObj = {
            fieldName: "Short Term Loans and Advances",
            value: shortTermLoanAdvancesVal,
            type: resp.type
          }

          break;
        case ('tradeReceivables'):
          tradeReceivablesVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.tradeReceivablesRow}`,
          ) : resp.value

          tradeReceivablesObj = {
            fieldName: "Trade Receivables",
            value: tradeReceivablesVal,
            type: resp.type
          }

          break;
        case ('cash'):
          let cashVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.cashEquivalentsRow}`,
          ) : resp.value

          cashObj = {
            fieldName: "Cash",
            value: cashVal,
            type: resp.type
          }

          break;
        case ('otherCurrentAssets'):
          otherCurrentAssetsVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.otherCurrentAssetsRow}`,
          ) : resp.value

          otherCurrentAssetsObj = {
            fieldName: "Other Current Assets",
            value: otherCurrentAssetsVal,
            type: resp.type
          }

          break;
        case ('shortTermProvisions'):
          shortTermProvisionsVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.shortTermProvisionsRow}`,
          ) : resp.value

          shortTermProvisionsObj = {
            fieldName: "Less: Short Term Provisions",
            value: shortTermProvisionsVal,
            type: resp.type
          }

          break;
        case ('shortTermBorrowings'):
          shortTermBorrowingsVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.shortTermBorrowingsRow}`,
          ) : resp.value

          shortTermBorrowingsObj = {
            fieldName: "Short term Borrowings",
            value: shortTermBorrowingsVal,
            type: resp.type
          }

          break;
        case ('tradePayables'):
          tradePayablesVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.tradePayablesRow}`,
          ) : resp.value

          tradePayablesObj = {
            fieldName: "Trade Payables",
            value: tradePayablesVal,
            type: resp.type
          }

          break;
        case ('otherCurrentLiabilities'):
          otherCurrentLiabilitiesVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.otherCurrentLiabilitiesRow}`,
          ) : resp.value

          otherCurrentLiabilitiesObj = {
            fieldName: "Other current liabilities ",
            value: otherCurrentLiabilitiesVal,
            type: resp.type
          }

          break;
        case ('lessLongTermBorrowings'):

          const longTermBorrowings = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.longTermBorrowingsRow}`,
          );

          const otherUnsecuredLoans = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.otherUnsecuredLoansRow}`,
          );

          const longTermBrrw = longTermBorrowings + otherUnsecuredLoans;
          lessLongTermBorrowingsVal = (resp.type === 'book_value') ? longTermBrrw : resp.value;

          lessLongTermBorrowingsObj = {
            fieldName: "Less: Long Term Borrowings",
            value: lessLongTermBorrowingsVal,
            type: resp.type
          }

          break;
        case ('lessLongTermProvisions'):
          lessLongTermProvisionsVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.longTermProvisionRow}`,
          ) : resp.value

          lessLongTermProvisionsObj = {
            fieldName: "Less: Long Term Provisions",
            value: lessLongTermProvisionsVal,
            type: resp.type
          }

        case ('shareApplicationMoney'):
          let shareApplicationMoneyVal = (resp.type === 'book_value') ? await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.shareApplicationRow}`,
          ) : resp.value

          shareApplicationMoneyObj = {
            fieldName: "Less: Share Application Money",
            value: shareApplicationMoneyVal,
            type: resp.type
          }

          break;
        default:
          console.log('Undefined fieldValue Traced')
      }
    })
    
    // ------------------------------- NAV --------------------------
    // const fixedAsset = await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.tangibleAssetsRow}`,
    // );

    // const longTermLoansAdvances = await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.otherNonCurrentAssetsRow}`,
    // );

    // const nonCurrentInvestment = await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.nonCurrentInvestmentRow}`,
    // );

    // const deferredTaxAsset = await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.deferredTaxAssetsRow}`,
    // );

    const totalNonCurrentAssets = fixedAssetVal + longTermLoansAdvancesVal + nonCurrentInvestmentVal + deferredTaxAssetVal;

    // const inventories = await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.inventoriesRow}`,
    // );

    // const shortTermLoanAdvances =  await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.advancesRow}`,
    // );

    // const tradeReceivables =  await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.tradeReceivablesRow}`,
    // );

    // const cash =  await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.cashEquivalentsRow}`,
    // );

    // const otherCurrentAssets =  await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.otherCurrentAssetsRow}`,
    // );

    // const shortTermProvisions =  await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.shortTermProvisionsRow}`,
    // );

    // const shortTermBorrowings =  await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.shortTermBorrowingsRow}`,
    // );

    // const tradePayables =  await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.tradePayablesRow}`,
    // );

    // const otherCurrentLiabilities =  await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.otherCurrentLiabilitiesRow}`,
    // );

    const netCurrentAsset = inventoriesVal + shortTermLoanAdvancesVal + tradeReceivablesVal + cashVal + otherCurrentAssetsVal -
      shortTermProvisionsVal - shortTermBorrowingsVal - tradePayablesVal - otherCurrentLiabilitiesVal;

    const firmValue = totalNonCurrentAssets + netCurrentAsset

    // const longTermBorrowings = await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.longTermBorrowingsRow}`,
    // );

    // const otherUnsecuredLoans = await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.otherUnsecuredLoansRow}`,
    // );

    // const longTermBrrw = longTermBorrowings + otherUnsecuredLoans;

    // const longTermProvision = await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.longTermProvisionRow}`,
    // );

    // const shareApplicationMoney = await getCellValue(
    //   worksheet2,
    //   `${columnsList[0] + sheet2_BSObj.shareApplicationRow}`,
    // );

    const equityValue = firmValue - lessLongTermBorrowingsVal - lessLongTermProvisionsVal - shareApplicationMoneyVal;
    const noOfShares = inputs.outstandingShares;

    const valuePerShare = (equityValue * multiplier) / noOfShares;


    // ------------------------------- NAV --------------------------

    const finalResult = {
      nonCurrentAssets: {
        fieldName: "Total Non Current Assets",
        value: null,
        type: null
      },
      fixedAsset: fixedAssetObj,
      longTermLoansAdvances: longTermLoansAdvancesObj,
      nonCurrentInvestment: nonCurrentInvestmentObj,
      deferredTaxAsset: deferredTaxAssetObj,
      totalNonCurrentAssets: {
        fieldName: "Total Non Current Assets",
        value: totalNonCurrentAssets,
        type: "-"
      },
      netCurrentAssetHeader: {
        fieldName: "Net Current Assets",
        value: null,
        type: null
      },
      inventories: inventoriesObj,
      shortTermLoanAdvances: shortTermLoanAdvancesObj,
      tradeReceivables: tradeReceivablesObj,
      cash: cashObj,
      otherCurrentAssets: otherCurrentAssetsObj,
      shortTermProvisions: shortTermProvisionsObj,
      shortTermBorrowings: shortTermBorrowingsObj,
      tradePayables: tradePayablesObj,
      otherCurrentLiabilities: otherCurrentLiabilitiesObj,
      netCurrentAsset: {
        fieldName: "Net Current Assets",
        value: netCurrentAsset,
        type: ""
      },
      firmValue: {
        fieldName: "Firm Value",
        value: firmValue,
        type: "-"
      },
      longTermBorrowings: lessLongTermBorrowingsObj,
      longTermProvision: lessLongTermProvisionsObj,
      shareApplicationMoney: shareApplicationMoneyObj,
      equityValue: {
        fieldName:'Equity Value',
        value: equityValue,
      },
      noOfShares: {
        fieldName: 'No. of Shares',
        value : noOfShares,
      },
      valuePerShare: {
        fieldName : 'Value per share',
        value : valuePerShare,
      }
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
