import { Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { CiqIndustryListDto, CiqSegmentDescriptionDto } from "src/ciq-sp/dto/ciq-sp.dto";
import { ElasticSearchService } from "src/elasticSearch/elastic-search-client.service";
import { RedisService } from "src/middleware/redisConfig";
import { CiqPriceEquityDto } from "./dto/ciq-elastic-search.dto";
import { ciqElasticCompanyListSearchService } from "./ciq-elastic-company-list-search.service";
import { ciqElasticPriceEquityService } from "./ciq-elastic-price-equity.service";
import { elasticSearchIndex } from "src/library/enums/elastic-search-index.enum";
import { elasticSearchKey } from "src/library/enums/elastic-search-keys.enum";

@Injectable()
export class ciqElasticSearchAggregateService{
    simpleIndustryList = [];
        constructor(private readonly elasticSearchClientService: ElasticSearchService,
            // private readonly redisClientService: RedisService,
            private readonly ciqElasticCompanyListSearchService:ciqElasticCompanyListSearchService,
            private readonly ciqElasticPriceEquityService:ciqElasticPriceEquityService){}

    async elasticSearchAggregate(body){
        try{
            const businessDescriptors = await this.fetchBusinessDescriptor();
            let filteredDescriptorDetails = [];
            if(body.businessDescriptor){
                for await(const descriptors of businessDescriptors){
                    if(descriptors.SEGMENTDESCRIPTION.toLowerCase().includes(body.businessDescriptor.toLowerCase().trim()))
                    {
                        filteredDescriptorDetails.push(descriptors.COMPANYID);
                    }
                }
                if(filteredDescriptorDetails.length === 0){
                    return {
                        data:[],
                        status:true,
                        msg:"data not found",
                        listCount:0
                    }
                }
            }
            else{
                // const listedCompanyList:any = await this.GICSBasedCompanyList();
                // filteredDescriptorDetails.push(...listedCompanyList)
                filteredDescriptorDetails = []
            }
        
            const payload = {
                decodeIndustry: body.decodeIndustry,
                companyStatusType: body.companyStatusType,
                companyType: body.companyType,
                industryName:body.industryName,
                industryId: body.industryId,
                decodeLocation: body.decodeLocation,
                companyIdArray:filteredDescriptorDetails,
                size: body.size,
                pageStart: body.pageStart,
                valuationDate:body.valuationDate,
                companyName:body.companyName
            }

            const companyList = await this.ciqElasticCompanyListSearchService.fetchCompanyList(payload); // only filter through ciqCompanyId table by listed companies

            return companyList;
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"elastic search aggregate failed"
            }
        }
    }

    //Sanket (31-01-2024) - Uncomment this function to get only listed companies 
    async GICSBasedCompanyList(){
        try{
            const criteria = {
                query: {
                    match_all:{}
                },
                size: 10000,
                _source: {
                    includes: [elasticSearchKey.COMPANYID],
                },
            };

            const companyIndustryList = await this.elasticSearchClientService.search(elasticSearchIndex.ciqcompanyindustryind, criteria);

            let listedCompanyIdArray = [];
            
            listedCompanyIdArray = companyIndustryList.data.map((elements)=>{
                return elements.COMPANYID;
            })

            return listedCompanyIdArray;
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"Company filtering based on GICS failed"
            }
        }
    }

    
    //Sanket (31-01-2024) - Uncomment this function to store business descriptor data into redis manager
    // async saveBusinessDescriptor(){
    //     try{
    //         const criteria = {
    //             query: {
    //                 match_all:{}
    //             },
    //             size: 10000,
    //             _source: {
    //                 includes: ['COMPANYID', 'SEGMENTDESCRIPTION'],
    //             },
    //         };

    //         const descriptionQuery = await this.elasticSearchClientService.search('ciqsegmentdescriptionind', criteria);

    //         const businessDescriptorDetails = await plainToClass(CiqSegmentDescriptionDto, descriptionQuery.data, {excludeExtraneousValues:true});

    //         this.redisClientService.setKeyValue('businessdescriptor',JSON.stringify(businessDescriptorDetails));
    //     }
    //     catch(error){
    //         return {
    //             error:error,
    //             status:false,
    //             msg:"redis descriptor key creation failed"
    //         }
    //     }
    // }

    async fetchBusinessDescriptor(){
        try{
            const criteria = {
                query: {
                    match_all:{}
                },
                size: 10000,
                _source: {
                    includes: [elasticSearchKey.COMPANYID, elasticSearchKey.SEGMENTDESCRIPTION],
                },
            };

            const descriptionQuery = await this.elasticSearchClientService.search(elasticSearchIndex.ciqsegmentdescriptionind, criteria);
            return descriptionQuery.data;

        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"elastic search descriptor failed"
            }
        }
    }

    

    async findByCompanyId(data){
        try{
            const criteria = {
                query: {
                    bool: {
                        must: [
                            {
                                term:{
                                    [elasticSearchKey.COMPANYID]:data.companyId
                                }
                            }
                        ]
                    }
                }
            }

            const companyData = await this.elasticSearchClientService.search(elasticSearchIndex.ciqcompanyind, criteria);
            return companyData.data;
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"elastic search company-id failed"
            }
        }
    }

    async elasticSearchPriceEquityAggregate(body){
        try{
            return this.ciqElasticPriceEquityService.calculatePriceEquityAggregate(body);
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"ciq price equity fetch failed"
            }
        }
    }

    async fetchAllListedCompanies(){
        try{
            const listedCompaniesId = await this.GICSBasedCompanyList();

            const criteria = {
                query: {
                    bool: {
                        must: {
                            terms: { 
                                [elasticSearchKey.COMPANYID]: listedCompaniesId
                            }
                        }
                    }
                },
                _source: {
                    includes: [elasticSearchKey.COMPANYID, elasticSearchKey.COMPANYNAME],
                },
                size: 10000,
                track_total_hits: true,
            };
            
            const ciqCompanyList = await this.elasticSearchClientService.search(elasticSearchIndex.ciqcompanyind, criteria);
            
            return ciqCompanyList.data;

        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"elastic search listed companies found"
            }
        }
    }

    async updateCompaniesAggregate(body){
        try{
            return await this.ciqElasticCompanyListSearchService.updateCompaniesAggregate(body);
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"elastic search update companies aggregate failed"
            }
        }
    }
}