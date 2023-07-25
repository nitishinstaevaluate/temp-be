import { Injectable } from '@nestjs/common';
import { IndustryService } from 'src/industry/industry.service';
import {
  GetPAT,
  DepAndAmortisation,
  OtherNonCashItemsMethod,
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
} from '../excelFileServices/fcfeAndFCFF.method';
import { getYearsList, calculateDaysFromDate } from '../excelFileServices/common.methods';

@Injectable()
export class FCFEAndFCFFService {
  constructor(private readonly industryService: IndustryService) { }
  //Common Method for FCFE and FCFF Methods
  
  discountingPeriodObj : any;
  discountingFactorWACC: any;
  async FCFEAndFCFF_Common(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    const { outstandingShares, discountingPeriod, popShareCapitalType } =
      inputs;
      // console.log(inputs);
      // discountingPeriodValue:number: 0;
      let equityValue =0;
    const years = await getYearsList(worksheet1);
    if (years === null)
      return {
        result: null,
        msg: 'Please Separate Text Label and year with comma in B1 Cell in P&L Sheet1.',
      };
    const discountingPeriodObj = await this.getDiscountingPeriod(
      discountingPeriod
    );
    
    var vdate = calculateDaysFromDate(inputs.valuationDate);
    var vdayLeft = 365 - vdate;
    vdayLeft = vdayLeft < 1 ? 365 : vdayLeft;
    // if (vday <= 90) {
    //   vdayLeft = 90 - vday;
    // } else {
    //   vdayLeft = 365 - vday - 90;
    // }
    
    if (popShareCapitalType === 'DFBS_PC') {
      const popShareCapitalValue = await POPShareCapitalLabelPer(0, worksheet2);
      if (popShareCapitalValue > 100)
        return {
          result: null,
          msg: 'Invalid: Preference Share Capital % value.',
        };
    }
    let discountingPeriodValue = 0;
    if (discountingPeriodObj.result == null) return discountingPeriodObj;
    discountingPeriodValue = discountingPeriodObj.result;
    console.log('Discoun Val ',discountingPeriod,discountingPeriodValue );

    // console.log(discountingPeriodValue);
    const fractionOfYearLeft = vdayLeft/ 365;             // Adjust based on next fiscal year
    const calcDiscountPeriod = fractionOfYearLeft / discountingPeriodValue;      // To be used as in WACC Calc next
    // console.log(calcDiscountPeriod);
    let valuation = null;
    let finalWacc = 0;
    let finalDebt = 0;
    let yearstoUse = years.slice(0, -1);
    let yearsLength = years.length;
    const yearLengthT = yearsLength - 1;
    let sumOfCashFlows = 0;
    // let debtAsOnDate = 0;
    let calculatedWacc = 0;
    
    // console.log(yearsLength);
    const finalResult = await Promise.all(
      years.map(async (year: string, i: number) => {
        
        let changeInNCA = null;
        let deferredTaxAssets = null;
        let changeInBorrowingsVal = 0;
        let addInterestAdjTaxes = 0;
        let result = {};
        // let fcff = 0;
        let fcfeValueAtTerminalRate = 0;
        let fcffValueAtTerminalRate = 0;
        // let equityValue =0;
        let presentFCFF = 0;
        // let capitalStruc = {};
        //Get PAT value
        let pat = await GetPAT(i, worksheet1);
        if (pat !== null) pat = pat;
        //Get Depn and Amortisation value
        let depAndAmortisation = await DepAndAmortisation(i, worksheet1);
        if (depAndAmortisation !== null)
          depAndAmortisation = depAndAmortisation;

        //Get Oher Non Cash items Value
        const otherNonCashItems = await OtherNonCashItemsMethod(i, worksheet1);
        const changeInNCAValue = await ChangeInNCA(i, worksheet2);
        changeInNCA = changeInNCAValue;

        const deferredTaxAssetsValue = await DeferredTaxAssets(i, worksheet2);
        deferredTaxAssets =  deferredTaxAssetsValue;
        
        var changeInFixedAssets = await ChangeInFixedAssets(i, worksheet2);
        // if (i==0) {}
        const adjustedCostOfEquity = await this.industryService.CAPM_Method(inputs);
        console.log("Adjusted COE ",adjustedCostOfEquity );
        // console.log('Change in Net Fixed Assets ', changeInFixedAssets);
        
        // console.log('disc ', discountingPeriodValue);
        // var ndiscountingPeriodValue = discountingPeriodValue + 1
       


        
        // console.log('WACC Value - ',this.discountingFactorWACC);
        // if (i === 0)        // Control from here not to print next set of values
                                                                       // old code ->     discountingFactorValue * fcff;
        
        // console.log('out disc ', discountingPeriodValue);
        // const sumOfCashFlows = 1000000; //presentFCFF;                                                     // To be checked
        let debtAsOnDate = await GetDebtAsOnDate(i, worksheet2);
        const cashEquivalents = await CashEquivalents(i, worksheet2);
        const surplusAssets = await SurplusAssets(i, worksheet2);
        changeInBorrowingsVal = await changeInBorrowings(i, worksheet2);
        // console.log('Borrowings, ',changeInBorrowingsVal);
        addInterestAdjTaxes = await interestAdjustedTaxes(i,worksheet1,inputs.taxRate);
        // const shareholderFunds = await getShareholderFunds(i,worksheet2);
        
        const shareholderFunds = await getShareholderFunds(i,worksheet2);
        
        let capitalStruc = await CapitalStruc(i,worksheet2,shareholderFunds);
        // console.log(capitalStruc);
        // console.log('More Values ',parseFloat(inputs.costOfDebt),parseFloat(inputs.taxRate),' ', parseFloat(inputs.copShareCapital));
        calculatedWacc = adjustedCostOfEquity/100 * capitalStruc.equityProp + (parseFloat(inputs.costOfDebt)/100)*(1-parseFloat(inputs.taxRate)/100)*capitalStruc.debtProp + parseFloat(inputs.copShareCapital)/100 * capitalStruc.prefProp;
        
        // console.log('WACC Calculat- ',i,' ',calculatedWacc);
        const otherAdj = parseFloat(inputs.otherAdj);                                                                // ValidateHere
        //formula: =+B16-B17+B18+B19+B20
        // console.log('out disc ', discountingPeriodValue);

        
        let netCashFlow =0 ;
        if (inputs.model === 'FCFE') {
          
          netCashFlow = pat + depAndAmortisation + otherNonCashItems + changeInNCA + deferredTaxAssets + changeInBorrowingsVal;
        } else {
          netCashFlow = pat + depAndAmortisation + otherNonCashItems + changeInNCA + deferredTaxAssets  + addInterestAdjTaxes;
        }
          
        changeInFixedAssets = changeInFixedAssets - depAndAmortisation;
        const fcff = netCashFlow + changeInFixedAssets ;    
        console.log("Value at ",fcff,' ',i, ' ', yearLengthT);
        // Calculate wacc for FCFF
        // =+D22*D30+D26*(1-D7)*D29+D24*D31

        // this.calculatedWacc = adjustedCostOfEquity * capitalStruc.equityProp + (inputs.costOfDebt/100)*(1-inputs.taxRate/100)*capitalStruc.debtProp + inputs.copShareCapital/100 * capitalStruc.prefProp

        if  (i === yearLengthT && inputs.model === 'FCFE') {                                // Valuation data
        fcfeValueAtTerminalRate = await fcfeTerminalValue(valuation,inputs.terminalGrowthRate,adjustedCostOfEquity)
        console.log('ter val ',fcfeValueAtTerminalRate,' ', valuation);
        // console.log('fcfe ter ', fcfeValueAtTerminalRate)
        discountingPeriodValue = discountingPeriodValue - 1;
        } else if (i === yearLengthT && inputs.model === 'FCFF') {  
          fcfeValueAtTerminalRate = await fcffTerminalValue(valuation,inputs.terminalGrowthRate, finalWacc)
          discountingPeriodValue = discountingPeriodValue - 1;
        }
        console.log('Term - ',fcffValueAtTerminalRate);
        
        if (i === 0) {
          finalWacc = calculatedWacc;
          finalDebt = debtAsOnDate;
          }
          console.log('Final Deb ',finalDebt);
        if (inputs.model === 'FCFE') {
          // changeInBorrowingsVal = await changeInBorrowings(i, worksheet2);
          if (i === yearLengthT) {
            // Do nothing
          } else {
          this.discountingFactorWACC = 1/ (1+adjustedCostOfEquity/100) ** (discountingPeriodValue)
          }
          console.log('Disc COE ', this.discountingFactorWACC)
         
        } else if (inputs.model === 'FCFF') {
          // addInterestAdjTaxes = await interestAdjustedTaxes(i,worksheet1,inputs.taxRate);
          if (i === yearLengthT) {
            // Do nothing
          } else {
          this.discountingFactorWACC = 1/ (1+finalWacc) ** (discountingPeriodValue)
          }
          console.log('Disc WACC ', this.discountingFactorWACC)
        
        } 
        valuation = fcff;
        
        // console.log('Disounting factor ',this.discountingFactorWACC,' ',fcff)
        if  (i === yearLengthT){
          // if (inputs.model === 'FCFE') {
          //   presentFCFF = this.discountingFactorWACC * fcfeValueAtTerminalRate
          // } else {
            presentFCFF = this.discountingFactorWACC * fcfeValueAtTerminalRate
          
        } else {
          presentFCFF = this.discountingFactorWACC * fcff
        }
        sumOfCashFlows = presentFCFF + sumOfCashFlows;
        console.log('Sum of cash flow ',i, ' ' ,sumOfCashFlows, 'Eq ',cashEquivalents, 'Surpla ', surplusAssets,'Other ', otherAdj);
        if  (i === 0) {                     // To be run for first instance only
          equityValue =
          // sumOfCashFlows +
          // debtAsOnDate +
          cashEquivalents +
          surplusAssets +
          otherAdj;
        }
        // equityValue = equityValue + sumOfCashFlows;
        // const valuePerShare = equityValue / outstandingShares;
        result = {
          particulars: (i === yearLengthT) ?'Terminal Value':`${parseInt(year) - 1}-${year}`,
          pat: (i === yearLengthT) ?'':pat,
          depAndAmortisation: (i === yearLengthT) ?'':depAndAmortisation,
          onCashItems: (i === yearLengthT) ?'':otherNonCashItems,
          nca: (i === yearLengthT) ?'':changeInNCA,
          // InterestAdjchangeInBorrowings: inputs.model === 'FCFE' ? changeInBorrowingsVal:addInterestAdjTaxes,
          defferedTaxAssets: (i === yearLengthT) ?'':deferredTaxAssets,
          netCashFlow: (i === yearLengthT) ?'':netCashFlow,
          fixedAssets: (i === yearLengthT) ?'':changeInFixedAssets,
          fcff: (i === yearLengthT) ?fcfeValueAtTerminalRate:fcff,
          discountingPeriod: discountingPeriodValue,
          discountingFactor: this.discountingFactorWACC,
          presentFCFF: presentFCFF,
          sumOfCashFlows: '',
          debtOnDate: i> 0?'':finalDebt,
          cashEquivalents: i> 0?'':cashEquivalents,
          surplusAssets: i> 0?'':surplusAssets,
          otherAdj: i> 0?'':otherAdj,
          equityValue: '',
          noOfShares: i> 0?'':outstandingShares,
          valuePerShare: '',
          // totalFlow: this.discountingFactorWACC + i
        }; 
        discountingPeriodValue = discountingPeriodValue + 1;    
        
        return result;
      }),
    );
    
    // let lastElement = finalResult.slice(-1);
    finalResult[0].sumOfCashFlows = sumOfCashFlows;
    finalResult[0].equityValue = inputs.model === 'FCFE'? equityValue + sumOfCashFlows:equityValue + sumOfCashFlows - finalDebt;
    finalResult[0].valuePerShare = (finalResult[0].equityValue*100000)/outstandingShares;       // Applying mulitplier for figures
    // delete finalResult[0].totalFlow;                        // Remove to avoid showing up in display
    // console.log(finalResult);
    
    return { result: finalResult, valuation: valuation, msg: 'Executed Successfully' };
  }

