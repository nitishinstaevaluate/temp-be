import { Injectable } from '@nestjs/common';

import {
  getYearsList,
  getCellValue,
  parseDate,
  getFormattedProvisionalDate,
  convertToNumberOrZero
} from '../excelFileServices/common.methods';
import { columnsList, sheet2_BSObj, sheet1_PLObj } from '../excelFileServices/excelSheetConfig';
import { CustomLogger } from 'src/loggerService/logger.service';
import { GET_MULTIPLIER_UNITS } from 'src/constants/constants';
const date = require('date-and-time');
@Injectable()
export class NetAssetValueService {
  constructor(private readonly customLogger: CustomLogger) { }
  async Net_Asset_Value(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
    // companiesInfo: any,
  ): Promise<any> {
  try{
    this.customLogger.log({
      message: 'Request is entered into Net Asset Value Service.',
      userId: inputs.userId,
    });
    const { outstandingShares, discountRateValue, valuationDate } = inputs;
    const years = await getYearsList(worksheet1);

    let provisionalDates = worksheet1['B1'].v
    let provDtRef = await parseDate(provisionalDates.trim());
    let diffValProv = parseInt(date.subtract(new Date(inputs.valuationDate),provDtRef).toDays()); 
    
    let multiplier = GET_MULTIPLIER_UNITS[`${inputs.reportingUnit}`];;
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
      tradePayablesVal, otherCurrentLiabilitiesVal, lessLongTermBorrowingsVal, lessLongTermProvisionsVal, shareApplicationMoneyVal, contingentLiabilityMarketVal;
    
    let fixedAssetValAtBook, longTermLoansAdvancesValAtBook, nonCurrentInvestmentValAtBook, deferredTaxAssetValAtBook, inventoriesValAtBook,
      shortTermLoanAdvancesValAtBook, tradeReceivablesValAtBook, cashValAtBook, otherCurrentAssetsValAtBook, shortTermProvisionsValAtBook, shortTermBorrowingsValAtBook,
      tradePayablesValAtBook, otherCurrentLiabilitiesValAtBook, lessLongTermBorrowingsValAtBook, lessLongTermProvisionsValAtBook, shareApplicationMoneyValAtBook;
    
    let fixedAssetObj,longTermLoansAdvancesObj,nonCurrentInvestmentObj,deferredTaxAssetObj,inventoriesObj,
    shortTermLoanAdvancesObj,tradeReceivablesObj,cashObj,otherCurrentAssetsObj,shortTermProvisionsObj,
    shortTermBorrowingsObj,tradePayablesObj,otherCurrentLiabilitiesObj,lessLongTermBorrowingsObj,
    lessLongTermProvisionsObj,shareApplicationMoneyObj,contingentLiabilityObj;

    
    for await(let resp of inputs.navInputs){ 
      
      switch (resp.fieldName) {
        case ('fixedAsset'):
          fixedAssetValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.tangibleAssetsRow}`,
          )
          fixedAssetVal = (resp.type === 'book_value') ? fixedAssetValAtBook : resp.value
            
          fixedAssetObj = {
            fieldName: "Fixed Assets",
            bookValue: fixedAssetValAtBook,
            fairValue: fixedAssetVal,
            type: resp.type
          }

          break;
        case ('longTermLoansAdvances'):
          longTermLoansAdvancesValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.otherNonCurrentAssetsRow}`,
          )
          longTermLoansAdvancesVal = (resp.type === 'book_value') ? longTermLoansAdvancesValAtBook : resp.value

          longTermLoansAdvancesObj = {
            fieldName: "Long-term loans and advances",
            bookValue: longTermLoansAdvancesValAtBook,
            fairValue: longTermLoansAdvancesVal,
            type: resp.type
          }

          break;
        case ('nonCurrentInvestment'):
          nonCurrentInvestmentValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.nonCurrentInvestmentRow}`,
          )
          nonCurrentInvestmentVal = (resp.type === 'book_value') ? nonCurrentInvestmentValAtBook : resp.value

          nonCurrentInvestmentObj = {
            fieldName: "Non Current Investments",
            bookValue: nonCurrentInvestmentValAtBook,
            fairValue: nonCurrentInvestmentVal,
            type: resp.type
          }

          break;
        case ('deferredTaxAsset'):
          deferredTaxAssetValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.deferredTaxAssetsRow}`,
          )
          deferredTaxAssetVal = (resp.type === 'book_value') ?  deferredTaxAssetValAtBook: resp.value

          deferredTaxAssetObj = {
            fieldName: "Deffered Tax Assets",
            bookValue : deferredTaxAssetValAtBook ?? 0,
            fairValue: deferredTaxAssetVal ?? 0,
            type: resp.type
          }

