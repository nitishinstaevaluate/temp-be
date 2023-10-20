import { Injectable } from '@nestjs/common';
import { CapitalStruc, getShareholderFunds } from 'src/excelFileServices/fcfeAndFCFF.method';
import { CustomLogger } from 'src/loggerService/logger.service';
import { FCFEAndFCFFService } from 'src/valuationProcess/fcfeAndFCFF.service';
import * as XLSX from 'xlsx';

// @Injectable()
// export class CalculationService {}

// Indian Treasury Yield Service
@Injectable()
export class CalculationService {
  constructor(
    // @InjectModel('indianTreasuryYield')
    // private readonly indianTresauryYieldModel: Model<IndianTreasuryYieldDocument>
    private customLogger: CustomLogger
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
    async getWaccExcptTargetCapStrc(adjCoe,excelSheetId,costOfDebt,copShareCapital,deRatio,type,taxRate,capitalStructure): Promise<any> {
      let workbook = null;
      let modifiedCapitalStructure;
      try {
        workbook = XLSX.readFile(`./uploads/${excelSheetId}`);
      } catch (error) {
        this.customLogger.log({
          message: `excelSheetId: ${excelSheetId} not available for wacc calculations`,
        });
        return {
          result: null,
          msg: `excelSheetId: ${excelSheetId} not available`,
        };
      }
      const worksheet2 = workbook.Sheets['BS'];
      if(type === 'Target_Based'){
        modifiedCapitalStructure = capitalStructure;
      }else{
        modifiedCapitalStructure = {
          deRatio:deRatio
        }
      }
      const payload = {
        capitalStructureType:type,
        capitalStructure:modifiedCapitalStructure
      }
      const shareholderFunds = await getShareholderFunds(0,worksheet2);
        
      let capitalStruc = await CapitalStruc(0,worksheet2,shareholderFunds,payload);

      let calculatedWacc = adjCoe/100 * capitalStruc.equityProp + (parseFloat(costOfDebt)/100)*(1-parseFloat(taxRate)/100)*capitalStruc.debtProp + parseFloat(copShareCapital)/100 * capitalStruc.prefProp;

   return {
        result: {
          wacc: calculatedWacc*100,
          adjCOE: adjCoe,
          capitalStructure:capitalStruc
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
