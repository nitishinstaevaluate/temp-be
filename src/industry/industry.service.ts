import { Injectable} from '@nestjs/common';

@Injectable()
export class IndustryService {

 async getDiscountingFactor(inputs:any): Promise<number> {
    const{model,coeMethod,riskFreeRate,expMarketReturn,beta,riskPremium}=inputs;

    //Cost of Equity Calculation, formula: =+C15+(C16-C15)*C17
     const COECalculation=riskFreeRate+(expMarketReturn-riskFreeRate)*beta;
     
     //Adjusted Cost of Equity, formula: =+C18+C19
      const adjustedCostOfEquity=COECalculation+riskPremium;
      if(model==="FCFE"){
        const wacc=adjustedCostOfEquity;
        return wacc;
      }

     //Cost of Preference Share Capital
     const COPShareCapital=1;

     //WACC, formula: =+C20*C28+C24*(1-C7)*C27+C22*C29
     const wacc=adjustedCostOfEquity;
    return wacc;
  }
}