          break;
        case ('inventories'):
          inventoriesValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.inventoriesRow}`,
          )
          inventoriesVal = (resp.type === 'book_value') ? inventoriesValAtBook : resp.value

          inventoriesObj = {
            fieldName: "Inventories",
            bookValue: inventoriesValAtBook ?? 0,
            fairValue : inventoriesVal ?? 0,
            type: resp.type
          }

          break;
        case ('shortTermLoanAdvances'):
          shortTermLoanAdvancesValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.advancesRow}`,
          )
          shortTermLoanAdvancesVal = (resp.type === 'book_value') ? shortTermLoanAdvancesValAtBook : resp.value

          shortTermLoanAdvancesObj = {
            fieldName: "Short Term Loans and Advances",
            bookValue : shortTermLoanAdvancesValAtBook,
            fairValue: shortTermLoanAdvancesVal,
            type: resp.type
          }

          break;
        case ('tradeReceivables'):
          tradeReceivablesValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.tradeReceivablesRow}`,
          )
          tradeReceivablesVal = (resp.type === 'book_value') ? tradeReceivablesValAtBook : resp.value

          tradeReceivablesObj = {
            fieldName: "Trade Receivables",
            bookValue : tradeReceivablesValAtBook,
            fairValue: tradeReceivablesVal,
            type: resp.type
          }

          break;
        case ('cash'):
          cashValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.cashEquivalentsRow}`,
          )
          cashVal = (resp.type === 'book_value') ? cashValAtBook : resp.value
            
          cashObj = {
            fieldName: "Cash",
            bookValue : cashValAtBook,
            fairValue: cashVal,
            type: resp.type
          }

          break;

        case ('otherCurrentAssets'):
          otherCurrentAssetsValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.otherCurrentAssetsRow}`,
          )
          otherCurrentAssetsVal = (resp.type === 'book_value') ? otherCurrentAssetsValAtBook : resp.value

          otherCurrentAssetsObj = {
            fieldName: "Other Current Assets",
            bookValue : otherCurrentAssetsValAtBook,
            fairValue: otherCurrentAssetsVal,
            type: resp.type
          }

          break;
        case ('shortTermProvisions'):
          shortTermProvisionsValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.shortTermProvisionsRow}`,
          )
          shortTermProvisionsVal = (resp.type === 'book_value') ? shortTermProvisionsValAtBook : resp.value

          shortTermProvisionsObj = {
            fieldName: "Less: Short Term Provisions",
            bookValue : shortTermProvisionsValAtBook,
            fairValue: shortTermProvisionsVal,
            type: resp.type
          }

          break;
        case ('shortTermBorrowings'):
          shortTermBorrowingsValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.shortTermBorrowingsRow}`,
          )
          shortTermBorrowingsVal = (resp.type === 'book_value') ? shortTermBorrowingsValAtBook : resp.value

          shortTermBorrowingsObj = {
            fieldName: "Short term Borrowings",
            bookValue: shortTermBorrowingsValAtBook ?? 0,
            fairValue: shortTermBorrowingsVal ?? 0,
            type: resp.type
          }

          break;
        case ('tradePayables'):
          tradePayablesValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.tradePayablesRow}`,
          )
          tradePayablesVal = (resp.type === 'book_value') ? tradePayablesValAtBook : resp.value

          tradePayablesObj = {
            fieldName: "Trade Payables",
            bookValue: tradePayablesValAtBook,
            fairValue: tradePayablesVal,
            type: resp.type
          }

          break;
        case ('otherCurrentLiabilities'):
          otherCurrentLiabilitiesValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.otherCurrentLiabilitiesRow}`,
          )

          const deferredTaxLiability = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.deferredTaxLiabilityRow}`,
          )

          otherCurrentLiabilitiesVal = (resp.type === 'book_value') ? otherCurrentLiabilitiesValAtBook : resp.value

          otherCurrentLiabilitiesObj = {
            fieldName: "Other current liabilities ",
            bookValue : otherCurrentLiabilitiesValAtBook + convertToNumberOrZero(deferredTaxLiability),
            fairValue: otherCurrentLiabilitiesVal + convertToNumberOrZero(deferredTaxLiability),
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
          
          lessLongTermBorrowingsValAtBook = longTermBorrowings + otherUnsecuredLoans;

          lessLongTermBorrowingsVal = (resp.type === 'book_value') ? longTermBrrw : resp.value;

          lessLongTermBorrowingsObj = {
            fieldName: "Less: Long Term Borrowings",
            bookValue: lessLongTermBorrowingsValAtBook,
            fairValue: lessLongTermBorrowingsVal,
            type: resp.type
          }

          break;
        case ('lessLongTermProvisions'):
          lessLongTermProvisionsValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.longTermProvisionRow}`,
          )
          lessLongTermProvisionsVal = (resp.type === 'book_value') ? lessLongTermProvisionsValAtBook : resp.value

          lessLongTermProvisionsObj = {
            fieldName: "Less: Long Term Provisions",
            bookValue : lessLongTermProvisionsValAtBook,
            fairValue: lessLongTermProvisionsVal,
            type: resp.type
          }
        break;

        case ('shareApplicationMoney'):
          shareApplicationMoneyValAtBook = await getCellValue(
            worksheet2,
            `${columnsList[0] + sheet2_BSObj.shareApplicationRow}`,
          )
          shareApplicationMoneyVal = (resp.type === 'book_value') ? shareApplicationMoneyValAtBook : resp.value

          shareApplicationMoneyObj = {
            fieldName: "Less: Share Application Money",
            bookValue : shareApplicationMoneyValAtBook,
            fairValue: shareApplicationMoneyVal,
            type: resp.type
          }

          break;
        case ('contingentLiability'):     //For now we need to add contingent liability from form since we dont have line-item for contingent liability in excel
          contingentLiabilityMarketVal = resp.value

          contingentLiabilityObj = {
            fieldName: "Less: Contingent Liability",
            bookValue : 0,
            fairValue: contingentLiabilityMarketVal,
            type: resp.type
          }

          break;
        default:
          console.log('Undefined fieldValue Traced')
      }
    }

    // Modifying Other current liabilities payload 
    const totalNonCurrentAssets = fixedAssetVal + longTermLoansAdvancesVal + nonCurrentInvestmentVal + deferredTaxAssetVal;
    const totalNonCurrentAssetsAtBook = fixedAssetValAtBook + longTermLoansAdvancesValAtBook + nonCurrentInvestmentValAtBook + deferredTaxAssetValAtBook;

    const netCurrentAsset = inventoriesVal + shortTermLoanAdvancesVal + tradeReceivablesVal + cashVal + otherCurrentAssetsVal -
      shortTermProvisionsVal - shortTermBorrowingsVal - tradePayablesVal - otherCurrentLiabilitiesVal;

    const netCurrentAssetAtBook = inventoriesValAtBook + shortTermLoanAdvancesValAtBook + tradeReceivablesValAtBook + cashValAtBook + otherCurrentAssetsValAtBook -
      shortTermProvisionsValAtBook - shortTermBorrowingsValAtBook - tradePayablesValAtBook - otherCurrentLiabilitiesValAtBook;  
    
    const firmValue = totalNonCurrentAssets + netCurrentAsset
    const firmValueAtBook = totalNonCurrentAssetsAtBook + netCurrentAssetAtBook
    
    const equityValue = firmValue - lessLongTermBorrowingsVal - lessLongTermProvisionsVal - shareApplicationMoneyVal - contingentLiabilityMarketVal;
    console.log(equityValue ,firmValue , lessLongTermBorrowingsVal,lessLongTermProvisionsVal,shareApplicationMoneyVal  );
    const equityValueAtBook = firmValueAtBook - lessLongTermBorrowingsValAtBook - lessLongTermProvisionsValAtBook - shareApplicationMoneyValAtBook;

    const noOfShares = inputs.outstandingShares;

    const valuePerShare = (equityValue * multiplier) / noOfShares;
    const valuePerShareAtBook = (equityValueAtBook * multiplier) / noOfShares;


    // ------------------------------- NAV --------------------------

    const finalResult = {
      nonCurrentAssetsHeader: {
        fieldName: "Non Current Assets",
        value: null,
        type: null
      },
      fixedAsset: fixedAssetObj,
      longTermLoansAdvances: longTermLoansAdvancesObj,
      nonCurrentInvestment: nonCurrentInvestmentObj,
      deferredTaxAsset: deferredTaxAssetObj,
      totalNonCurrentAssets: {
        fieldName: "Total Non Current Assets",
        bookValue: totalNonCurrentAssetsAtBook,
        fairValue: totalNonCurrentAssets,
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
        bookValue : netCurrentAssetAtBook,
        fairValue: netCurrentAsset,
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
      contingentLiability: contingentLiabilityObj,
      equityValue: {
        fieldName:'Equity Value',
        bookValue : equityValueAtBook,
        fairValue: equityValue,
      },
      noOfShares: {
        fieldName: 'No. of Shares',
        value : noOfShares,
      },
      valuePerShare: {
        fieldName : `Value per share (${inputs.currencyUnit})`,
        bookValue : valuePerShareAtBook, 
        fairValue : valuePerShare,
      }
    };
    this.customLogger.log({
      message: 'Request is sucessfully executed in Net Asset Value Service.',
      userId: inputs.userId,
    });

    console.log(finalResult);
    let provisionalDate = provDtRef;
    return {
      result: finalResult,
      valuation: equityValue,
      provisionalDate,
      msg: 'Net Asset Value Calculated Successfully',
      status: true
    };
  }
  catch(error){
    console.log("Net Asset Error:",error);
    throw error;
  }
  }

}
