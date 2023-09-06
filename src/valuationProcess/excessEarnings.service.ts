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
import {
  getYearsList,
  findAverage,
  findMedian,
} from '../excelFileServices/common.methods';
import { columnsList } from '../excelFileServices/excelSheetConfig';
import { CustomLogger } from 'src/loggerService/logger.service';
// @Injectable()
// export class ExcessEarningsService {
//   constructor(private readonly customLogger: CustomLogger) {}
//   async Excess_Earnings(
//     inputs: any,
//     worksheet1: any,
//     worksheet2: any,
//     // companiesInfo: any,
//   ): Promise<any> {
//     this.customLogger.log({
//       message: 'Request is entered into Relative Valuation Service.',
//       userId: inputs.userId,
//     });
//     const { outstandingShares, discountRateValue, valuationDate } = inputs;
//     const years = await getYearsList(worksheet1);
//     let multiplier = 100000;
//     if (years === null)
//       return {
//         result: null,
//         msg: 'Please Separate Text Label and year with comma in B1 Cell in P&L Sheet1.',
//       };
//     const year = new Date(valuationDate).getFullYear().toString();
//     const columnIndex = years.indexOf(year);
//     console.log(columnsList[columnIndex], columnIndex, year);
    
//     const column = columnsList[columnIndex];
//     // const column = 1;
//     const companies = inputs.companies;
//     const industries = inputs.industries;
//     const ratiotypebased = inputs.type;
//     const peRatio = [];
//     const pbRatio = [];
//     const ebitda = [];
//     const sales = [];
//     var companiesInfo: any;
//     let colNum =1;
    
    
//     const finalResult = await Promise.all(
//       years.map(async (year: string, i: number) => {
        
//         let changeInNCA = null;
//         let deferredTaxAssets = null;
//         let changeInBorrowingsVal = 0;
//         let addInterestAdjTaxes = 0;
//         let addInterestAdjustedTaxesStub = 0;
//         let result = {};
//         // let fcff = 0;
//         let fcfeValueAtTerminalRate = 0;
//         let fcffValueAtTerminalRate = 0;
//         // let equityValue =0;
//         let presentFCFF = 0;
//         // let capitalStruc = {};
//         //Get PAT value


//         // For mid year calculation need nextPAT,depAndAmortisationNext

//         // console.log("Value of i ",i);
//         const patNext = await getCellValue(
//           worksheet1,
//           `${columnsList[i+1] + sheet1_PLObj.patRow}`,
//         );
//         const depAndAmortisationNext = await getCellValue(
//           worksheet1,
//           `${columnsList[i+1] + sheet1_PLObj.depAndAmortisationRow}`,
//         );

//         let pat = await GetPAT(i+1, worksheet1);
//         let patOld = await GetPAT(i,worksheet1);
//         pat = i === 0 && this.stubAdjRequired == true  ? pat-patOld : pat;
//         // if (pat !== null) pat = pat;
//         // pat = i === 0 ? patNext - pat:pat;
//         console.log('PAT ',pat);
//         //Get Depn and Amortisation value
//         let depAndAmortisation = await DepAndAmortisation(i+1, worksheet1);
//         let depAndAmortisationOld = await DepAndAmortisation(i, worksheet1);
        
//         depAndAmortisation = i === 0 && this.stubAdjRequired == true  ? depAndAmortisation - depAndAmortisationOld:depAndAmortisation;

//         //Get Oher Non Cash items Value
//         let otherNonCashItems = await OtherNonCashItemsMethod(i+1, worksheet1);
//         let otherNonCashItemsOld = await OtherNonCashItemsMethodNext(i, worksheet1);
//         otherNonCashItems = i === 0 && this.stubAdjRequired == true ? otherNonCashItems - otherNonCashItemsOld : otherNonCashItems;
//         const changeInNCAValue = await ChangeInNCA(i, worksheet2);
//         changeInNCA = changeInNCAValue;

//         const deferredTaxAssetsValue = await DeferredTaxAssets(i, worksheet2);
//         deferredTaxAssets =  deferredTaxAssetsValue;
        
