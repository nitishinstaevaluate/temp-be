import { Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { ElasticSearchService } from "src/elasticSearch/elastic-search-client.service";
import { CiqPriceEquityDto } from "./dto/ciq-elastic-search.dto";

@Injectable()
export class ciqElasticPriceEquityService {
    constructor(private readonly elasticSearchClientService:ElasticSearchService){}

    async calculatePriceEquityAggregate(body:any){
        try{
            const company = body.companyDetails;
            const date = body.date;
            const criteria = {
                
                    "query": {
                      "bool": {
                        "must": [
                          {
                            "range": {
                              "PRICINGDATE": {
                                "lt": "2023-09-30T00:00:00.000000"
                              }
                            }
                          },
                          {
                            "term": {
                              "COMPANYID": "713928041"
                            }
                          },
                          {
                            "term": {
                              "TRD_PRIMARYFLAG": "1"
                            }
                          }
                        ]
                      }
                    },
                    "sort": [
                      {
                        "PRICINGDATE": {
                          "order": "desc"
                        }
                      }
                    ],
                    "size": 90
                  }
            
                  const companyData = await this.elasticSearchClientService.search('ciqpriceequityind', criteria);

                  const priceEquityDetails:any = plainToClass(CiqPriceEquityDto, companyData.data, {excludeExtraneousValues:true});

                  let modifiedPriceEquityDetails = priceEquityDetails.map((elements,index)=>{
                    return {
                        SERIALNO:index + 1,
                        ...elements
                    }
                  })

                  return {
                    data:modifiedPriceEquityDetails,
                    total:modifiedPriceEquityDetails.length,
                    status:true
                  }
        }
        catch(error){
            return{
                error:error,
                status:false,
                msg:"price equity aggregate calculation failed"
            }
        }
    }
}