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
                    companyId:companyId
                }
            }
            
            if(!header)
                return 'Insufficient data (auth token not found)';
            
            const headers = { 
                'Authorization':`${header.authorization}`,
                'Content-Type': 'application/json'
            }

            const financialSegmentDetails:any = await axiosInstance.post(`${CIQ_ELASTIC_SEARCH_PRICE_EQUITY}`, payload, { httpsAgent: axiosRejectUnauthorisedAgent, headers });

            if(!financialSegmentDetails?.data?.data?.length)
                return new NotFoundException(`Share price data not found for companyId - ${companyId}`).getResponse();

            const data = financialSegmentDetails.data?.data;

            const sharePrice10Days = await this.sharePrice10Days(data);
            const computations = await this.computeValuePerShare(data);
            const equityValue = convertToNumberOrZero(computations.valuePerShare) * convertToNumberOrZero(outstandingShares)/ GET_MULTIPLIER_UNITS[`${reportingUnit}`];
            
            return {
                sharePriceLastTenDays: sharePrice10Days,
                sharePriceLastNinetyDays: data,
                vwapLastTenDays: computations.vwap10Days,
                vwapLastNinetyDays: computations.vwap90Days,
                valuePerShare:computations.valuePerShare,
                equityValue: equityValue
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

      async sharePrice10Days(data){
        const createSplitter = [...data];
        return createSplitter.slice(0,10);
      }

      async computeValuePerShare(sharePrice90Days){
        const vwap10Days = this.calculateVwap(sharePrice90Days, true);
        const vwap90Days = this.calculateVwap(sharePrice90Days, false);

        const valuePerShare = vwap90Days > vwap10Days ? vwap90Days : vwap10Days;

        return { vwap10Days, vwap90Days, valuePerShare }
    }
      
    calculateVwap(sharePriceDetails, tenDaysBool){
        let volumeSummation= 0, totalRevenueSummation = 0; 
        (
            tenDaysBool ? 
            sharePriceDetails.slice(0, 10) : 
            sharePriceDetails
        ).map((indSharePrice)=>{
            if(indSharePrice.VOLUME){
                volumeSummation += convertToNumberOrZero(indSharePrice.VOLUME);
            }
            if(indSharePrice.VWAP && indSharePrice.VOLUME){
                totalRevenueSummation += (convertToNumberOrZero(indSharePrice.VOLUME) * convertToNumberOrZero(indSharePrice.VWAP));
            }
        })
        
        return convertToNumberOrZero(totalRevenueSummation/volumeSummation).toFixed(2);
      }
}