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
} from '../excelFileServices/fcfeAndFCFF.method';
import { getYearsList } from '../excelFileServices/common.methods';
import { CustomLogger } from 'src/loggerService/logger.service';
@Injectable()
export class FCFEAndFCFFService {
  constructor(
    private readonly industryService: IndustryService,
    private readonly customLogger: CustomLogger,
  ) {}
  // test ifin
  //Common Method for FCFE and FCFF Methods
  async FCFEAndFCFF_Common(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    this.customLogger.log({
      message: 'Request is entered into FCFEAndFCFF Service.',
      userId: inputs.userId,
    });
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
        if (i === 0) valuation = fcff;
        //Industry Calculation.
        const discountingFactor = await this.getDiscountingFactor(
          inputs,
          i,
          worksheet1,
          worksheet2,
        );
        if (discountingFactor.result === null) return discountingFactor;
        const discountingFactorValue = discountingFactor.result;
        const presentFCFF = discountingFactorValue * fcff;

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
          particulars: `${parseInt(year) - 1}-${year}`,
          pat: pat,
          depAndAmortisation: depAndAmortisation,
          onCashItems: otherNonCashItems,
          nca: changeInNCA,
          defferedTaxAssets: deferredTaxAssets,
          netCashFlow: netCashFlow,
          fixedAssets: changeInFixedAssets,
          fcff: fcff,
          discountingPeriod: discountingPeriodValue,
          discountingFactor: discountingFactorValue,
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
        return result;
      }),
    );
    this.customLogger.log({
      message: 'Request is sucessfully executed in FCFEAndFCFF Service.',
      userId: inputs.userId,
    });
    return {
      result: finalResult,
      valuation: valuation,
      msg: 'Executed Successfully',
    };
  }

  //Get Discounting Period.
  async getDiscountingPeriod(discountingPeriod: string): Promise<any> {
    let discountingPeriodValue = null;
    if (discountingPeriod === 'Full_Period') discountingPeriodValue = 1;
    else if (discountingPeriod === 'Mid_Period') discountingPeriodValue = 6;
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
    if (model === 'FCFE') {
      const res = await this.industryService.getFCFEDisFactor(inputs);
      if (res.result === null) return res;

      discountingFactor = res.result;
    } else if (model === 'FCFF') {
      let costOfDebtValue = null;
      if (costOfDebtType === 'Use_Interest_Rate') costOfDebtValue = costOfDebt;
      else if (costOfDebtType === 'Finance_Cost')
        costOfDebtValue = await CostOfDebt(i, worksheet1, worksheet2); //We need to use formula
      let capitalStructure = 0;
      if (capitalStructureType === 'Company_Based')
        capitalStructure = await CapitalStructure(i, worksheet2);
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
    }
    return {
      result: discountingFactor,
      msg: 'discountingFactor get Successfully.',
    };
  }
}
