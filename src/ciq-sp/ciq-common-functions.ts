import { MNEMONIC_ENUMS, MODEL } from "src/constants/constants"
import { convertToNumberOrZero } from "src/excelFileServices/common.methods"

    export async function iqCreateStructure(data,mnemonic){
        if(mnemonic === MNEMONIC_ENUMS.IQ_DILUT_WEIGHT)
        return {
            "data":data.map((elements)=>{
            return {
                "function":"GDSP",
                "mnemonic":`${MNEMONIC_ENUMS.IQ_DILUT_WEIGHT}`,
                "identifier":`IQ${elements.COMPANYID}`,
                "properties":{
                "periodType":"IQ_FQ",
                "restatementTypeId":"LFR",
                // "asOfDate": '12/31/21',
                "currencyId":"INR",
                "filingMode" : "P",
                "consolidatedFlag":"CON",
                "currencyConversionModeId" : "H",
                }
            }
            })
        }

        if(mnemonic === MNEMONIC_ENUMS.IQ_CUSTOM_BETA)
        return {
            "data":data.map((elements)=>{
            return {
                "function":"GDSP",
                "mnemonic":`${MNEMONIC_ENUMS.IQ_CUSTOM_BETA}`,
                "identifier":`IQ${elements.COMPANYID}`,
                "properties":{
                "asOfDate": `${getOneDayBeforeDate()}`,
                "startDate": "01/01/2018",
            //   "secondaryIdentifier": "^SPX",
                "endDate": "12/31/2023",
                "frequency": "Monthly"
                }
            }
            })
        }

        if(mnemonic === MNEMONIC_ENUMS.IQ_LASTSALEPRICE)
        return {
            "data":data.map((elements)=>{
            return {
                "function":"GDSP",
                "mnemonic":`${MNEMONIC_ENUMS.IQ_LASTSALEPRICE}`,
                "identifier":`IQ${elements.COMPANYID}`,
                "properties":{
                "currencyConversionModeId" : "H",
                "currencyId" : "INR",
                // "asOfDate": '12/31/21'
                }
            }
            })
        }


        return {
        "data":data.map((elements)=>{
            return {
            "function":"GDSP",
            "mnemonic":`${mnemonic}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
                "periodType":"IQ_LTM",
                "restatementTypeId":"LFR",
                "filingMode" : "P",
                "currencyConversionModeId" : "H",
                "currencyId" : "INR",
                // "asOfDate": '12/31/21'
            }
            }
        })
        }
    }

    export async function ciqFinancialCreateStructure(data, mnemonic, valuationDate){
        return {
            "data":data.map((elements)=>{
            return {
                "function":"GDSP",
                "mnemonic":`${mnemonic}`,
                "identifier":`IQ${elements.COMPANYID}`,
                "properties":{
                "asOfDate": `${valuationDate}`
                }
            }
            })
        }
    }

    export async function extractValues(betaDetails: any, mnemonic: any) {
        try {
        return betaDetails.Rows.map((innerBetaRows: any) => {
            const value = innerBetaRows?.Row[0];
            return !isNaN(parseInt(value)) && !`${value}`.includes('-') && value !== "0"
            ? parseFloat(value)
            : null;
        });
        } 
        catch (error) {
        return {
            error: error,
            status: false,
            msg: `Beta extraction failed for ${mnemonic}`,
        };
        }
    }

    export async function calculateMean(data, maxLength){
        try{
        let total = 0
        for await (const items of data){
            total += convertToNumberOrZero(items);
        }
        return total/maxLength;
        }
        catch(error){
        return {
            error:error,
            msg:"mean calculation failed",
            status:false
        }
        }
    }

    export async function calculateMedian(data){
        try{
        let median;
        const validData = data.filter(value => convertToNumberOrZero(value) > 0);
        const sortedData = [...validData].sort((a, b) => convertToNumberOrZero(a) - convertToNumberOrZero(b));
        const middleIndex = Math.floor(sortedData.length / 2);
        
        if (sortedData.length % 2 === 0) {
            median =  (sortedData[middleIndex - 1] + sortedData[middleIndex]) / 2;
        } 
        else {
            median =  sortedData[middleIndex];
        }
        return median;
        }
        catch(error){
        return {
            error:error,
            status:false,
            msg:"Median calculation failed"
        }
        }
    }


    export function getOneDayBeforeDate(){
        try{
        const currentDate = new Date();
        const oneDayBefore = new Date(currentDate);
        oneDayBefore.setDate(currentDate.getDate() - 1);
        const formattedDate = `${(oneDayBefore.getMonth() + 1).toString().padStart(2, '0')}/${oneDayBefore.getDate().toString().padStart(2, '0')}/${oneDayBefore.getFullYear()}`;

        return formattedDate
        }
        catch(error){
        return{
            error:error,
            msg:"Date not found",
            status:false
        }
        }
    }

    export async function ciqCompanyMeanMedianStructure(data:any, mnemonic){
        return {
        "data":data.map((elements)=>{
            return {
            "function":"GDSP",
            "mnemonic":`${mnemonic}`,
            "identifier":`IQ${elements.COMPANYID}`,
            "properties":{
                "periodType":"IQ_CY"
            }
            }
        })
        }
    }

    export async function  ciqSharePriceCreateStructure(data:any, mnemonic){
        return {
            "data":data.map((elements)=>{
                return {
                "function":"GDSP",
                "mnemonic":`${mnemonic}`,
                "identifier":`IQ${elements.COMPANYID}`,
                "properties":{
                    "periodType":"IQ_CY"
                }
                }
            })
            }
    }

    export function formatDateToMMDDYYYY(input: Date | number): string {
        const date = input instanceof Date ? input : new Date(input);
      
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
      }

     export function isNotRuleElevenUaAndNav(modelArray:any){
        if (modelArray?.length === 1 &&
          (
            modelArray?.includes(MODEL[6]) ||
            modelArray?.includes(MODEL[5])
          ))
          {
          return false;
          }
          else if(modelArray?.length === 2 && (
            modelArray?.includes(MODEL[6]) &&
            modelArray?.includes(MODEL[5])
          )){
            return false;
          }
          else if(modelArray?.length  > 1 && (
            modelArray?.includes(MODEL[6]) ||
            modelArray?.includes(MODEL[5])
          )){
            return true;
          }
          else{
            return true;
          }
      }