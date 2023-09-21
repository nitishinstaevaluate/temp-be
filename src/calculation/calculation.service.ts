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
          wacc: calculatedWacc * 100,
          adjCOE: adjustedCostOfEquity ,
          method: coeMethod
        },
        message: 'Calculated WACC',
        status: true
      }
    }

    async calculateWeightedVal(valuationInput) {
      var weightedVal = 0;
      // Logic here loop over and add
      // weightedVal  = weightedVal + model * value/100;
      // push to array for each element
      const weightedResults = [{
        model : 'modelNames',
        indicatedValue : 'Initial Value',
        weight : '',
        weightedValue : '', 
      }]
      return {
        result :{
            weightedVal : '',
            inputs : weightedResults 
        },
        message: 'Weighted valuation results',
        status: true
      }
   }
}