//         var changeInFixedAssets = await ChangeInFixedAssets(i, worksheet2);
//         // if (i==0) {}
//         const adjustedCostOfEquity = await this.industryService.CAPM_Method(inputs);
//         console.log("Adjusted COE ",adjustedCostOfEquity );
//         // console.log('Change in Net Fixed Assets ', changeInFixedAssets);
        
//         // console.log('disc ', discountingPeriodValue);
//         // var ndiscountingPeriodValue = discountingPeriodValue + 1
       


        
//         // console.log('WACC Value - ',this.discountingFactorWACC);
//         // if (i === 0)        // Control from here not to print next set of values
//                                                                        // old code ->     discountingFactorValue * fcff;
        
//         // console.log('out disc ', discountingPeriodValue);
//         // const sumOfCashFlows = 1000000; //presentFCFF;                                                     // To be checked
//         let debtAsOnDate = await GetDebtAsOnDate(i, worksheet2);
//         const cashEquivalents = await CashEquivalents(i, worksheet2);
//         const surplusAssets = await SurplusAssets(i, worksheet2);
//         changeInBorrowingsVal = await changeInBorrowings(i, worksheet2);
//         // console.log('Borrowings, ',changeInBorrowingsVal);
//         addInterestAdjTaxes = await interestAdjustedTaxes(i,worksheet1,inputs.taxRate);
//         addInterestAdjustedTaxesStub = await interestAdjustedTaxesWithStubPeriod(i,worksheet1,inputs.taxRate);
//         addInterestAdjTaxes = i === 0 && this.stubAdjRequired == true  ? addInterestAdjustedTaxesStub:addInterestAdjTaxes;
//         // const shareholderFunds = await getShareholderFunds(i,worksheet2);
        
//         const shareholderFunds = await getShareholderFunds(i,worksheet2);
        
//         let capitalStruc = await CapitalStruc(i,worksheet2,shareholderFunds);
//         // console.log(capitalStruc);
//         // console.log('More Values ',parseFloat(inputs.costOfDebt),parseFloat(inputs.taxRate),' ', parseFloat(inputs.copShareCapital));
//         calculatedWacc = adjustedCostOfEquity/100 * capitalStruc.equityProp + (parseFloat(inputs.costOfDebt)/100)*(1-parseFloat(inputs.taxRate)/100)*capitalStruc.debtProp + parseFloat(inputs.copShareCapital)/100 * capitalStruc.prefProp;
        
//         console.log('WACC Calculat- ',i,' ',calculatedWacc);
//         const otherAdj = parseFloat(inputs.otherAdj);                                                                // ValidateHere
//         //formula: =+B16-B17+B18+B19+B20
//         // console.log('out disc ', discountingPeriodValue);

        
//         let netCashFlow =0 ;
//         if (inputs.model === 'FCFE') {
          
//           netCashFlow = pat + depAndAmortisation + otherNonCashItems + changeInNCA + deferredTaxAssets + changeInBorrowingsVal;
//         } else {
//           netCashFlow = pat + depAndAmortisation + otherNonCashItems + changeInNCA + deferredTaxAssets  + addInterestAdjTaxes;
//         }
          
//         changeInFixedAssets = changeInFixedAssets - depAndAmortisation;
//         const fcff = netCashFlow + changeInFixedAssets ;    
//         console.log("Value at ",fcff,' ',i, ' ', yearLengthT);
//         // Calculate wacc for FCFF
//         // =+D22*D30+D26*(1-D7)*D29+D24*D31

//         // this.calculatedWacc = adjustedCostOfEquity * capitalStruc.equityProp + (inputs.costOfDebt/100)*(1-inputs.taxRate/100)*capitalStruc.debtProp + inputs.copShareCapital/100 * capitalStruc.prefProp

//         if  (i === yearLengthT && inputs.model === 'FCFE') {                                // Valuation data
//         fcfeValueAtTerminalRate = await fcfeTerminalValue(valuation,inputs.terminalGrowthRate,adjustedCostOfEquity)
//         console.log('ter val ',fcfeValueAtTerminalRate,' ', valuation);
//         // console.log('fcfe ter ', fcfeValueAtTerminalRate)
//         discountingPeriodValue = discountingPeriodValue - 1;
//         } else if (i === yearLengthT && inputs.model === 'FCFF') {  
//           fcfeValueAtTerminalRate = await fcffTerminalValue(valuation,inputs.terminalGrowthRate, finalWacc)
//           discountingPeriodValue = discountingPeriodValue - 1;
//         }
//         // console.log('Term - ',fcffValueAtTerminalRate);
        
