import { Injectable} from '@nestjs/common';

@Injectable()
export class IndustryService {
  // Get Adjusted Cost of Equity
  async getACOE(inputs:any): Promise<number> {
    const{riskFreeRate,expMarketReturn,beta,riskPremium}=inputs;

    //Cost of Equity Calculation, formula: =+C15+(C16-C15)*C17
     const COECalculation=riskFreeRate+(expMarketReturn-riskFreeRate)*beta;
     
     //Adjusted Cost of Equity, formula: =+C18+C19
      const adjustedCostOfEquity=COECalculation+riskPremium;
        return adjustedCostOfEquity;
  }
 async getFCFEDisFactor(inputs:any): Promise<number> {
        return this.getACOE(inputs);
  }
  async getFCFFDisFactor(inputs:any,inputObj:any): Promise<number> {
    const {taxRate}=inputs;
      const adjustedCostOfEquity=await this.getACOE(inputs);
    
       //Cost of Preference Share Capital
       const COPShareCapital=1;
       const costOfDebt=inputObj.costOfDebt;
       const capitalStructure=inputObj.capitalStructure;
       const proportionOfDebt =inputObj.proportionOfDebt;
       const proportionOfEquity=inputObj.proportionOfEquity;
       const proportionOfPSC=inputObj.proportionOfPSC;

       //WACC, formula: =+B19*B27+B23*(1-B6)*B26+B21*B28
       const wacc=adjustedCostOfEquity*proportionOfEquity+costOfDebt*(1-taxRate)*proportionOfDebt+COPShareCapital*proportionOfPSC;
      return wacc;
  }
}