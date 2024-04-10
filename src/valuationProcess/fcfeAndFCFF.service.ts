import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IndustryService } from 'src/industry/industry.service';
import {
  GetPAT,
  DepAndAmortisation,
  OtherNonCashItemsMethod,
  OtherNonCashItemsMethodNext,
  ChangeInNCA,
  DeferredTaxAssets,
  ChangeInFixedAssets,
  GetDebtAsOnDate,
  CashEquivalents,
  SurplusAssets,
  CostOfDebt,
  ProportionOfDebt,
  ProportionOfEquity,
  POPShareCapital,
  CapitalStructure,
  POPShareCapitalLabelPer,
  CapitalStruc,
  getShareholderFunds,
  changeInBorrowings,
  interestAdjustedTaxes,
  fcfeTerminalValue,
  fcffTerminalValue,
  interestAdjustedTaxesWithStubPeriod,
  changeInNcaFromAssessment,
  versionTwoInterestAdjustedTaxesWithStubPeriod,
  netOperatingAssetsFromAssessment,
  // differenceAssetsLiabilities
} from '../excelFileServices/fcfeAndFCFF.method';
import { getYearsList, calculateDaysFromDate,getCellValue,getDiscountingPeriod,searchDate, parseDate, getFormattedProvisionalDate, calculateDateDifference, convertToNumberOrZero } from '../excelFileServices/common.methods';
import { sheet1_PLObj, sheet2_BSObj ,columnsList} from '../excelFileServices/excelSheetConfig';
import { CustomLogger } from 'src/loggerService/logger.service';
import { GET_DATE_MONTH_YEAR_FORMAT, GET_MULTIPLIER_UNITS, MODEL } from 'src/constants/constants';
import { any } from 'joi';
import { async } from 'rxjs';
import { transformData } from 'src/report/report-common-functions';
import { terminalValueWorkingService } from './terminal-value-working.service';
import { ProcessStatusManagerService } from 'src/processStatusManager/process-status-manager.service';
import { ValuationsService } from './valuationProcess.service';
import * as XLSX from 'xlsx';
import e from 'express';
import { PostDcfValuationDto, PostMainValuationDto } from './dto/valuations.dto';
const date = require('date-and-time');

@Injectable()
export class FCFEAndFCFFService {
  constructor(
    private readonly industryService: IndustryService,
    private readonly customLogger: CustomLogger,
    private readonly processManagerService: ProcessStatusManagerService,
    private readonly valuationService: ValuationsService,
    private readonly terminalYearWorkingService: terminalValueWorkingService
  ) {}

  //Common Method for FCFE and FCFF Methods
  
  discountingPeriodObj : any;
  discountingFactorWACC : any;
  stubAdjRequired:boolean = false;
  // async FCFEAndFCFF_Common(
  //   inputs: any,
  //   worksheet1: any,
  //   worksheet2: any,
  //   worksheet3: any,
  // ): Promise<any> {
  //   try{
  //   this.customLogger.log({
  //     message: 'Request is entered into FCFEAndFCFF Service.',
  //     userId: inputs.userId,
  //   });
  //   const { outstandingShares, discountingPeriod, popShareCapitalType } =
  //     inputs;
  //     // console.log(inputs);
  //     // discountingPeriodValue:number: 0;
  //     let equityValue = 0;
  //     let adjCOE;
  //     let adjustedCostOfEquity;
  //     let multiplier = GET_MULTIPLIER_UNITS[`${inputs.reportingUnit}`];
  //     let discountingPeriodValue = 0;
      
  //   const yearsActual = await getYearsList(worksheet1);
    
  //   let provisionalDates = worksheet1['B1'].v
  //   // console.log(' Valuation Date ', inputs.valuationDate)
  //   // console.log('Provisional Date ', provisionalDates);
  //   // console.log(typeof(provisionalDates),'a','a',provisionalDates.trim());
  //   // console.log(typeof('02-01-2015'));
  //   // let provDtRef = date.parse(provisionalDates.trim(), 'DD-MM-YYYY');
  //   let  provDtRef = parseDate(provisionalDates.trim());
  //   // console.log(provDtRef,"prov date",typeof provDtRef);
  //   let diffValProv = parseInt(date.subtract(new Date(inputs.valuationDate),provDtRef).toDays()); 
  //   console.log('Difference in days between provisional and valuation date',diffValProv);

  //   // const provStr = provisionalDates.split(",");
    
  //   // let provDtRef = new date(provisionalDates);
  //   // console.log('Provisional Dates ', provDtRef);
  //   // console.log(provStr.slice(-1).trim());
    
  //   const years = yearsActual.slice(0,parseInt(inputs.projectionYears)+1);
  //   console.log('Net year ',years);
  //   if (years === null)
  //     return {
  //       result: null,
  //       msg: 'Please Separate Text Label and year with comma in B1 Cell in P&L Sheet1.',
  //     };
  //   const discountingPeriodObj = await getDiscountingPeriod(
  //     discountingPeriod
  //   );
    
  //     //c------ Start Sample ----------//
  //   // const valuationDate = new Date(inputs.valuationDate);
  //   // let updDate = date.addDays(valuationDate,1)
  //   // console.log('Valuation Date ', updDate);

  //   // const valuationMonth = updDate.getMonth();
  //   // console.log('Month ',valuationMonth);

  //   //c------ End Sample ----------//
  //   const datePayload = {
  //     valuationDate: new Date(inputs.valuationDate),    //since date format is in unix format
  //     provisionalDate: provDtRef
  //   }
  //   let vdate;
  //   if (diffValProv > 1) {
  //       datePayload['useProvisionalDate'] = true;    //Since we need provisional date here so adding isProvisionalDate key inside payload
  //       vdate = await calculateDaysFromDate(datePayload);
  //   } else {
  //       vdate = await calculateDaysFromDate(datePayload);
  //   }

  //   // console.log('Days left ',vdate);
  //   // var vdayLeft = 365 - vdate;
  //   const monthToCheckProv = provDtRef.getMonth() === 0 || provDtRef.getMonth() === 1 || provDtRef.getMonth() === 2;
  //   let provAdjYears:Array<string> = [], counter = 0;
  //   if (!vdate.isProvisionalYearFull && monthToCheckProv) {
  //     for await (const indYear of yearsActual){
  //       if(counter === 0){
  //         provAdjYears.push(`${+indYear-1}`)
  //       }
  //       provAdjYears.push(indYear);
  //       counter++;
  //     }
  //     console.log(provAdjYears,"provisional adjusted years--->120")
  //   }



  //   console.log('total days ',vdate.totalDays);
  //   console.log('is leap ',vdate.isLeapYear);
  //   if (diffValProv > 1 || vdate.dateDiff < vdate.totalDays ) {
  //   // if (vdate.dateDiff < vdate.totalDays) {
  //     this.stubAdjRequired = true;
  //   }
  //   console.log('Which period, is STUB needed?',this.stubAdjRequired);
  //   // vdayLeft = vdayLeft <= 1 ? 365 : vdayLeft;

  //   console.log('Days left in financial year ', vdate.dateDiff);
  //   // if (vday <= 90) {
  //   //   vdayLeft = 90 - vday;
  //   // } else {
  //   //   vdayLeft = 365 - vday - 90;
  //   // }
    
