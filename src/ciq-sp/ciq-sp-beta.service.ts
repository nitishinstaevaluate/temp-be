import { Injectable, NotFoundException } from "@nestjs/common";
import { MNEMONIC_ENUMS, MNEMONICS_ARRAY, BETA_TYPE, BETA_SUB_TYPE } from "src/constants/constants";
import { convertToNumberOrZero, convertToNumberOrOne } from "src/excelFileServices/common.methods";
import { iqCreateStructure, extractValues, calculateMean, calculateMedian } from "./ciq-common-functions";


@Injectable()
export class ciqSpBetaService {
    //#region beta calculation starts
      async createBetaPayloadStructure(data){
        try{

            const finalPayload = [];

            for await (const mnemonic of MNEMONICS_ARRAY) {
                const payload = await iqCreateStructure(data, mnemonic);
                finalPayload.push(...payload.data);
            }

            return {inputRequests:finalPayload};
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"beta payload creation failed"
            }
        }
      }
  
      async calculateBetaAggregate(axiosBetaResponse, taxRate, betSubType, betaType) {
        try {
          if (!axiosBetaResponse.data) {
            throw new NotFoundException({
              message: 'Axios beta list not found',
              status: false,
            });
          }
  
          const result = {};
          let maxLength = 0
          for await (const betaDetails of axiosBetaResponse.data.GDSSDKResponse) {
            if (!betaDetails.ErrMsg) {
              for await (const mnemonic of MNEMONICS_ARRAY) {
                if (betaDetails.Headers.includes(mnemonic)) {
                  result[mnemonic] = result[mnemonic] || [];
                  result[mnemonic].push(...await extractValues(betaDetails, mnemonic));
  
                  const currentLength = result[mnemonic].length;
                  if (currentLength > maxLength) {
                    maxLength = currentLength;
                  }
                }
              }
            }
            else{
              result[betaDetails.Mnemonic] = [];
            }
          }
          
          const getDebtToCapitalAndMarketValue = await  this.calculateDebtToCapitalAndMarketValue(result, maxLength);
          
          const calculateAdjstdBetaByMarshallBlume = await this.calculateAdjustedBeta(result,maxLength);
  
          let calculateTotalAdjustedBeta, calculateTotalDebtToCapital, calculateTotalEquityToCapital;
  
          calculateTotalAdjustedBeta =  await this.calculateBetaMetric(calculateAdjstdBetaByMarshallBlume, betSubType, maxLength);
          calculateTotalDebtToCapital = await this.calculateBetaMetric(getDebtToCapitalAndMarketValue.calculateTotalDebtToCapital, betSubType, maxLength);
          calculateTotalEquityToCapital = await this.calculateBetaMetric(getDebtToCapitalAndMarketValue.calculateTotalEquityToCapital,  betSubType, maxLength);
  
          const deRatio = calculateTotalDebtToCapital/calculateTotalEquityToCapital ?? 1;
  
          if(betaType === BETA_TYPE[0]){
            const unleveredBeta = await this.calculateUnleveredBeta(calculateTotalAdjustedBeta, calculateTotalDebtToCapital, calculateTotalEquityToCapital, taxRate, maxLength);
            return {beta: await this.calculateReleveredBeta(unleveredBeta, calculateTotalDebtToCapital, calculateTotalEquityToCapital, taxRate, maxLength), deRatio};
          }
          else{
            return {beta: await this.calculateUnleveredBeta(calculateTotalAdjustedBeta, calculateTotalDebtToCapital, calculateTotalEquityToCapital, taxRate, maxLength), deRatio};
          }
          
        } 
        catch (error) {
          console.error(error);
          return {
            error: error,
            msg: "Error while fetching data from axios",
            status: false,
          };
        }
      }
  
      async calculateBetaMetric(data, method, maxLength) {
        try{
          const result = (method === BETA_SUB_TYPE[0])
          ? await calculateMean(data, maxLength)
          : await calculateMedian(data);
      
          return result;
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:"beta median/mean calculation failed"
          }
        }
      };
  
      async calculateAdjustedBeta(result,maxLength){
        try{
          // Adjusted beta with Marshall Blume formula ( Ba = 0.371+0.635*Bh)
          let adjustedBetaArray = [];
  
          for (let i = 0; i < maxLength; i++){
            adjustedBetaArray.push(
              0.371 + 0.635 * result[MNEMONIC_ENUMS.IQ_CUSTOM_BETA][i]
            )
          }
          return adjustedBetaArray;
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:"Adjusted beta calculation failed"
          }
        }
      }
      async calculateUnleveredBeta(adjustedBeta, debtToCapital, equityToCapital, taxRate, maxLength){
        try{
          // Be4 = M12/(1+(1-L12)*J12/K12)
          
          let unleveredBeta;
          unleveredBeta =  adjustedBeta / (1 + (1 - taxRate) * debtToCapital/equityToCapital)
          return unleveredBeta;
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:"Beta unlever calculation for beta failed"
          }
        }
      }
  
      async calculateReleveredBeta(betaUnleveredArray,debtToCapital, equityToCapital, taxRate, maxLength){
        try{
          // Relevered Equity Beta = Be4 * (1 + (1-Tax Rate) * Debt to Equity)
          
          let releveredBeta;
          releveredBeta =  betaUnleveredArray * (1 + (1 - taxRate) * debtToCapital/equityToCapital)
          return releveredBeta;
        }
        catch(error){
          return {
            error:error,
            msg:"Beta relever calculation for beta failed"
          }
        }
      }
  
      async calculateDebtToCapitalAndMarketValue(result ,maxLength){
        try{
          let calculateTotalDebtInCurrentLiabilities = [], calculateTotalLongTermDebt = [], calculateTotalBookValue = [], 
            calculateTotalMarketValueOfEquity = [], calculateTotalMarketValueOfCapital = [], calculateTotalDebtToCapital = [], calculateTotalEquityToCapital = [];
  
          for (let i = 0; i < maxLength; i++){
  
            // calculate debt in current liabilities
            calculateTotalDebtInCurrentLiabilities.push(
              convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_CURRENT_PORT][i]) + 
              convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_ST_DEBT][i]) + 
              convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_FIN_DIV_DEBT_CURRENT][i]) - 
              convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_CURRENT_PORTION_LEASE_LIABILITIES][i])
            ) 
  
            // calculate long term debt
            calculateTotalLongTermDebt.push(
              convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_LT_DEBT][i]) +
              convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_CAPITAL_LEASES][i]) +
              convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_FIN_DIV_DEBT_LT][i]) -
              convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_LT_PORTION_LEASE_LIABILITIES][i])
            )
  
            // calculate total book value of debt
            calculateTotalBookValue.push(
              convertToNumberOrZero(calculateTotalDebtInCurrentLiabilities[i]) + 
              convertToNumberOrZero(calculateTotalLongTermDebt[i])
            )
  
            // calculate total market value of equity 
            calculateTotalMarketValueOfEquity.push(
              convertToNumberOrOne(result[MNEMONIC_ENUMS.IQ_DILUT_WEIGHT][i]) *
              convertToNumberOrOne(result[MNEMONIC_ENUMS.IQ_LASTSALEPRICE][i])
            )
  
            // calculate total market value of capital
            calculateTotalMarketValueOfCapital.push(
              calculateTotalBookValue[i] + 
              convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_PREF_EQUITY][i]) + 
              calculateTotalMarketValueOfEquity[i]
            )
  
            // calculate debt to capital
            calculateTotalDebtToCapital.push(
              (
                (
                  calculateTotalBookValue[i] + convertToNumberOrZero(result[MNEMONIC_ENUMS.IQ_PREF_EQUITY][i])
                ) / calculateTotalMarketValueOfCapital[i]
              ) * 100
            )
  
            // calculate equity to capital
            calculateTotalEquityToCapital.push(
              (calculateTotalMarketValueOfEquity[i] / calculateTotalMarketValueOfCapital[i]) * 100
            )
            
          }
  
          return {
            calculateTotalDebtToCapital,
            calculateTotalEquityToCapital
          }
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:"calculation failed for debt to capital and market value functions"
          }
        }
      }
      //#endregion beta calculation ends
}