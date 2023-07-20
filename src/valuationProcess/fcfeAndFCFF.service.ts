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
} from '../excelFileServices/fcfeAndFCFF.method';
import { getYearsList } from '../excelFileServices/common.methods';

@Injectable()
export class FCFEAndFCFFService {
  constructor(private readonly industryService: IndustryService) { }
  //Common Method for FCFE and FCFF Methods
  calculatedWacc :  any;
  discountingPeriodObj : any;
  discountingFactorWACC: any;
  async FCFEAndFCFF_Common(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    const { outstandingShares, discountingPeriod, popShareCapitalType } =
      inputs;
    const years = await getYearsList(worksheet1);
    if (years === null)
      return {
        result: null,
        msg: 'Please Separate Text Label and year with comma in B1 Cell in P&L Sheet1.',
      };
    const discountingPeriodObj = await this.getDiscountingPeriod(
      discountingPeriod,
    );

    var vdate = new Date(inputs.valuationDate);
    var vday = vdate.getDay();
    var vdayLeft = vday - 90 ;
    if (vday <= 90) {
      vdayLeft = 90 - vday;
    } else {
      vdayLeft = 365 - vday - 90;
    }

    if (popShareCapitalType === 'DFBS_PC') {
      const popShareCapitalValue = await POPShareCapitalLabelPer(0, worksheet2);
      if (popShareCapitalValue > 100)
        return {
          result: null,
          msg: 'Invalid: Preference Share Capital % value.',
        };
    }

    if (discountingPeriodObj.result == null) return discountingPeriodObj;
    const discountingPeriodValue = discountingPeriodObj.result;
    const fractionOfYearLeft = vdayLeft/ 365;             // Adjust based on next fiscal year
    const calcDiscountPeriod = fractionOfYearLeft / discountingPeriodValue;
    // getDiscountingPeriod = 
    let valuation = null;
    const finalResult = await Promise.all(
      years.map(async (year: string, i: number) => {
        let changeInNCA = null;
        let deferredTaxAssets = null;
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
        // Net Cash Flow
        const netCashFlow = pat + depAndAmortisation + otherNonCashItems + changeInNCA + deferredTaxAssets;
          // pat ||
          // 0 + depAndAmortisation ||
          // 0 + otherNonCashItems ||
          // 0 + parseInt(changeInNCA) ||
          // 0 + parseInt(deferredTaxAssets) ||
          // 0;

        const shareHolderFundsValue = await getShareholderFunds(i, worksheet2);
        const changeInFixedAssets = await ChangeInFixedAssets(i, worksheet2);

        const fcff = netCashFlow + changeInFixedAssets //- shareHolderFundsValue;                                       // Valuation data
        
        // Perform one time WACC calculation
        const adjustedCostOfEquity = await this.industryService.CAPM_Method(inputs);

        // Determining WACC @ book value vs market value
        // if (inputs.capitalStructureType === 'Company_Based') {
        //     // Determine wacc at book value
        //     this.calculatedWacc = '';
        // } else {                                // Only two types enabled for now.
        //    // Determine wacc at market value

        //    this.calculatedWacc = '';
        // }
        const capitalStruc = await CapitalStruc(i,worksheet2);
        // Get WACC at Discounting Factor. If cost of equity then directly go for adjuste COE otherwise do at WACC
        
        // if (inputs.model === 'FCFF') {
        //   this.discountingFactorWACC = 1 / (1 + this.calculatedWacc) ^ calcDiscountPeriod
        // } else if (inputs.model === 'FCFE') {
        //   this.discountingFactorWACC = 1 / (1 + adjustedCostOfEquity) ^ calcDiscountPeriod
        // }



        

        if (i === 0)
          valuation = fcff;
        //Industry Calculation.
        const discountingFactor = await this.getDiscountingFactor(
          inputs,
          i,
          worksheet1,
          worksheet2,
        );
        if (discountingFactor.result === null) return discountingFactor;
        const discountingFactorValue = discountingFactor.result;
        const presentFCFF = this.discountingFactorWACC * fcff * fractionOfYearLeft;                                                                 // old code ->     discountingFactorValue * fcff;

        const sumOfCashFlows = presentFCFF;                                                     // To be checked
        const debtAsOnDate = await GetDebtAsOnDate(i, worksheet2);
        const cashEquivalents = await CashEquivalents(i, worksheet2);
        const surplusAssets = await SurplusAssets(i, worksheet2);
        const otherAdj = parseInt(inputs.otherAdj);                                                                // ValidateHere
        //formula: =+B16-B17+B18+B19+B20
        const equityValue =
          sumOfCashFlows -
          debtAsOnDate +
          cashEquivalents +
          surplusAssets +
          otherAdj;
        const valuePerShare = equityValue / outstandingShares;
        const result = {
          particulars: `${parseInt(year) - 1}-${year}`,
          pat: pat,
          depAndAmortisation: depAndAmortisation,
          OtherNonCashItems: otherNonCashItems,
          nca: changeInNCA,
          defferedTaxAssets: deferredTaxAssets,
          netCashFlow: netCashFlow,
          fixedAssets: changeInFixedAssets,
          fcff: fcff,
          discountingPeriod: discountingPeriodValue,
          discountingFactor: this.discountingFactorWACC,
          presentFCFF: presentFCFF,
          sumOfCashFlows: sumOfCashFlows,
          debtOnDate: debtAsOnDate,
          cashEquivalents: cashEquivalents,
          surplusAssets: surplusAssets,
          otherAdj: otherAdj,
          equityValue: equityValue,
          noOfShares: outstandingShares,
          valuePerShare: valuePerShare,
        };
        console.log('Iteration 1 ran');
        console.log(result);
        return result;
      }),
    );
    return { result: finalResult, valuation: valuation, msg: 'Executed Successfully' };
  }

  //Get Discounting Period.
  async getDiscountingPeriod(discountingPeriod: string): Promise<any> {
    let discountingPeriodValue = null;
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
        capitalStruc = await CapitalStruc(i,worksheet2);
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