  //   if (popShareCapitalType === 'DFBS_PC') {
  //     const popShareCapitalValue = await POPShareCapitalLabelPer(0, worksheet2);
  //     if (popShareCapitalValue > 100)
  //       return {
  //         result: null,
  //         msg: 'Invalid: Preference Share Capital % value.',
  //       };
  //   }
    
  //   if (discountingPeriodObj.result == null) return discountingPeriodObj;
  //   discountingPeriodValue = discountingPeriodObj.result;
  //   // console.log('Discoun Val ',discountingPeriod,discountingPeriodValue );

  //   console.log('Discoun Val ',discountingPeriodValue);
    
  //   let fractionOfYearLeft = this.stubAdjRequired == true ? (vdate.dateDiff-1)/ vdate.totalDays: vdate.dateDiff/vdate.totalDays;            // Adjust based on next fiscal year
  //   console.log('Faction Year left ', fractionOfYearLeft);
  //   discountingPeriodValue = fractionOfYearLeft * discountingPeriodValue;      // To be used as in WACC Calc next
  //   console.log('discountingPeriodValue ',discountingPeriodValue);
  //   let valuation = null;
  //   let finalWacc = 0;
  //   let finalDebt = 0;
  //   let yearstoUse = years.slice(0, -1);
  //   let yearsLength = years.length;
  //   const yearLengthT = yearsLength - 1;
  //   let sumOfCashFlows = 0;
  //   // let debtAsOnDate = 0;
  //   let calculatedWacc = 0;
  //   let capitalStruc;
    
  //   // console.log(yearsLength);
  //   const finalResult = await Promise.all(
  //     years.map(async (year: string, i: number) => {
        
  //       let changeInNCA = null;
  //       let deferredTaxAssets = null;
  //       let changeInBorrowingsVal = 0;
  //       let addInterestAdjTaxes = 0;
  //       let addInterestAdjustedTaxesStub = 0;
  //       let result = {};
  //       // let fcff = 0;
  //       let fcfeValueAtTerminalRate = 0;
  //       let fcffValueAtTerminalRate = 0;
  //       let netOperatingAssets;
  //       let netOperatingAssetsInit = 0;
  //       // let equityValue =0;
  //       let presentFCFF = 0;
        
  //       //Get PAT value

  //       // console.log('discountingPeriodValue ',discountingPeriodValue);
  //       // For mid year calculation need nextPAT,depAndAmortisationNext

  //       // console.log("Value of i ",i);
  //       const patNext = await getCellValue(
  //         worksheet1,
  //         `${columnsList[i+1] + sheet1_PLObj.patRow}`,
  //       );
  //       const depAndAmortisationNext = await getCellValue(
  //         worksheet1,
  //         `${columnsList[i+1] + sheet1_PLObj.depAndAmortisationRow}`,
  //       );

  //       let pat = await GetPAT(i+1, worksheet1);
  //       let patOld = await GetPAT(i,worksheet1);
  //       pat = i === 0 && this.stubAdjRequired == true && vdate.isProvisionalYearFull == false  ? pat-patOld : pat;
  //       // if (pat !== null) pat = pat;
  //       // pat = i === 0 ? patNext - pat:pat;
  //       console.log('PAT ',pat);
  //       //Get Depn and Amortisation value
  //       let depAndAmortisation = await DepAndAmortisation(i+1, worksheet1);
  //       let depAndAmortisationOld = await DepAndAmortisation(i, worksheet1);

  //       // netOperatingAssets = await differenceAssetsLiabilities(i,worksheet3);
  //       // const netOperatingDifference = i === 0 ? 0 : netOperatingAssets-netOperatingAssetsInit;
  //       // netOperatingAssetsInit = netOperatingAssets;   // Storing past value to get difference
        

  //       depAndAmortisation = i === 0 && this.stubAdjRequired == true && vdate.isProvisionalYearFull == false  ? depAndAmortisation - depAndAmortisationOld:depAndAmortisation;

  //       //Get Oher Non Cash items Value
  //       let otherNonCashItems = await OtherNonCashItemsMethod(i+1, worksheet1);
  //       let otherNonCashItemsOld = await OtherNonCashItemsMethodNext(i, worksheet1);
  //       otherNonCashItems = i === 0 && this.stubAdjRequired == true && vdate.isProvisionalYearFull == false ? otherNonCashItems - otherNonCashItemsOld : otherNonCashItems;
  //       const changeInNCAValue = await ChangeInNCA(i, worksheet2,worksheet3);
  //       changeInNCA = changeInNCAValue;

  //       const deferredTaxAssetsValue = await DeferredTaxAssets(i, worksheet2);
  //       deferredTaxAssets =  deferredTaxAssetsValue;
        
  //       var changeInFixedAssets = await ChangeInFixedAssets(i, worksheet2);
  //       // if (i===0) {
  //       adjustedCostOfEquity = await this.industryService.CAPM_Method(inputs);
  //       adjCOE = adjustedCostOfEquity;        // To be used outside block;
  //       console.log("Adjusted COE ",adjustedCostOfEquity );
  //       // }
  //       // console.log('Change in Net Fixed Assets ', changeInFixedAssets);
        
  //       // console.log('disc ', discountingPeriodValue);
  //       // var ndiscountingPeriodValue = discountingPeriodValue + 1
       


        
  //       // console.log('WACC Value - ',this.discountingFactorWACC);
  //       // if (i === 0)        // Control from here not to print next set of values
  //                                                                      // old code ->     discountingFactorValue * fcff;
        
  //       // console.log('out disc ', discountingPeriodValue);
  //       // const sumOfCashFlows = 1000000; //presentFCFF;                                                     // To be checked
  //       let debtAsOnDate = await GetDebtAsOnDate(i, worksheet2);
  //       const cashEquivalents = await CashEquivalents(i, worksheet2);
  //       const surplusAssets = await SurplusAssets(i, worksheet2);
  //       changeInBorrowingsVal = await changeInBorrowings(i, worksheet2);
  //       // console.log('Borrowings, ',changeInBorrowingsVal);
  //       addInterestAdjTaxes = await interestAdjustedTaxes(i,worksheet1,inputs.taxRate);
  //       addInterestAdjustedTaxesStub = await interestAdjustedTaxesWithStubPeriod(i,worksheet1,inputs.taxRate);
  //       addInterestAdjTaxes = i === 0 && this.stubAdjRequired == true && vdate.isProvisionalYearFull == false  ? addInterestAdjustedTaxesStub:addInterestAdjTaxes;
        
      
  //       // if (i === 0 && inputs.model.includes('FCFF')){      // optimize code not to run this block multiple times
  //       // Adding i = 0 check is causing discounting period to work incorrectly in first column
        
  //       const shareholderFunds = await getShareholderFunds(0,worksheet2);
        
  //         capitalStruc = await CapitalStruc(0,worksheet2,shareholderFunds,inputs);
        
