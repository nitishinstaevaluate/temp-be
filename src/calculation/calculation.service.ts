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
      try{

      let weightedVal = 0;
      const weightedModel = [];
      
      valuationInput.results.map((resp) => {
        if (resp.model){
          weightedVal = weightedVal + (parseFloat(resp.value) * parseFloat(resp.weightage)/100);
          weightedModel.push(
            {
              model : resp.model,
              indicatedValue : resp.value,
              weight : parseFloat(resp.weightage)/100,
              weightedValue : parseFloat(resp.value) * parseFloat(resp.weightage)/100, 
            }
          )
        }

      })
      
      return {
        result :{
            weightedVal : weightedVal,
            modelValue : weightedModel 
        },
        message: 'Weighted valuation results',
        status: true
      }
      }
      catch(error){
        return {
          error: error.message,
          message: 'Unable to calculate final value.',
          status: false
        }
      }
   }
}
