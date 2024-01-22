import { Injectable, NotFoundException } from '@nestjs/common';
import { extractValues, ciqFinancialCreateStructure } from './ciq-common-functions';
import { MNEMONICS_ARRAY_3, MNEMONIC_ENUMS } from 'src/constants/constants';
import { convertToNumberOrZero } from 'src/excelFileServices/common.methods';


@Injectable()
export class CiqSpFinancialService {

    async createFinancialSegmentPayloadStructure(data, valuationDate){
        try{
            const finalPayload = [];

            for await (const mnemonic of MNEMONICS_ARRAY_3) {
                const payload = await ciqFinancialCreateStructure(data, mnemonic, valuationDate);
                finalPayload.push(...payload.data);
            }

            return {inputRequests: finalPayload}
        }
        catch(error){
            return {
                error: error,
                status: false,
                msg: `Payload creation for financial segment failed`
            };
        }
    }

    async calculateFinancialAggregate(axiosResponse, inputList){
        try{
            if (!axiosResponse.data) {
                throw new NotFoundException({
                  message: 'Axios response not found',
                  status: false,
                });
              }

            const result = {};
            let maxLength = 0
            for await (const details of axiosResponse.data.GDSSDKResponse) {
              if (!details.ErrMsg) {
                for await (const mnemonic of MNEMONICS_ARRAY_3) {
                  if (details.Headers.includes(mnemonic)) {
                    result[mnemonic] = result[mnemonic] || [];
                    result[mnemonic].push(...await extractValues(details, mnemonic));
    
                    const currentLength = result[mnemonic].length;
                    if (currentLength > maxLength) {
                      maxLength = currentLength;
                    }
                  }
                }
              }
              else{
                result[details.Mnemonic] = [];
              }
            }

            const serialiseFinancialList = await this.serializeFinancials(result, inputList, maxLength);
            return serialiseFinancialList;
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"financial segment calculation failed"
            }
        }
    }

    async serializeFinancials(data, inputList, maxlength){
        try{
            let array = [];
            let counter = 1;
            for(let i = 0; i < maxlength; i++){
              array.push(
                {
                  company: inputList[i].COMPANYNAME,
                  companyId: inputList[i].COMPANYID,
                  serialNo: counter,
                  stockPrice: convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_CLOSEPRICE][i]),
                  outstandingShares: convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_SHARESOUTSTANDING][i]),
                  marketCap: convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_MARKETCAP][i]),
                  cashEquivalent: convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_CASH_EQUIV][i]),
                  debt: convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_SECURED_DEBT][i]),
                  enterpriseValue: convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_TEV][i]),
                  revenue: convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_TOTAL_REV_AS_REPORTED][i]),
                  evByRevenue:isFinite(convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_TEV][i])/convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_TOTAL_REV_AS_REPORTED][i])) 
                    ?  (convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_TEV][i])/convertToNumberOrZero(data[MNEMONIC_ENUMS.IQ_TOTAL_REV_AS_REPORTED][i]))
                    : 0
                }
              )
              counter++
            }
            return array;
          }
          catch(error){
            return{
              error:error,
              status:false,
              msg:"Serialisation failed"
            }
          }
    }
}