  //       console.log(capitalStruc);
  //       calculatedWacc = adjustedCostOfEquity/100 * capitalStruc.equityProp + (parseFloat(inputs.costOfDebt)/100)*(1-parseFloat(inputs.taxRate)/100)*capitalStruc.debtProp + parseFloat(inputs.copShareCapital)/100 * capitalStruc.prefProp;
  //       // finalWacc = calculatedWacc;
  //       // console.log(debtAsOnDate,"debt as on date fcff")  
  //       // finalDebt = debtAsOnDate;
  //     // }
  //       console.log('WACC Calculat- ',i,' ',calculatedWacc);
  //       const otherAdj = parseFloat(inputs.otherAdj);                                                       // ValidateHere
  //       //formula: =+B16-B17+B18+B19+B20
  //       // console.log('out disc ', discountingPeriodValue);

        
  //       let netCashFlow =0 ;
  //       if (inputs.model.includes('FCFE')) {
          
  //         netCashFlow = pat + depAndAmortisation + otherNonCashItems + changeInNCA + deferredTaxAssets + changeInBorrowingsVal;
  //       } else {
  //         netCashFlow = pat + depAndAmortisation + otherNonCashItems + changeInNCA + deferredTaxAssets  + addInterestAdjTaxes;
  //       }
          
  //       changeInFixedAssets = changeInFixedAssets - depAndAmortisation;
  //       const fcff = netCashFlow + changeInFixedAssets ;    
  //       console.log("Value at ",fcff,' ',i, ' ', yearLengthT);
  //       // Calculate wacc for FCFF
  //       // =+D22*D30+D26*(1-D7)*D29+D24*D31

  //       // this.calculatedWacc = adjustedCostOfEquity * capitalStruc.equityProp + (inputs.costOfDebt/100)*(1-inputs.taxRate/100)*capitalStruc.debtProp + inputs.copShareCapital/100 * capitalStruc.prefProp

  //       if  (i === yearLengthT && inputs.model.includes('FCFE')) {                                // Valuation data
  //       fcfeValueAtTerminalRate = await fcfeTerminalValue(valuation,inputs.terminalGrowthRate,adjustedCostOfEquity)
  //       console.log('ter val ',fcfeValueAtTerminalRate,' ', valuation);
  //       // console.log('fcfe ter ', fcfeValueAtTerminalRate)
  //       discountingPeriodValue = discountingPeriodValue - 1;
  //       } else if (i === yearLengthT && inputs.model.includes('FCFF')) {  
  //         fcfeValueAtTerminalRate = await fcffTerminalValue(valuation,inputs.terminalGrowthRate, finalWacc)
  //         discountingPeriodValue = discountingPeriodValue - 1;
  //       }
  //       // console.log('Term - ',fcffValueAtTerminalRate);
        
  //       if (i === 0) {                      // 
  //       finalWacc = calculatedWacc;
  //       finalDebt = debtAsOnDate;
  //       }

  //       // console.log('discountingPeriodValue ',discountingPeriodValue);
  //         // console.log('Final Deb ',finalDebt);
  //       if (inputs.model.includes('FCFE')) {
  //         // changeInBorrowingsVal = await changeInBorrowings(i, worksheet2);
  //         if (i === yearLengthT) {
  //           // Do nothing
  //         } else {
  //         this.discountingFactorWACC = 1/ (1+adjustedCostOfEquity/100) ** (discountingPeriodValue)
  //         }
  //         console.log('Disc COE ', this.discountingFactorWACC)
         
  //       } else if (inputs.model.includes('FCFF')) {
  //         // addInterestAdjTaxes = await interestAdjustedTaxes(i,worksheet1,inputs.taxRate);
  //         if (i === yearLengthT) {
  //           // Do nothing
  //         } else {
  //         this.discountingFactorWACC = 1/ (1+finalWacc) ** (discountingPeriodValue)
  //         }
  //         console.log('Disc WACC ', this.discountingFactorWACC)
        
  //       } 
  //       valuation = fcff;
        
  //       // console.log('Disounting factor ',this.discountingFactorWACC,' ',fcff)
  //       if  (i === yearLengthT){
  //         // if (inputs.model === 'FCFE') {
  //         //   presentFCFF = this.discountingFactorWACC * fcfeValueAtTerminalRate
  //         // } else {
  //           presentFCFF = this.discountingFactorWACC * fcfeValueAtTerminalRate
          
  //       } else {
  //         presentFCFF = this.discountingFactorWACC * fcff
  //       }
  //       console.log("Present FCFF ",presentFCFF);
  //       sumOfCashFlows = presentFCFF + sumOfCashFlows;
  //       console.log('Sum of cash flow ',i, ' ' ,sumOfCashFlows, 'Eq ',cashEquivalents, 'Surpla ', surplusAssets,'Other ', otherAdj);
  //       if  (i === 0) {                     // To be run for first instance only
  //         equityValue =
  //         // sumOfCashFlows +
  //         // debtAsOnDate +
  //         cashEquivalents +
  //         surplusAssets +
  //         otherAdj;
  //       }
  //       // equityValue = equityValue + sumOfCashFlows;
  //       // const valuePerShare = equityValue / outstandingShares;
  //       if (inputs.model.includes('FCFE')) {
  //       result = {
  //         particulars: GET_DATE_MONTH_YEAR_FORMAT.test(year) ? `${year}` :  (i === yearLengthT) ?'Terminal Value':`${year}-${parseInt(year)+1}`,
  //         pat: (i === yearLengthT) ?'':pat,
  //         depAndAmortisation: (i === yearLengthT) ?'':depAndAmortisation,
  //         onCashItems: (i === yearLengthT) ?'':otherNonCashItems,
  //         nca: (i === yearLengthT) ?'':changeInNCA,
  //         changeInBorrowings: (i === yearLengthT) ?'':changeInBorrowingsVal,
  //         defferedTaxAssets: (i === yearLengthT) ?'':deferredTaxAssets,
  //         netCashFlow: (i === yearLengthT) ?'':netCashFlow,
  //         fixedAssets: (i === yearLengthT) ?'':changeInFixedAssets,
  //         fcff: (i === yearLengthT) ?fcfeValueAtTerminalRate:fcff,
  //         discountingPeriod: discountingPeriodValue,
  //         discountingFactor: this.discountingFactorWACC,
  //         presentFCFF: presentFCFF,
  //         sumOfCashFlows: '',
  //         // debtOnDate: i> 0?'':finalDebt,
  //         cashEquivalents: i> 0?'':cashEquivalents,
  //         surplusAssets: i> 0?'':surplusAssets,
  //         otherAdj: i> 0?'':otherAdj,
  //         equityValue: '',
  //         noOfShares: i> 0?'':outstandingShares,
  //         valuePerShare: '',
  //         // totalFlow: this.discountingFactorWACC + i
  //       }; 
  //     } else if (inputs.model.includes('FCFF')) {
  //       result = {
  //         particulars: GET_DATE_MONTH_YEAR_FORMAT.test(year) ? `${year}` :  (i === yearLengthT) ?'Terminal Value':`${year}-${parseInt(year)+1}`,
  //         pat: (i === yearLengthT) ?'':pat,
  //         addInterestAdjTaxes: (i === yearLengthT) ?'':addInterestAdjTaxes,
  //         depAndAmortisation: (i === yearLengthT) ?'':depAndAmortisation,
  //         onCashItems: (i === yearLengthT) ?'':otherNonCashItems,
  //         nca: (i === yearLengthT) ?'':changeInNCA,
  //         defferedTaxAssets: (i === yearLengthT) ?'':deferredTaxAssets,
  //         netCashFlow: (i === yearLengthT) ?'':netCashFlow,
  //         fixedAssets: (i === yearLengthT) ?'':changeInFixedAssets,
  //         fcff: (i === yearLengthT) ?fcfeValueAtTerminalRate:fcff,
  //         discountingPeriod: discountingPeriodValue,
  //         discountingFactor: this.discountingFactorWACC,
  //         presentFCFF: presentFCFF,
  //         sumOfCashFlows: '',
  //         debtOnDate: i> 0?'':finalDebt,
  //         cashEquivalents: i> 0?'':cashEquivalents,
  //         surplusAssets: i> 0?'':surplusAssets,
  //         otherAdj: i> 0?'':otherAdj,
  //         equityValue: '',
  //         noOfShares: i> 0?'':outstandingShares,
  //         valuePerShare: '',
  //       }; 
  //     }
  //       discountingPeriodValue = discountingPeriodValue + 1;    
  //       // console.log(result);
  //       return result;
  //     }),
  //   );
    
