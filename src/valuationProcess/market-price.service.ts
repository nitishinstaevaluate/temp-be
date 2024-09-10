import { Injectable, NotFoundException } from "@nestjs/common";
import { NOTFOUND } from "dns";
import { AuthenticationService } from "src/authentication/authentication.service";
import { GET_MULTIPLIER_UNITS } from "src/constants/constants";
import { convertToNumberOrZero, convertUnixTimestampToQuarterAndYear, getRequestAuth } from "src/excelFileServices/common.methods";
import { CIQ_ELASTIC_SEARCH_PRICE_EQUITY } from "src/library/interfaces/api-endpoints.local";
import { axiosInstance, axiosRejectUnauthorisedAgent } from "src/middleware/axiosConfig";

@Injectable()
export class MarketPriceService {
    constructor(private authenticationService: AuthenticationService){}
    async fetchPriceEquityShare(header, companyId, valuationDateTimestamp, outstandingShares, reportingUnit){
        try{
            const oneDayInMillis = 24 * 60 * 60 * 1000;
            const valuationDate = new Date(valuationDateTimestamp);
            const valuationDatePlusOneDay = new Date(valuationDate.getTime() + oneDayInMillis);
            const valuationDatePlusOneDayTimestamp = valuationDatePlusOneDay.getTime();

            const payload = {
                companyDetails: {
                    date:convertUnixTimestampToQuarterAndYear(valuationDatePlusOneDayTimestamp).date,
                    companyId:companyId,
                }
            }
            
            if(!header)
                return 'Insufficient data (auth token not found)';
            
            const headers = { 
                'Authorization':`${header.authorization}`,
                'Content-Type': 'application/json'
            }

            const financialSegmentDetailsNSE:any = await axiosInstance.post(
                `${CIQ_ELASTIC_SEARCH_PRICE_EQUITY}`, 
                {
                    companyDetails: { 
                        ...payload.companyDetails, 
                        exchangeId: 161 
                    }
                }, 
                { httpsAgent: axiosRejectUnauthorisedAgent, headers });
            const financialSegmentDetailsBSE:any = await axiosInstance.post(`${CIQ_ELASTIC_SEARCH_PRICE_EQUITY}`, 
                {
                    companyDetails: { 
                        ...payload.companyDetails, 
                        exchangeId: 39 
                    }
                }, 
            { httpsAgent: axiosRejectUnauthorisedAgent, headers });

            if(!financialSegmentDetailsNSE?.data?.data?.length && !financialSegmentDetailsBSE?.data?.data?.length)
                return new NotFoundException(`Share price data not found for companyId - ${companyId}`).getResponse();

            const dataNse = financialSegmentDetailsNSE.data?.data;
            const dataBse = financialSegmentDetailsBSE.data?.data;

            const data = await this.mergeData(dataNse, dataBse);

            const sharePrice10Days = await this.sharePrice10Days(data);
            const computations = await this.computeValuePerShare(data);
            const equityValueNse = convertToNumberOrZero(computations.valuePerShareNse) * convertToNumberOrZero(outstandingShares)/ GET_MULTIPLIER_UNITS[`${reportingUnit}`];
            const equityValueBse = convertToNumberOrZero(computations.valuePerShareBse) * convertToNumberOrZero(outstandingShares)/ GET_MULTIPLIER_UNITS[`${reportingUnit}`];
            
            return {
                sharePriceLastTenDays: sharePrice10Days,
                sharePriceLastNinetyDays: data,
                vwapLastTenDays: computations.vwap10Days,
                vwapLastNinetyDays: computations.vwap90Days,
                valuePerShare:{
                    valuePerShareNse: computations.valuePerShareNse,
                    valuePerShareBse: computations.valuePerShareBse
                },
                equityValue: {
                    equityValueNse,
                    equityValueBse
                },
            }
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:"Market Price Valuation calculation failed"
          }
        }
      }

      async mergeData(nseData, bseData) {
        nseData = nseData || [];
        bseData = bseData || [];
      
        const maxLength = Math.max(nseData.length, bseData.length);
      
        return Array.from({ length: maxLength }, (_, index) => {
          const nseElement = nseData[index] || {};
          const bseElement = bseData[index] || {};
      
          const { VOLUME: VOLUMENSE, VWAP: VWAPNSE, ...restNse } = nseElement;
          const { VOLUME: VOLUMEBSE, VWAP: VWAPBSE, ...restBse } = bseElement;
      
          return {
            VOLUMENSE: VOLUMENSE || null,
            VOLUMEBSE: VOLUMEBSE || null,
            VWAPBSE: VWAPBSE || null,
            VWAPNSE: VWAPNSE || null,
            ...restNse,
            ...restBse,
          };
        });
      }

      async sharePrice10Days(data){
        const createSplitter = [...data];
        return createSplitter.slice(0,10);
      }

      async computeValuePerShare(sharePrice90Days){
        const vwap10Days = this.calculateVwap(sharePrice90Days, true);
        const vwap90Days = this.calculateVwap(sharePrice90Days, false);

        const valuePerShareNse = convertToNumberOrZero(vwap90Days.VWAPNSE) > convertToNumberOrZero(vwap10Days.VWAPNSE) ? convertToNumberOrZero(vwap90Days.VWAPNSE) : convertToNumberOrZero(vwap10Days.VWAPNSE);
        const valuePerShareBse = convertToNumberOrZero(vwap90Days.VWAPBSE) > convertToNumberOrZero(vwap10Days.VWAPBSE) ? convertToNumberOrZero(vwap90Days.VWAPBSE) : convertToNumberOrZero(vwap10Days.VWAPBSE);
        console.log(valuePerShareBse,valuePerShareNse,vwap90Days.VWAPBSE, vwap10Days.VWAPBSE)
        return { vwap10Days, vwap90Days, valuePerShareNse, valuePerShareBse }
    }
      
    calculateVwap(sharePriceDetails, tenDaysBool){
        let volumeSummationNse = 0, volumeSummationBse = 0, totalRevenueSummationNse = 0, totalRevenueSummationBse = 0; 
        (
            tenDaysBool ? 
            sharePriceDetails.slice(0, 10) : 
            sharePriceDetails
        ).map((indSharePrice)=>{
            if(indSharePrice.VOLUMENSE){
                volumeSummationNse += convertToNumberOrZero(indSharePrice.VOLUMENSE);
            }
            if(indSharePrice.VOLUMEBSE){
                volumeSummationBse += convertToNumberOrZero(indSharePrice.VOLUMEBSE);
            }
            if(indSharePrice.VWAPNSE && indSharePrice.VOLUMENSE){
                totalRevenueSummationNse += (convertToNumberOrZero(indSharePrice.VOLUMENSE) * convertToNumberOrZero(indSharePrice.VWAPNSE));
            }
            if(indSharePrice.VWAPBSE && indSharePrice.VOLUMEBSE){
                totalRevenueSummationBse += (convertToNumberOrZero(indSharePrice.VOLUMEBSE) * convertToNumberOrZero(indSharePrice.VWAPBSE));
            }
        })
        
        return {
            VWAPNSE: convertToNumberOrZero(totalRevenueSummationNse/volumeSummationNse).toFixed(2),
            VWAPBSE: convertToNumberOrZero(totalRevenueSummationBse/volumeSummationBse).toFixed(2),
        };
      }
}