  //Get Discounting Period.
  async getDiscountingPeriod(discountingPeriod: string): Promise<any> {
    let discountingPeriodValue = 0;
    if (discountingPeriod === 'Full_Period') discountingPeriodValue = 1;
    else if (discountingPeriod === 'Mid_Period') discountingPeriodValue = 0.5;
    return {
      result: discountingPeriodValue,
      msg: 'Discounting period get Successfully.',
    };
  }

  //Get DiscountingFactor based on Industry based Calculations.
  async getDiscountingFactor(
    inputs: any,
    i: number,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    const {
      model,
      popShareCapitalType,
      costOfDebtType,
      costOfDebt,
      capitalStructureType,
    } = inputs;
    let discountingFactor = null;
    let capitalStruc: any;
    if (model === 'FCFE') {
      const res = await this.industryService.getFCFEDisFactor(inputs);
      if (res.result === null) return res;

      discountingFactor = res.result;             //ValidateHere
    } else if (model === 'FCFF') {
      let costOfDebtValue = null;
      if (costOfDebtType === 'Use_Interest_Rate') costOfDebtValue = costOfDebt;
      else if (costOfDebtType === 'Finance_Cost')
        costOfDebtValue = await CostOfDebt(i, worksheet1, worksheet2); //We need to use formula
      let capitalStructure = 0;
      if (capitalStructureType === 'Company_Based')
        capitalStructure = await CapitalStructure(i, worksheet2);
        capitalStruc = await CapitalStruc(i,worksheet2,0);
        console.log(capitalStruc.debtProp);
      const proportionOfDebt = await ProportionOfDebt(i, worksheet2); //We need to use formula
      const proportionOfEquity = await ProportionOfEquity(i, worksheet2); // We need to use fomula
      let popShareCapitalValue = null;
      if (popShareCapitalType === 'CFBS')
        popShareCapitalValue = await POPShareCapital(i, worksheet2);
      //We need to use formula
      else if (popShareCapitalType === 'DFBS_PC')
        popShareCapitalValue = await POPShareCapitalLabelPer(i, worksheet2); //We need to get label % value.

      const res = await this.industryService.getFCFFDisFactor(inputs, {
        costOfDebt: costOfDebtValue,
        capitalStructure: capitalStructure,
        proportionOfDebt: proportionOfDebt,
        proportionOfEquity: proportionOfEquity,
        popShareCapital: popShareCapitalValue,
      });
      if (res.result === null) return res;

      discountingFactor = res.result;
      // discountingFactorWACC =  1/(1+ res.result) ^ discountingPeriodObj.result;
    }
    return {
      result: discountingFactor,
      msg: 'discountingFactor get Successfully.',
    };
  }
}