  //   // let lastElement = finalResult.slice(-1);
  //   finalResult[0].sumOfCashFlows = sumOfCashFlows;
  //   finalResult[0].equityValue = inputs.model.includes('FCFE')? equityValue + sumOfCashFlows:equityValue + sumOfCashFlows - finalDebt;
  //   finalResult[0].valuePerShare = (finalResult[0].equityValue*multiplier)/outstandingShares;       // Applying mulitplier for figures
  //   // delete finalResult[0].totalFlow;                        // Remove to avoid showing up in display
    
  //   if (this.stubAdjRequired === true && diffValProv > 1) {
  //     // console.log("gar ",diffValProv);
  //     let stubFactor = (1 + diffValProv/365) ** (adjCOE/100)-1;

  //     // console.log(stubFactor);
  //     let equityValueToAdj = stubFactor * finalResult[0].equityValue;
  //     console.log('Stub Factor ',stubFactor);
  //     let keyValues = Object.entries(finalResult[0]);
  //     keyValues.splice(-2,0, ["stubAdjValue",equityValueToAdj]);
  //     keyValues.splice(-2,0, ["equityValueNew",finalResult[0].equityValue + equityValueToAdj ]);
  //     let newObj = Object.fromEntries(keyValues);
  //     finalResult[0] = newObj;
  //     finalResult[0].valuePerShare = ((finalResult[0].equityValue + equityValueToAdj)*multiplier)/outstandingShares;       // Applying mulitplier for figures
  //     // console.log('new EPV ',((finalResult[0].equityValue + equityValueToAdj)*100000)/outstandingShares);
  //   }

  //   // let equityValueDate = await getFormattedProvisionalDate(new Date(provDtRef));
  //   const provisionalDate = provDtRef;
    
  //   this.stubAdjRequired = false;                              // Resetting to default;
  //   const checkIfStub = finalResult.some((item,i)=>item.stubAdjValue);
  //   const data = await this.transformData(finalResult);
  //   return { result: finalResult, tableData:data.transposedResult, valuation:checkIfStub? finalResult[0].equityValueNew :finalResult[0].equityValue,columnHeader:data.columnHeader,provisionalDate,
  //     msg: 'Executed Successfully' };
  // }catch(error){
  //   console.log(error)
  //   throw  error;
  // }
  // }

