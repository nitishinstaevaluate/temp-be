import { Injectable } from "@nestjs/common";
import { convertIntoTimeStamp } from "src/ciq-sp/ciq-common-functions";
import { ElasticSearchService } from "src/elasticSearch/elastic-search-client.service";
import { convertUnixTimestampToQuarterAndYear } from "src/excelFileServices/common.methods";
import { elasticSearchIndex } from "src/library/enums/elastic-search-index.enum";
import { elasticSearchKey } from "src/library/enums/elastic-search-keys.enum";

@Injectable()
export class ciqElasticFinancialSegmentService {
    constructor(private readonly elasticSearchClientService: ElasticSearchService){}
    async elasticSearchFinancialAggregate(body){
        try{
            let companyIdArray = [];
            for await (const indIndustry of body.industryAggregateList){
                companyIdArray.push(indIndustry?.companyId);
            }

            const payload = {
                companyIdArray,
                valuationDate: body.valuationDate,
                companyList: body.industryAggregateList
            }

            return this.computeFinancialSegment(payload);
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"elastic search financial aggregate failed"
            }
        }
    }

    async computeFinancialSegment(body){
        try{
            const cashAndEquivalentData = await this.elasticSearchCashAndCashEquivalent(body);
            body.companyList = cashAndEquivalentData;
            const totalDebtData = await this.elasticSearchDebt(body);
            return totalDebtData;
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"financial segment computation failed"
            }
        }
    }

    async elasticSearchCashAndCashEquivalent(body){
        try{
            const criteria = {
                query: {
                    bool: {
                        must: [
                            {
                                terms: {
                                    [elasticSearchKey.COMPANYID]: body?.companyIdArray
                                }
                            },
                            // {
                            //     term: {
                            //         [elasticSearchKey.CALENDARYEAR]: `${new Date(convertIntoTimeStamp(body?.valuationDate)).getFullYear()}`      //Repurposed if needed in future
                            //     }
                            // },
                            // {
                            //     term: {
                            //         [elasticSearchKey.CALENDARQUARTER]: `${convertUnixTimestampToQuarterAndYear(convertIntoTimeStamp(body.valuationDate)).quarter-1}`        //Repurposed if needed in future
                            //     }
                            // },
                            {
                                range: {
                                    [elasticSearchKey.PERIODENDDATE]: {
                                    lte: `${convertIntoTimeStamp(body?.valuationDate).toISOString()}`
                                  }
                                }
                              },
                            {
                                term: {
                                    [elasticSearchKey.DATAITEMID]: '1096'     //using cash and cash equivalen code
                                }
                            },
                            {
                                term: {
                                    [elasticSearchKey.PERIODTYPEID]: '4'
                                }
                            },
                        ]
                        // should: [    //Repurposed if needed in future
                        //     {
                        //         term: {
                        //             [elasticSearchKey.PERIODTYPEID]: '1'
                        //         }
                        //     },
                        //     {
                        //         bool: {
                        //             must_not: {
                        //                 term: {
                        //                     [elasticSearchKey.PERIODTYPEID]: '1'
                        //                 }
                        //             },
                        //             must: {
                        //                 term: {
                        //                     [elasticSearchKey.PERIODTYPEID]: '2'
                        //                 }
                        //             }
                        //         }
                        //     }
                        // ]
                    }
                },
                sort : [
                    { 
                        [elasticSearchKey.PERIODENDDATE] : {
                            "order" : "desc"
                        }
                    },
                  ]
            };
            
            const companyFinancialData = await this.elasticSearchClientService.search(elasticSearchIndex.ciqlatestinstancefinperiodind, criteria);
            let companyDetailsList = [];
            for await(const individualCompanyDetails of body?.companyList){
                let financialFound = false;
                for await(const individualFinancialOfCompany of companyFinancialData.data){
                    if(individualFinancialOfCompany.COMPANYID === individualCompanyDetails.companyId){ 
                        individualCompanyDetails.cashEquivalent = individualFinancialOfCompany.DATAITEMVALUE
                        companyDetailsList.push({ ...individualCompanyDetails});
                        financialFound = true;
                        break;
                    }
                }
                if (!financialFound) {
                    companyDetailsList.push({ ...individualCompanyDetails });
                }
            }

            return companyDetailsList;
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"elastic search cash and cash equiveltent failed"
            }
        }
    }
    async elasticSearchDebt(body){
        try{

            const criteria = {
                query: {
                    bool: {
                        must: [
                            {
                                terms: {
                                    [elasticSearchKey.COMPANYID]: body?.companyIdArray
                                }
                            },
                            // {
                            //     term: {
                            //         [elasticSearchKey.CALENDARYEAR]: `${new Date(convertIntoTimeStamp(body?.valuationDate)).getFullYear()}`      //Repurposed if needed in future
                            //     }
                            // },
                            {
                                range: {
                                    [elasticSearchKey.PERIODENDDATE]: {
                                    lte: `${convertIntoTimeStamp(body?.valuationDate).toISOString()}`
                                  }
                                }
                            },
                            // {
                            //     term: {
                            //         [elasticSearchKey.CALENDARQUARTER]: `${valuationQuarter-1}`      //Repurposed if needed in future
                            //     }
                            // },
                            {
                                term: {
                                    [elasticSearchKey.DATAITEMID]: '4173'     //using total debt code
                                }
                            },
                            {
                                term: {
                                    [elasticSearchKey.PERIODTYPEID]: '4'  //Using LTM period type
                                }
                            },
                        ],
                      
                    }
                },
                sort : [
                    { 
                        [elasticSearchKey.PERIODENDDATE] : {
                            "order" : "desc"
                        }
                    },
                  ]
            };

            const companyDebtData = await this.elasticSearchClientService.search(elasticSearchIndex.ciqlatestinstancefinperiodind, criteria);
            let companyDetailsList = [];
            for await(const individualCompanyDetails of body?.companyList){
                let debtFound = false;
                for await(const individualDebtOfCompany of companyDebtData.data){
                    if(individualDebtOfCompany.COMPANYID === individualCompanyDetails.companyId){ 
                        individualCompanyDetails.debt = individualDebtOfCompany.DATAITEMVALUE
                        companyDetailsList.push({ ...individualCompanyDetails});
                        debtFound = true;
                        break;
                    }
                }
                if (!debtFound) {
                    companyDetailsList.push({ ...individualCompanyDetails });
                }
            }

            return companyDetailsList
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"elastic search total debt failed"
            }
        }
    }
}