//         if (i === 0) {
//           finalWacc = calculatedWacc;
//           finalDebt = debtAsOnDate;
//           }
//           // console.log('Final Deb ',finalDebt);
//         if (inputs.model === 'FCFE') {
//           // changeInBorrowingsVal = await changeInBorrowings(i, worksheet2);
//           if (i === yearLengthT) {
//             // Do nothing
//           } else {
//           this.discountingFactorWACC = 1/ (1+adjustedCostOfEquity/100) ** (discountingPeriodValue)
//           }
//           console.log('Disc COE ', this.discountingFactorWACC)
         
//         } else if (inputs.model === 'FCFF') {
//           // addInterestAdjTaxes = await interestAdjustedTaxes(i,worksheet1,inputs.taxRate);
//           if (i === yearLengthT) {
//             // Do nothing
//           } else {
//           this.discountingFactorWACC = 1/ (1+finalWacc) ** (discountingPeriodValue)
//           }
//           console.log('Disc WACC ', this.discountingFactorWACC)
        
//         } 
//         valuation = fcff;
        
//         // console.log('Disounting factor ',this.discountingFactorWACC,' ',fcff)
//         if  (i === yearLengthT){
//           // if (inputs.model === 'FCFE') {
//           //   presentFCFF = this.discountingFactorWACC * fcfeValueAtTerminalRate
//           // } else {
//             presentFCFF = this.discountingFactorWACC * fcfeValueAtTerminalRate
          
//         } else {
//           presentFCFF = this.discountingFactorWACC * fcff
//         }
//         console.log("Present FCFF ",presentFCFF);
//         sumOfCashFlows = presentFCFF + sumOfCashFlows;
//         console.log('Sum of cash flow ',i, ' ' ,sumOfCashFlows, 'Eq ',cashEquivalents, 'Surpla ', surplusAssets,'Other ', otherAdj);
//         if  (i === 0) {                     // To be run for first instance only
//           equityValue =
//           // sumOfCashFlows +
//           // debtAsOnDate +
//           cashEquivalents +
//           surplusAssets +
//           otherAdj;
//         }
//         // equityValue = equityValue + sumOfCashFlows;
//         // const valuePerShare = equityValue / outstandingShares;
//         if (inputs.model === 'FCFE') {

//           Net Worth

// Net Profit
// Expected Profit @ Ke
// Excess Return
// Discounting Period
// Discounting Factor @ 14.63%
// Present Value of Excess Return
// Sum of Cash flow to Equity
// Add: Book Value as on Date
// Value of Equity
// No of Shares O/s
// Value per Share

//         result = {
//           netWorth: (i === yearLengthT) ?'Terminal Value':`${year}-${parseInt(year)+1}`,
//           netProfit: (i === yearLengthT) ?'':pat,
//           expectedProfit: (i === yearLengthT) ?'':depAndAmortisation,
//           excessReturn: (i === yearLengthT) ?'':otherNonCashItems,
//           discountingPeriod:excess(i === yearLengthT) ?'':changeInNCA,
//           discountingFactor: (i === yearLengthT) ?'':changeInBorrowingsVal,
//           presentExcessReturn: (i === yearLengthT) ?'':deferredTaxAssets,
          
//           sumCashFlowEquity: i> 0?'':cashEquivalents,
//           bookValue: i> 0?'':surplusAssets,
//           valueEquity: i> 0?'':otherAdj,
//           noOfShares: i> 0?'':outstandingShares,
//           valuePerShare: '',
          
//         }; 
//         discountingPeriodValue = discountingPeriodValue + 1;    
//         // console.log(result);
//         return result;
//       }),
//     );
//     this.customLogger.log({
//       message: 'Request is sucessfully executed in Relative Valuation Service.',
//       userId: inputs.userId,
//     });
//     return {
//       result: finalResult,
//       valuation: { finalPriceAvg: finalPriceAvg, finalPriceMed: finalPriceMed },
//       msg: 'Executed Successfully',
//     };
//   }
// }
