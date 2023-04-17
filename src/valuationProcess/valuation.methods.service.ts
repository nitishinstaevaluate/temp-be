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
  POPShareCapitalLabelPer
} from '../excelFileServices/calculation.method';
import { columnsList } from '../excelFileServices/excelSheetConfig';
//Valuation Methods Service
@Injectable()
export class ValuationMethodsService {
  constructor(private readonly industryService: IndustryService) {}

  async FCFEMethod(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    return await this.FCFEAndFCFF_Common(inputs, worksheet1, worksheet2);
  }
  async FCFFMethod(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    return await this.FCFEAndFCFF_Common(inputs, worksheet1, worksheet2);
  }
  //Get Years List from Excel Sheet.
  async getYearsList(worksheet1: any): Promise<any> {
    const firstYearCell = worksheet1['B1'];
    const firstYear = firstYearCell.v.split(',')[1];
    if (firstYear === undefined) return null;

    const years = [];
    years.push(firstYear.trim().split('-')[1]);
    for (let i = 1; i < 9; i++) {
      const yearCell = await worksheet1[`${columnsList[i] + 1}`];
      if (yearCell === undefined) break;
      if (yearCell && yearCell !== undefined)
        years.push(yearCell.v.split('-')[1]);
    }
    return years;
  }

  //Common Method for FCFE and FCFF Methods
  async FCFEAndFCFF_Common(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    const { outstandingShares, discountingPeriod,popShareCapitalType } = inputs;
    const finalResult = [];
    const years = await this.getYearsList(worksheet1);
    if (years === null)
      return {
        result: null,
        msg: 'Please Separate Text Label and year with comma in B1 Cell in P&L Sheet1.',
      };
    const discountingPeriodObj = await this.getDiscountingPeriod(
      discountingPeriod,
    );

    if(popShareCapitalType === 'DFBS_PC'){
      const popShareCapitalValue = await POPShareCapitalLabelPer(0, worksheet2);
      if(popShareCapitalValue>100)
        return {
          result:null,
          msg:"Invalid: Preference Share Capital % value."
        }
    }

    if (discountingPeriodObj.result == null) return discountingPeriodObj;
    const discountingPeriodValue = discountingPeriodObj.result;
    years.map(async (year: string, i: number) => {
      let changeInNCA = null;
      let deferredTaxAssets = null;
      //Get PAT value
      let pat = await GetPAT(i, worksheet1);
      if (pat !== null) pat = pat.toFixed(2);
      //Get Depn and Amortisation value
      let depAndAmortisation = await DepAndAmortisation(i, worksheet1);
      if (depAndAmortisation !== null)
        depAndAmortisation = depAndAmortisation.toFixed(2);

      //Get Oher Non Cash items Value
      const otherNonCashItems = await OtherNonCashItemsMethod(i, worksheet1);
      const changeInNCAValue = await ChangeInNCA(i, worksheet2);
      changeInNCA = changeInNCA - changeInNCAValue;

      const deferredTaxAssetsValue = await DeferredTaxAssets(i, worksheet2);
      deferredTaxAssets = deferredTaxAssets - deferredTaxAssetsValue;
      // Net Cash Flow
      const netCashFlow =
        parseInt(pat) ||
        0 + parseInt(depAndAmortisation) ||
        0 + parseInt(otherNonCashItems) ||
        0 + parseInt(changeInNCA) ||
        0 + parseInt(deferredTaxAssets) ||
        0;
      const changeInFixedAssets = await ChangeInFixedAssets(i, worksheet2);
      const fcff = netCashFlow + changeInFixedAssets;
      //Industry Calculation.
      const discountingFactor = await this.getDiscountingFactor(
        inputs,
        i,
        worksheet1,
        worksheet2,
      );
  
      if(discountingFactor.result===null)
      return discountingFactor;
      const discountingFactorValue=discountingFactor.result;
      const presentFCFF = discountingFactor * fcff;
      const sumOfCashFlows = presentFCFF;
      const debtAsOnDate = await GetDebtAsOnDate(i, worksheet2);
      const cashEquivalents = await CashEquivalents(i, worksheet2);
      const surplusAssets = await SurplusAssets(i, worksheet2);
      const otherAdj = 100000;
      //formula: =+B16-B17+B18+B19+B20
      const equityValue =
        sumOfCashFlows -
        debtAsOnDate +
        cashEquivalents +
        surplusAssets +
        otherAdj;
      const valuePerShare = equityValue / outstandingShares;

      const result = {
        particulars: year,
        pat: pat,
        depAndAmortisation: depAndAmortisation,
        onCashItems: otherNonCashItems.toFixed(2),
        nca: changeInNCA.toFixed(2),
        defferedTaxAssets: deferredTaxAssets,
        netCashFlow: netCashFlow,
        fixedAssets: changeInFixedAssets,
        fcff: fcff,
        discountingPeriod: discountingPeriodValue,
        discountingFactor: discountingFactorValue.toFixed(2),
        presentFCFF: presentFCFF.toFixed(2),
        sumOfCashFlows: sumOfCashFlows.toFixed(2),
        debtOnDate: debtAsOnDate,
        cashEquivalents: cashEquivalents.toFixed(2),
        surplusAssets: surplusAssets,
        otherAdj: otherAdj,
        equityValue: equityValue.toFixed(2),
        noOfShares: outstandingShares,
        valuePerShare: valuePerShare.toFixed(2),
      };
      finalResult.push(result);
    });

    return { result: finalResult, msg: 'Executed Successfully' };
  }

  //Get Discounting Period.
  async getDiscountingPeriod(discountingPeriod: string): Promise<any> {
    let discountingPeriodValue = null;
    if (discountingPeriod === 'Full_Period') discountingPeriodValue = 1;
    else if (discountingPeriod === 'Mid_Period') discountingPeriodValue = 6;
    else
      return {
        result: null,
        msg: 'Invalid discounting period.',
      };
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
    const { model, popShareCapitalType, costOfDebtType, costOfDebt } = inputs;
    let discountingFactor = null;
    if (model === 'FCFE') {
      const res = await this.industryService.getFCFEDisFactor(inputs);
      if (res.result === null) return res;

      discountingFactor = res.result;
    } else if (model === 'FCFF') {
      let costOfDebtValue = null;
      if (costOfDebtType === 'Use_Interest_Rate') costOfDebtValue = costOfDebt;
      else if (costOfDebtType === 'Finance_Cost')
        costOfDebtValue = await CostOfDebt(i, worksheet1, worksheet2); //We need to use formula
      const capitalStructure = await CapitalStructure(i, worksheet2);
      const proportionOfDebt = await ProportionOfDebt(i, worksheet2); //We need to use formula
      const proportionOfEquity = await ProportionOfEquity(i, worksheet2); // We need to use fomula
      let popShareCapitalValue = null;
      if (popShareCapitalType === 'CFBS')
        popShareCapitalValue = await POPShareCapital(i, worksheet2);
      //We need to use formula
      else if (popShareCapitalType === 'DFBS_PC')
        popShareCapitalValue = await POPShareCapitalLabelPer(i, worksheet2);//We need to get label % value.
      
      const res = await this.industryService.getFCFFDisFactor(inputs, {
        costOfDebt: costOfDebtValue,
        capitalStructure: capitalStructure,
        proportionOfDebt: proportionOfDebt,
        proportionOfEquity: proportionOfEquity,
        popShareCapital: popShareCapitalValue,
      });
      if (res.result === null) return res;

      discountingFactor = res.result;
    }
    return {result:discountingFactor,msg:"discountingFactor get Successfully."};
  }
}
