import { Injectable } from '@nestjs/common';

@Injectable()
export class IndustryService {
  // Get Adjusted Cost of Equity. Industry Calculation based on Cost of Equity.

  async getACOE(inputs: any): Promise<any> {
    const { coeMethod } = inputs;
    let result = null;
    if (coeMethod === 'CAPM') result = await this.CAPM_Method(inputs);
    else if (coeMethod === 'Build_Up_CAPM')
      result = await this.Build_Up_CAPM_Method();
    else if (coeMethod === 'BYRP') result = await this.BYRP_Method();
    else return { result: null, msg: 'Invalid Cost of Equity Method.' };

    return {
      result: result,
      msg: 'Industry Calculation based on Cost of Equity Method.',
    };
  }
  async getFCFEDisFactor(inputs: any): Promise<any> {
    return await this.getACOE(inputs);
  }
  // Industry Calculation based on WACC.
  async getFCFFDisFactor(inputs: any, inputObj:any): Promise<any> {
    const { taxRate, copShareCapital } = inputs;
    const res = await this.getACOE(inputs);

    if (res.result === null) return res;

    const adjustedCostOfEquity = res.result;
    //WACC, formula: =+B19*B27+B23*(1-B6)*B26+B21*B28
    const wacc =
      adjustedCostOfEquity * inputObj.proportionOfEquity +
      inputObj.costOfDebt * (1 - taxRate) * inputObj.proportionOfDebt +
      copShareCapital * inputObj.popShareCapital;
    return { result: wacc, msg: 'Industry Calculation based on WACC.' };
  }

  async CAPM_Method(inputs: any): Promise<number> {
    const { riskFreeRate, expMarketReturn, beta, riskPremium } = inputs;

    //Cost of Equity Calculation, formula: =+C15+(C16-C15)*C17
    const COECalculation =
      riskFreeRate + (expMarketReturn - riskFreeRate) * beta;

    //Adjusted Cost of Equity, formula: =+C18+C19
    const adjustedCostOfEquity = COECalculation + riskPremium;
    return adjustedCostOfEquity;
  }

  //we will implement following two methods in future.
  async Build_Up_CAPM_Method(): Promise<number> {
    return 1;
  }
  async BYRP_Method(): Promise<number> {
    return 1;
  }
}
