import { Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { CiqIndustryListDto, CiqSegmentDescriptionDto } from "src/ciq-sp/dto/ciq-sp.dto";
import { ElasticSearchService } from "src/elasticSearch/elastic-search-client.service";
import { RedisService } from "src/middleware/redisConfig";

@Injectable()
export class ciqElasticSearchAggregateService{
    simpleIndustryList = [];
        constructor(private readonly elasticSearchClientService: ElasticSearchService,
            private readonly redisClientService: RedisService){}

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
                pageStart: body.pageStart
            }

            const companyList = await this.fetchCompanyList(payload); // only filter through ciqCompanyId table by listed companies

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

    async fetchCompanyList(payload){
        try{
            let queryArray = [];
            let listedCompanyList = [];
            let pageStart = 0, size = 10, totalListCount;

            if(payload.companyType.length){
                queryArray.push({terms: {"COMPANYTYPEID": payload.companyType}});
            }

            if(payload.companyStatusType.length){
                queryArray.push({terms: {"COMPANYSTATUSTYPEID": payload.companyStatusType}});
            }

            if(payload?.decodeIndustry?.simpleindustryid){
                queryArray.push({terms: {"SIMPLEINDUSTRYID": [+payload.decodeIndustry.simpleindustryid]}});
                
            }

            if(payload?.companyIdArray.length){
                queryArray.push({terms: {"COMPANYID": payload.companyIdArray}});
            }

            // if(queryArray.length === 0){
            //     totalListCount = await this.elasticSearchClientService.countTotal('ciqcompanyindustryind');
            // }
            
            if(payload?.pageStart){
                pageStart = payload.pageStart;
            }

            if(payload?.size){
                size = payload.size;
            }

            queryArray.push({"exists": {"field": "SIMPLEINDUSTRYID"}}); // null check filter to remove null simpleindustryid records 

            const criteria = {
                query: {
                    bool: {
                        must: queryArray
                    }
                },
                _source: {
                    includes: ['COMPANYID', 'COMPANYNAME', 'SIMPLEINDUSTRYID', 'CITY'],
                },
                from: `${pageStart}`,
                size: `${size}`,
                track_total_hits: true,
            };
            
            const companyList = await this.elasticSearchClientService.search('ciqcompanyind', criteria);

            if(!this.simpleIndustryList.length){
                await this.fetchSimpleIndustry();
            }

            for await (const companyDetails of companyList.data) {
                for await (const simpleIndustry of this.simpleIndustryList) {
                    if (companyDetails.SIMPLEINDUSTRYID === simpleIndustry.SIMPLEINDUSTRYID) {
                        listedCompanyList.push({ ...companyDetails, SIMPLEINDUSTRYDESCRIPTION: simpleIndustry.SIMPLEINDUSTRYDESCRIPTION });
                    }
                }
            }

            const modifiedCompanyList = plainToClass(CiqIndustryListDto, listedCompanyList, {excludeExtraneousValues:true})
            return {
                data:modifiedCompanyList,
                status:true,
                msg:"ciq company list fetched",
                // listCount:totalListCount ? totalListCount.count :  companyList.total
                listCount: companyList.total
            }
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"company list while elastic search not found"
            }
        }
    }

    async GICSBasedCompanyList(){
        try{
            const criteria = {
                query: {
                    match_all:{}
                },
                size: 10000,
                _source: {
                    includes: ['COMPANYID'],
                },
            };

            const companyIndustryList = await this.elasticSearchClientService.search('ciqcompanyindustryind', criteria);

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

    async saveBusinessDescriptor(){
        try{
            const criteria = {
                query: {
                    match_all:{}
                },
                size: 10000,
                _source: {
                    includes: ['COMPANYID', 'SEGMENTDESCRIPTION'],
                },
            };

            const descriptionQuery = await this.elasticSearchClientService.search('ciqsegmentdescriptionind', criteria);

            const businessDescriptorDetails = await plainToClass(CiqSegmentDescriptionDto, descriptionQuery.data, {excludeExtraneousValues:true});

            this.redisClientService.setKeyValue('businessdescriptor',JSON.stringify(businessDescriptorDetails));
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"redis descriptor key creation failed"
            }
        }
    }

    async fetchBusinessDescriptor(){
        try{
            const criteria = {
                query: {
                    match_all:{}
                },
                size: 10000,
                _source: {
                    includes: ['COMPANYID', 'SEGMENTDESCRIPTION'],
                },
            };

            const descriptionQuery = await this.elasticSearchClientService.search('ciqsegmentdescriptionind', criteria);
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

    async fetchSimpleIndustry(){
        try{
            const criteria = {
                query: {
                    match_all:{}
                },
                size: 10000
            };

            this.simpleIndustryList = (await this.elasticSearchClientService.search('ciqsimpleindustry', criteria)).data;
            return this.simpleIndustryList;
        }
        catch(error){
            return{
                error:error,
                status:false,
                msg:"elastic search simple industry failed"
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
                                    "COMPANYID":data.companyId
                                }
                            }
                        ]
                    }
                }
            }

            const companyData = await this.elasticSearchClientService.search('ciqcompanyind', criteria);
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
}