import { Injectable } from '@nestjs/common';

// @Injectable()
// export class CalculationService {}

// Indian Treasury Yield Service
@Injectable()
export class CalculationService {
  constructor(
    // @InjectModel('indianTreasuryYield')
    // private readonly indianTresauryYieldModel: Model<IndianTreasuryYieldDocument>
  ) { }

  async adjCOE(riskFreeRate, expMarketReturn, beta, riskPremium, coeMethod): Promise<any> {

    //Cost of Equity Calculation based on CAPM Method
    const COECalculation =
      riskFreeRate + (expMarketReturn - riskFreeRate) * beta;

    const adjustedCostOfEquity = COECalculation + riskPremium;

    return {
      result: {
        coe: COECalculation ,
        adjCOE: adjustedCostOfEquity ,
        method: coeMethod
      },
      message: 'Cost of equity calculated',
      status: true
    }
  }

    async getWACC(adjustedCostOfEquity,equityProp,
      costOfDebt,taxRate,
      debtProp,copShareCapital,prefProp,coeMethod): Promise<any> {
      //WACC based on CAPM Method
      const calculatedWacc = 
          adjustedCostOfEquity/100 * equityProp + (costOfDebt/100)*(1-taxRate/100)*debtProp + copShareCapital/100 * prefProp;
      return {
        result: {
          wacc: calculatedWacc ,
          adjCOE: adjustedCostOfEquity ,
          method: coeMethod
        },
        message: 'Calculated WACC',
        status: true
      }
    }
}
