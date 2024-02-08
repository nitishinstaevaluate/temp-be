import { Injectable } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { CiqIndustryListDto } from "src/ciq-sp/dto/ciq-sp.dto";
import { ElasticSearchService } from "src/elasticSearch/elastic-search-client.service";
import { convertUnixTimestampToDateString, getFormattedProvisionalDate } from "src/excelFileServices/common.methods";

@Injectable()
export class ciqElasticCompanyListSearchService {
    simpleIndustryList=[];
    constructor(private readonly elasticSearchClientService:ElasticSearchService){}

    async fetchCompanyList(payload){
        try{
            let queryArray = [];
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
            
            const ciqCompanyList = await this.elasticSearchClientService.search('ciqcompanyind', criteria);

            const date = payload.valuationDate;
            const companyList:any = await this.computeCompanyDetails(ciqCompanyList.data, date);
            return {
                data:companyList,
                status:true,
                msg:"ciq company list fetched",
                // listCount:totalListCount ? totalListCount.count :  companyList.total
                listCount: ciqCompanyList.total
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

    async computeCompanyDetails(companyList, date){
        try{
            let listedCompanyList = [];

            if(!this.simpleIndustryList.length){
                await this.fetchSimpleIndustry();
            }

            for await (const companyDetails of companyList) {
                for await (const simpleIndustry of this.simpleIndustryList) {
                    if (companyDetails.SIMPLEINDUSTRYID === simpleIndustry.SIMPLEINDUSTRYID) {
                        listedCompanyList.push({ ...companyDetails, SIMPLEINDUSTRYDESCRIPTION: simpleIndustry.SIMPLEINDUSTRYDESCRIPTION });
                    }
                }
            }

            const addMarketCapDetails = await this.elasticSearchMarketCap(listedCompanyList, date);
            const modifiedCompanyList = plainToClass(CiqIndustryListDto, addMarketCapDetails, {excludeExtraneousValues:true});
            return modifiedCompanyList;
        }
        catch(error){
            return{
                error:error,
                status:false,
                msg:"Company list computation failed"
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

    async elasticSearchMarketCap(companyList, date){
        try{
            let companyId = [];
            let companyDetailsList = [];
            companyList.map((elements)=>{
                companyId.push(elements.COMPANYID)
            })
            const criteria = {
                query:{
                    bool :{
                        must:[
                            {
                                terms: {
                                    "COMPANYID": companyId
                                }
                            },{
                                term:{
                                    "PRICINGDATE":`${convertUnixTimestampToDateString(date)}`
                                }
                            }
                        ]
                    }
                }
            }
            const companyMarketData = await this.elasticSearchClientService.search('ciqmarketcapind', criteria);

            for await(const individualCompanyDetails of companyList){
                let marketCapFound = false;
                for await(const individualMarketCapOfCompany of companyMarketData.data){
                    if(individualMarketCapOfCompany.COMPANYID === individualCompanyDetails.COMPANYID){
                        companyDetailsList.push({ ...individualCompanyDetails, ...individualMarketCapOfCompany});
                        marketCapFound = true;
                        break;
                    }
                }
                if (!marketCapFound) {
                    companyDetailsList.push({ ...individualCompanyDetails });
                }
            }
            return companyDetailsList;
        }

        catch(error){
            return {
                error:error,
                status:false,
                msg:"Market Cap search failed"
            }
        }
    }
}