  async fcfeAndFcffValuation(body:any){
    try{
      const dataInputs = body.inputs;
      const worksheet1 = body.worksheet1;
      const worksheet2 = body.worksheet2;

      const { outstandingShares } = dataInputs;
      let multiplier = GET_MULTIPLIER_UNITS[`${dataInputs.reportingUnit}`];

      const adjustedCostOfEquity = await this.industryService.CAPM_Method(dataInputs);

      const yearsActual = await getYearsList(worksheet1);

      let provisionalDates = worksheet1['B1'].v || worksheet2['B1'].v;

      let  provDtRef = parseDate(provisionalDates.trim());
      console.log(provDtRef,"provisional date")

      const decodeValuationDate =  new Date(dataInputs.valuationDate);    //Since valuation date is in unix time stamp, we need to convert it into readable date format which is eg. 2023-03-30T18:30:00.000Z
      console.log(decodeValuationDate, "valuation date")

      const isStubRequired = await this.isStubRequired(provDtRef, decodeValuationDate); //checking if stub is required or not
      console.log(isStubRequired, "stub required")

      let totalDaysDifferenceStubAdjustment, totalDaysDifferenceDiscountingFactor;

      if(isStubRequired){
        totalDaysDifferenceStubAdjustment = await this.subtractProvisionalDateByValuationDate(provDtRef, decodeValuationDate); //calculating number of days from provisional date - valuation date difference
        console.log(totalDaysDifferenceStubAdjustment," total days difference in stub adjustment")
      }

    const isDiscountingFactorAdjustmentRequired = await this.isDiscountingFactorRequired(provDtRef);  //checking if discountingFactorAdjustment is required or not
    if(isDiscountingFactorAdjustmentRequired){
      totalDaysDifferenceDiscountingFactor = await this.subtractValuationDateByFincancialYearEndDate(decodeValuationDate, provDtRef);   //calculating number of days from valuation date - financial year end date difference
    }
    console.log(isDiscountingFactorAdjustmentRequired," discounting factor required")

    const checkPartialFinancialYear = await this.checkPartialFinancialYear(provDtRef);  //checking if the provisional year is partial or not, if partial then implementing the subtraction of first and second columns logic below

    console.log(checkPartialFinancialYear,"partial financial year")

    const years = yearsActual.slice(0,parseInt(dataInputs.projectionYears)+1);

    const aggregateBody = {
      years,
      ...body,
      isStubRequired,
      totalDaysDifferenceStubAdjustment,
      isDiscountingFactorAdjustmentRequired,
      totalDaysDifferenceDiscountingFactor,
      checkPartialFinancialYear,
      provDtRef
    }

    const resultAggregate:any = await this.assessValuation(aggregateBody); //calculating whole aggregate 
    
    
    if (isStubRequired && totalDaysDifferenceStubAdjustment > 1) { //based on the above conditions, calculating stub
      let stubFactor = (1 + totalDaysDifferenceStubAdjustment/365) ** (adjustedCostOfEquity/100)-1;
      let equityValueToAdj = stubFactor * resultAggregate.resultArray[0].equityValue;
      
      // let equityValueToAdj = +resultAggregate[0].equityValue  * (Math.pow(1 + ((adjustedCostOfEquity/100)/ 365), totalDaysDifferenceStubAdjustment ) - 1); // Confirmation pending 
      console.log('Stub Factor ',stubFactor);
      let keyValues = Object.entries(resultAggregate.resultArray[0]);
      keyValues.splice(-2,0, ["stubAdjValue",equityValueToAdj]);
      keyValues.splice(-2,0, ["equityValueNew",resultAggregate.resultArray[0].equityValue + equityValueToAdj ]);
      let newObj = Object.fromEntries(keyValues);
      resultAggregate.resultArray[0] = newObj;
      resultAggregate.resultArray[0].valuePerShare = ((resultAggregate.resultArray[0].equityValue + equityValueToAdj)*multiplier)/outstandingShares;       // Applying mulitplier for figures
    }
    
      const provisionalDate = provDtRef;                          // Resetting to default;
      const checkIfStub = resultAggregate.resultArray.some((item,i)=>item.stubAdjValue);
      const data = await this.transformData(resultAggregate.resultArray);
      return {
        result: resultAggregate.resultArray, tableData:data.transposedResult, 
        valuation:checkIfStub? resultAggregate.resultArray[0].equityValueNew :resultAggregate.resultArray[0].equityValue,
        columnHeader:data.columnHeader,provisionalDate,
        terminalValueWorking:resultAggregate.terminalValueWorking,
        msg: 'Executed Successfully' 
      };
    }
    catch(error){
      console.log(error,"error ---> 552")
      throw new HttpException(
        {
          error: error,
          status: false,
          msg: 'valuation computation failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    }


    async checkPartialFinancialYear(provisionalDate:any){
      const cleanProvisionalDate = new Date(provisionalDate);

      const provisionalMonth = cleanProvisionalDate.getMonth() + 1; // Since months are zero-based (0-Jan, 1-Feb, ..., 11-Dec)
      const provisionalDay = cleanProvisionalDate.getDate();

      // Check if not equal to 31st March
      if (provisionalMonth !== 3 || provisionalDay !== 31) { // March is month index 2
          return true; // Return true indicating partial financial year
      } else {
          return false; // Return false indicating full financial year
      }
    }

    async subtractProvisionalDateByValuationDate(provisionalDate:any, valuationDate:any){
      const cleanProvisionalDate:any = new Date(provisionalDate);
      const cleanValuationDate:any = new Date(valuationDate);

       const differenceInMilliseconds = cleanValuationDate - cleanProvisionalDate;

       // Convert the difference to days (divide by milliseconds in a day)
      const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

      return differenceInDays;
    }

    async subtractValuationDateByFincancialYearEndDate(valuationDate:any, provisionalDate:any){
      const cleanValuationDate:any = new Date(valuationDate);
      const cleanProvisionalDate:any = new Date(provisionalDate);
  
      // End of the financial year (31st March of the financial year)
      const fiscalYearEnd:any = await this.computeFinancialYearEndDate(cleanProvisionalDate); //computing financial year

      const differenceInMilliseconds =  fiscalYearEnd - cleanValuationDate;
  
      // Convert the difference to days (divide by milliseconds in a day)
      const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  
      return differenceInDays;
    }

    async computeFinancialYearEndDate(provisionalDate){    //Always pass provisioanl date it will give you  only financial year
      const cleanProvisionalDate = new Date(provisionalDate);

      const provisionalYear = cleanProvisionalDate.getFullYear();

      const provisionalBasedFinancialYear = new Date(provisionalYear, 2, 31);

      const currentYear = new Date().getFullYear();
      const currentFinancialDate = new Date(currentYear, 2, 31);

      const fiscalYearEnd:any = new Date(currentYear, 2, 31); // March is month index 2

      return cleanProvisionalDate <= fiscalYearEnd ? provisionalBasedFinancialYear : currentFinancialDate; 
    }

    async isStubRequired(provisionalDate, valuationDate){
      const cleanValuationDate = new Date(valuationDate);
      const cleanProvisionalDate = new Date(provisionalDate);

      return cleanValuationDate.getTime() > cleanProvisionalDate.getTime();
    }

    async isDiscountingFactorRequired(provisionalDate){
      const cleanProvisionalDate = new Date(provisionalDate);

      const provisionalDay = cleanProvisionalDate.getDate();
      const provisionalMonth = cleanProvisionalDate.getMonth() + 1; // Since months are zero-based (0-Jan, 1-Feb, ..., 11-Dec)

      // Compare with 31st March 2023
      return !(provisionalMonth === 3 && provisionalDay === 31);    //Since we need to check if provisional date is of 31st if the provisional date is equal to 31st, march 2023 then discounting adjustment factor is applicable
    }

    async recalculatePat(index, worksheet){
      let pat = await GetPAT(index+1, worksheet);
      let patOld = await GetPAT(index,worksheet);
      return pat-patOld;
    }

    async recalculateDepnAndAmortisation(index, worksheet){
      let depAndAmortisation = await DepAndAmortisation(index+1, worksheet);
      let DepAndAmortisationOld = await DepAndAmortisation(index,worksheet);
      return depAndAmortisation-DepAndAmortisationOld;
    }

    async recalculateOtherNonCashItems(index, worksheet){
      let otherNonCashItem = await OtherNonCashItemsMethodNext(index+1, worksheet);
      let otherNonCashItemOld = await OtherNonCashItemsMethodNext(index,worksheet);
      return otherNonCashItem-otherNonCashItemOld;
    }

    async calculateWacc(waccPayload){
      return waccPayload.adjustedCostOfEquity/100 * waccPayload.capitalStruc.equityProp + 
          (
            parseFloat(waccPayload.costOfDebt)/100)*(1-parseFloat(waccPayload.taxRate)/100
          )
          *
          waccPayload.capitalStruc.debtProp + parseFloat(waccPayload.copShareCapital)/100 
          * waccPayload.capitalStruc.prefProp;
    }

    async assessValuation(aggregatePayload){
      try{
        const { outstandingShares, discountingPeriod } = aggregatePayload.inputs;
        let multiplier = GET_MULTIPLIER_UNITS[`${aggregatePayload.inputs.reportingUnit}`];
        let counter = 0, debtOnIndexZero, discountingFactorWacc, secondLastFcfe = 0, sumOfCashFlows = 0, equityValue = 0,terminalDiscountingPeriod;      //This will act as index inside for loop;
        const years = aggregatePayload.years;
        const worksheet1 = aggregatePayload.worksheet1;
        const worksheet2 = aggregatePayload.worksheet2;
        const worksheet3 = aggregatePayload.worksheet3;

        const adjustedCostOfEquity = await this.industryService.CAPM_Method(aggregatePayload.inputs);
        const shareholderFunds = await getShareholderFunds(0,worksheet2);
        const capitalStruc = await CapitalStruc(0,worksheet2,shareholderFunds,aggregatePayload.inputs);
        const otherAdj = parseFloat(aggregatePayload.inputs.otherAdj) || 0; 
        const calculateWaccPayload = {
          adjustedCostOfEquity,
          capitalStruc,
          costOfDebt: aggregatePayload.inputs.costOfDebt,
          taxRate: aggregatePayload.inputs.taxRate,
          copShareCapital: aggregatePayload.inputs.copShareCapital
        }

        const calculatedWacc = await this.calculateWacc(calculateWaccPayload);

        const yearLength = years.length - 1;
        let resultArray = [];
        console.log(years,"years")

        const datePayload = {
          valuationDate: new Date(aggregatePayload.inputs.valuationDate),    //since date format is in unix format
          provisionalDate: aggregatePayload.provDtRef
        };
        
        let vdate = await calculateDaysFromDate(datePayload);
        // if (aggregatePayload.totalDaysDifferenceStubAdjustment > 1) {
        //   datePayload['useProvisionalDate'] = true;    //Since we need provisional date here so adding isProvisionalDate key inside payload
        // } else {
        //     vdate = await calculateDaysFromDate(datePayload);
        // }

        const discountingPeriodObj = await getDiscountingPeriod(discountingPeriod);
      
        // calculating fraction of year : if provisional date is 31st,March, use 1 else use the totalDaysDifferenceDiscountingFactor/totalDays  
        const fractionOfYearLeft = aggregatePayload.isDiscountingFactorAdjustmentRequired ? vdate.dateDiff/vdate.totalDays : 1;
    
        console.log(fractionOfYearLeft,"date difference ---->688")
        console.log(aggregatePayload.totalDaysDifferenceDiscountingFactor,"total date difference ---->689", discountingPeriodObj.result)
        let discountingPeriodValue = fractionOfYearLeft * discountingPeriodObj.result;

        let terminalValueWorking, pvTerminalValue,pat, depAndAmortisation, otherNonCashItems, changeInBorrowing, fcff, addInterestAdjTaxes, netCashFlow;
        for await (const individualYear of years){    //Use for await, map is not to be used, map handles large loads of data incorrectly 
            let  changeInNca, deferredTaxAssets, 
            changeInFixedAssets, debtAsOnDate, cashEquivalents, surplusAssets,  
            fcfeValueAtTerminalRate,
            presentFCFF,terminalValuePat,terminalValueDepAndAmortisation,terminalValueNca,
            terminalValueChangeInBorrowings, terminalValueAddInterestAdjTaxes;

            //  In this if condition itself we are recalculating all the values
            if(counter === 0 && aggregatePayload.checkPartialFinancialYear){    //checking if the the provisional date is not 31st,March
              console.log("inside partial years calculations")
              pat  = await this.recalculatePat(counter, worksheet1);
              depAndAmortisation = await this.recalculateDepnAndAmortisation(counter, worksheet1);
              otherNonCashItems = await this.recalculateOtherNonCashItems(counter, worksheet1);
            }
            else if(counter !== yearLength){
              pat = await GetPAT(counter+1, worksheet1);
              depAndAmortisation = await DepAndAmortisation(counter+1, worksheet1);
              otherNonCashItems = await OtherNonCashItemsMethodNext(counter+1, worksheet1);
            }

            // Please verify this stub value, stub is working,but not sure about the value 
            if(aggregatePayload.isStubRequired){
              if(counter === 0){
                addInterestAdjTaxes = await interestAdjustedTaxesWithStubPeriod(counter, worksheet1, aggregatePayload?.inputs?.taxRate);
              }
              else{
                addInterestAdjTaxes = await versionTwoInterestAdjustedTaxesWithStubPeriod(counter, worksheet1, aggregatePayload?.inputs?.taxRate);
              }
            }
            else{
              addInterestAdjTaxes = await interestAdjustedTaxes(counter, worksheet1, aggregatePayload?.inputs?.taxRate)
            }

            if(counter !== yearLength){
              changeInNca =  await changeInNcaFromAssessment(counter, worksheet3);
            }
            
            deferredTaxAssets = await DeferredTaxAssets(counter, worksheet2);
            
            changeInFixedAssets =  -(await ChangeInFixedAssets(counter, worksheet2) + depAndAmortisation);  //Since formula for changeInFixedAssets =  -(closing value - opening value + depnAndAmortisation) - As per discussions with sonal  02-03-2024
            console.log(changeInFixedAssets, "fixed assets")

            debtAsOnDate = await GetDebtAsOnDate(counter, worksheet2);

            if(counter === 0){
              debtOnIndexZero = debtAsOnDate; 
            }

            cashEquivalents = await CashEquivalents(counter, worksheet2);
            surplusAssets = await SurplusAssets(counter, worksheet2);
            changeInBorrowing = await changeInBorrowings(counter, worksheet2);

            if (aggregatePayload.inputs.model.includes('FCFE')) {
              netCashFlow = pat + depAndAmortisation + otherNonCashItems + changeInNca + deferredTaxAssets + changeInBorrowing;
            } else {
              netCashFlow = pat + depAndAmortisation + otherNonCashItems + changeInNca + deferredTaxAssets  + addInterestAdjTaxes;
            }

            // const differenceInFixedAssetAndDepnAndAmortisation = changeInFixedAssets;
            // console.log(depAndAmortisation,"depn and amortisation", differenceInFixedAssetAndDepnAndAmortisation)
            if(counter !== yearLength){
              fcff = changeInFixedAssets + netCashFlow ;
            }
    
            if  (counter === yearLength && aggregatePayload.inputs.model.includes('FCFE')) {
              console.log(secondLastFcfe,"")
              fcfeValueAtTerminalRate = await fcfeTerminalValue(secondLastFcfe, aggregatePayload.inputs.terminalGrowthRate,adjustedCostOfEquity)
              // discountingPeriodValue = discountingPeriodValue - 1;
            } 
            else if (counter === yearLength && aggregatePayload.inputs.model.includes('FCFF')) {
              fcfeValueAtTerminalRate = await fcffTerminalValue(secondLastFcfe, aggregatePayload.inputs.terminalGrowthRate, calculatedWacc)
              // discountingPeriodValue = discountingPeriodValue - 1;
            }


            if(discountingPeriod  !== yearLength){    //Forcing discounting period value in terminal value column to be  
              terminalDiscountingPeriod = discountingPeriodValue-1;
            }

            if (aggregatePayload.inputs.model.includes('FCFE')) {
              if (counter !== yearLength){
                discountingFactorWacc = 1/ (1+adjustedCostOfEquity/100) ** (discountingPeriodValue)
              }
              console.log('Disc COE ', discountingFactorWacc)
             
            } 
            else if (aggregatePayload.inputs.model.includes('FCFF')) {
              if (counter !== yearLength){
                discountingFactorWacc = 1/ (1+calculatedWacc) ** (discountingPeriodValue)
              }
              console.log('Disc WACC ', discountingFactorWacc)
            
            } 

            if(counter === yearLength){
                presentFCFF = discountingFactorWacc * fcfeValueAtTerminalRate;
                pvTerminalValue = presentFCFF;
                console.log(pat,"pat found")
                // calculating PAT
                terminalValuePat = pat * (1 + (aggregatePayload.inputs.terminalGrowthRate/100));
                
                // calculating Dept and Amortisation
                terminalValueDepAndAmortisation = depAndAmortisation * (1 + (aggregatePayload.inputs.terminalGrowthRate/100));
                
                // calculating Changes In NCA
                const netOperatingAssets = await netOperatingAssetsFromAssessment(counter,worksheet3);
                const terminalValueNetOperatingAsset = netOperatingAssets * (1 + (aggregatePayload.inputs.terminalGrowthRate/100));
                terminalValueNca = netOperatingAssets - terminalValueNetOperatingAsset;

                // calculating Change in Borrowings
                terminalValueChangeInBorrowings = changeInBorrowing - (changeInBorrowing * (1 + (aggregatePayload.inputs.terminalGrowthRate/100)));
                
                // calculating add:Interest
                terminalValueAddInterestAdjTaxes = addInterestAdjTaxes - (addInterestAdjTaxes * (1 + (aggregatePayload.inputs.terminalGrowthRate/100)));
                console.log(changeInBorrowing,"change in borrowings", terminalValueChangeInBorrowings)
            } else {
              presentFCFF = discountingFactorWacc * fcff
              sumOfCashFlows = presentFCFF + sumOfCashFlows;
            }


            if  (counter === 0) {                     // To be run for first instance only
              equityValue = cashEquivalents + surplusAssets + otherAdj;
            }

            const isFCFE = aggregatePayload.inputs.model.includes('FCFE');
            const isFCFF = aggregatePayload.inputs.model.includes('FCFF');
            let  result;
            if(counter !== yearLength){
               result = {
                particulars: GET_DATE_MONTH_YEAR_FORMAT.test(individualYear) ? `${individualYear}` : (counter === yearLength ? 'Terminal Value' : `${individualYear}-${parseInt(individualYear) + 1}`),
                pat: counter === yearLength ? '' : pat,
                addInterestAdjTaxes:counter === yearLength ?'':addInterestAdjTaxes,
                depAndAmortisation: counter === yearLength ? '' : depAndAmortisation,
                onCashItems: counter === yearLength ? '' : otherNonCashItems,
                nca: counter === yearLength ? '' : changeInNca,
                changeInBorrowings: counter === yearLength ? '' : changeInBorrowing,
                defferedTaxAssets: counter === yearLength ? '' : deferredTaxAssets,
                netCashFlow: counter === yearLength ? '' : netCashFlow,
                fixedAssets: counter === yearLength ? '' : changeInFixedAssets,
                fcff: counter === yearLength ? fcfeValueAtTerminalRate:fcff,
                discountingPeriod:counter === yearLength ? terminalDiscountingPeriod :  discountingPeriodValue,
                discountingFactor: discountingFactorWacc,
                presentFCFF: presentFCFF,
                sumOfCashFlows: '',
                pvTerminalValue: '',
                debtOnDate: counter > 0 ? '' : debtOnIndexZero,
                cashEquivalents: counter > 0 ? '' : cashEquivalents,
                surplusAssets: counter > 0 ? '' : surplusAssets,
                otherAdj: counter > 0 ? '' : otherAdj,
                equityValue: '',
                noOfShares: counter > 0 ? '' : outstandingShares,
                valuePerShare: '',
            };
           
            if (isFCFF) {
              delete result.changeInBorrowings; // If not needed for FCFF
            }
            
            if (isFCFE) {
              delete result.debtOnDate; // If not needed for FCFE
              delete result.addInterestAdjTaxes; // If not needed for FCFE
            }
            }
            else{
              let totalNetCashFlow
              if(isFCFE){
                totalNetCashFlow = convertToNumberOrZero(terminalValuePat) + 
                convertToNumberOrZero(terminalValueDepAndAmortisation) + 
                convertToNumberOrZero(otherNonCashItems) + 
                convertToNumberOrZero(terminalValueNca) + 
                convertToNumberOrZero(terminalValueChangeInBorrowings) - 
                convertToNumberOrZero(terminalValueDepAndAmortisation);
              }else{
                totalNetCashFlow = convertToNumberOrZero(terminalValuePat) + 
                convertToNumberOrZero(terminalValueAddInterestAdjTaxes) + 
                convertToNumberOrZero(terminalValueDepAndAmortisation) + 
                convertToNumberOrZero(otherNonCashItems) + 
                convertToNumberOrZero(terminalValueNca) + 
                convertToNumberOrZero(terminalValueChangeInBorrowings) - 
                convertToNumberOrZero(terminalValueDepAndAmortisation);
              }
              terminalValueWorking = {
                particulars: 'Terminal Value',
                pat: terminalValuePat,
                addInterestAdjTaxes:terminalValueAddInterestAdjTaxes,
                depAndAmortisation: terminalValueDepAndAmortisation,
                onCashItems: otherNonCashItems,
                nca: terminalValueNca,
                changeInBorrowings: terminalValueChangeInBorrowings,
                defferedTaxAssets: 0,
                netCashFlow: totalNetCashFlow,
                fixedAssets: -terminalValueDepAndAmortisation,
                fcff: totalNetCashFlow + convertToNumberOrZero(-terminalValueDepAndAmortisation),
                discountingPeriod: terminalDiscountingPeriod,
                discountingFactor: discountingFactorWacc,
                presentFCFF: presentFCFF,
                finalYearfreeCashFlow: fcff,
                terminalValueBasedOnLastYear:fcfeValueAtTerminalRate,
                explicitYear: `${parseInt(individualYear)-1}-${parseInt(individualYear)}`
              }
            }
            
            discountingPeriodValue = discountingPeriodValue + 1;
            
            secondLastFcfe = fcff; 
            if(result){
              resultArray.push(result);
            }
            counter++;
          }
          // Using static substitution 
          resultArray[0]['sumOfCashFlows'] = sumOfCashFlows;
          resultArray[0]['pvTerminalValue'] = pvTerminalValue;
          resultArray[0].equityValue = aggregatePayload.inputs.model.includes('FCFE')? equityValue + sumOfCashFlows + pvTerminalValue:equityValue + sumOfCashFlows + pvTerminalValue - debtOnIndexZero;
          resultArray[0].valuePerShare = (resultArray[0].equityValue*multiplier)/outstandingShares;
          return {resultArray,terminalValueWorking};
        }
        catch(error){
        console.log(error,"error")
        return {
          error:error,
          status:false,
          msg:"aggregate calculation failed"
        }
      }
    }
  
  async transformData(data: any[]) { //only to render data on UI table
   try{
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
    const firstElements = [];
    transformedData.map(innerArray => {
      if (innerArray.length > 0) {
          firstElements.push(innerArray[0]);
      }
      });
      return {transposedResult : transformedData, columnHeader : firstElements};
   }
   catch(error){
    console.log(error,"tranform data failed")
    return {
      msg:'Failed to transform',
      status:false,
      error:error.message
    }
   }
  }

  async recalculateValuePerShare(processId, type, headers){
    try{
      const fourthStageDetails:any = await this.processManagerService.fetchStageWiseDetails(processId, 'fourthStageInput');
      const terminalYearBase:any = await this.terminalYearWorkingService.computeTerminalValue(processId);
      const valuationId = fourthStageDetails.data?.fourthStageInput?.appData?.reportId;
      const otherAdjustment = convertToNumberOrZero(fourthStageDetails.data?.fourthStageInput?.appData?.otherAdj);

      const valuation:any = await this.valuationService.getValuationById(valuationId);

      const inputs:any = valuation.inputData[0];
      let multiplier = GET_MULTIPLIER_UNITS[`${inputs.reportingUnit}`];

      let dcfValuationArray, dcfIndex;
      valuation.modelResults.map((indValuations, index)=>{
        if(indValuations.model === MODEL[0] || indValuations.model === MODEL[1]){
          dcfValuationArray = indValuations;
          dcfIndex = index;
        }
      });
      const terminalYearWorking = dcfValuationArray.terminalYearWorking;
      let entireValuationArray = dcfValuationArray.valuationData;
      const firstElement = dcfValuationArray.valuationData[0];

      // Based on terminal value type
      // Recalculating only present value of terminal value
      // Keeping all the other line items as it is
      if(type === 'tvPatBased'){
        firstElement.pvTerminalValue = terminalYearBase.terminalValueWorking.pvTerminalValue;
      }
      else{
        firstElement.pvTerminalValue = terminalYearWorking.presentFCFF;
      }
      
      firstElement.equityValue = inputs.model.includes('FCFE') ? (firstElement.sumOfCashFlows + firstElement.pvTerminalValue + firstElement.cashEquivalents + otherAdjustment + firstElement.surplusAssets) : (firstElement.sumOfCashFlows + firstElement.pvTerminalValue + firstElement.cashEquivalents - firstElement.debtOnDate + firstElement.surplusAssets + otherAdjustment);
      firstElement.valuePerShare = (firstElement.equityValue*multiplier)/inputs.outstandingShares;

      const {isStubRequired, totalDaysDifferenceStubAdjustment, provisionalDate} = await this.fetchStubAdjustment(inputs);
      if (isStubRequired && totalDaysDifferenceStubAdjustment > 1) { //based on the above conditions, calculating stub
        let stubFactor = (1 + totalDaysDifferenceStubAdjustment/365) ** (inputs.adjustedCostOfEquity/100)-1;
        let equityValueToAdj = stubFactor * firstElement.equityValue;
        
        firstElement.stubAdjValue = equityValueToAdj
        firstElement.equityValueNew = firstElement.equityValue + equityValueToAdj;
        firstElement.valuePerShare = ((firstElement.equityValue + equityValueToAdj) * multiplier)/inputs.outstandingShares;       // Applying mulitplier for figures
      }

      entireValuationArray.shift();
      entireValuationArray.unshift(firstElement);

      const valuationWithoutInternalProps = valuation.toObject({ getters: true, virtuals: true });

      const { _id, ...rest } = valuationWithoutInternalProps;

      // Updating the DCF valuation
      await this.valuationService.createValuation(rest, _id);
    
      //  Prepare return block
      const transformValuation:any = await this.transformData(entireValuationArray);

     let dcfValuationDto = new PostDcfValuationDto();
     dcfValuationDto.model = inputs.model.includes('FCFE') ? MODEL[0] : MODEL[1];
     dcfValuationDto.valuationData = transformValuation.transposedResult;
     dcfValuationDto.valuation = isStubRequired? firstElement.equityValueNew : firstElement.equityValue;
     dcfValuationDto.terminalYearWorking = terminalYearWorking;
     dcfValuationDto.columnHeader = transformValuation.columnHeader;
     dcfValuationDto.provisionalDate = provisionalDate;

     valuation.modelResults.splice(dcfIndex, 1, dcfValuationDto);

     let mainValuationDto = new PostMainValuationDto();
     mainValuationDto.reportId = _id;
     mainValuationDto.valuationResult=valuation.modelResults;

    //  Updating the process manager service
    const processStateModel ={
      fourthStageInput:{
        appData: mainValuationDto,
        otherAdj: otherAdjustment,
        formFillingStatus: true
      },
      step: 4
    }
    
    await this.processManagerService.upsertProcess(this.getRequestAuth(headers), processStateModel, processId);
    return  {
      ...mainValuationDto,
      message:'Request Successful',
      success:true
    }
    }
    catch(error){
      return {
        msg:'revaluation failed',
        status:false,
        error:error
      }
    }
  }

  getRequestAuth(headers){
    return {
      headers:{
         authorization:headers.authorization
       }
     } 
  }

  async fetchStubAdjustment(inputs){
    const valuationFileToProcess = inputs.isExcelModified === true ? inputs.modifiedExcelSheetId : inputs.excelSheetId;

    let workbook;
    try {
      workbook = XLSX.readFile(`./uploads/${valuationFileToProcess}`);
    } catch (error) {
      this.customLogger.log({
        message: `excelSheetId: ${valuationFileToProcess} not available`,
        userId: inputs.userId,
      });
      return {
        result: null,
        msg: `excelSheetId: ${valuationFileToProcess} not available`,
      };
    }

    const worksheet1 = workbook.Sheets['P&L'];
    const worksheet2 = workbook.Sheets['BS'];

    let provisionalDates = worksheet1['B1'].v || worksheet2['B1'].v;

    let  provDtRef = parseDate(provisionalDates.trim());

    const decodeValuationDate =  new Date(inputs.valuationDate);  

    const isStubRequired = await this.isStubRequired(provDtRef, decodeValuationDate);

    let totalDaysDifferenceStubAdjustment;

    if(isStubRequired){
      totalDaysDifferenceStubAdjustment = await this.subtractProvisionalDateByValuationDate(provDtRef, decodeValuationDate);
    }
    return { isStubRequired, totalDaysDifferenceStubAdjustment, provisionalDate: new Date(provDtRef) };
  }
  //Get DiscountingFactor based on Industry based Calculations.
  // async getDiscountingFactor(
  //   inputs: any,
  //   i: number,
  //   worksheet1: any,
  //   worksheet2: any,
  // ): Promise<any> {
  //   const {
  //     model,
  //     popShareCapitalType,
  //     costOfDebtType,
  //     costOfDebt,
  //     capitalStructureType,
  //   } = inputs;
  //   let discountingFactor = null;
  //   let capitalStruc: any;
  //   if (model.includes('FCFE')) {
  //     const res = await this.industryService.getFCFEDisFactor(inputs);
  //     if (res.result === null) return res;

  //     discountingFactor = res.result;             //ValidateHere
  //   } else if (model.includes('FCFF')) {
  //     let costOfDebtValue = null;
  //     if (costOfDebtType === 'Use_Interest_Rate') costOfDebtValue = costOfDebt;
  //     else if (costOfDebtType === 'Finance_Cost')
  //       costOfDebtValue = await CostOfDebt(i, worksheet1, worksheet2); //We need to use formula
  //     let capitalStructure = 0;
  //     if (capitalStructureType === 'Company_Based')
  //       capitalStructure = await CapitalStructure(i, worksheet2);
  //       capitalStruc = await CapitalStruc(i,worksheet2,0);
  //       console.log(capitalStruc.debtProp);
  //     const proportionOfDebt = await ProportionOfDebt(i, worksheet2); //We need to use formula
  //     const proportionOfEquity = await ProportionOfEquity(i, worksheet2); // We need to use fomula
  //     let popShareCapitalValue = null;
  //     if (popShareCapitalType === 'CFBS')
  //       popShareCapitalValue = await POPShareCapital(i, worksheet2);
  //     //We need to use formula
  //     else if (popShareCapitalType === 'DFBS_PC')
  //       popShareCapitalValue = await POPShareCapitalLabelPer(i, worksheet2); //We need to get label % value.

  //     const res = await this.industryService.getFCFFDisFactor(inputs, {
  //       costOfDebt: costOfDebtValue,
  //       capitalStructure: capitalStructure,
  //       proportionOfDebt: proportionOfDebt,
  //       proportionOfEquity: proportionOfEquity,
  //       popShareCapital: popShareCapitalValue,
  //     });
  //     if (res.result === null) return res;

  //     discountingFactor = res.result;
  //     // discountingFactorWACC =  1/(1+ res.result) ^ discountingPeriodObj.result;
  //   }
  //   return {
  //     result: discountingFactor,
  //     msg: 'discountingFactor get Successfully.',
  //   };
  // }
}
