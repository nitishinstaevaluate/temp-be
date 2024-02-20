import { Injectable } from '@nestjs/common';
import { ElasticSearchService } from 'src/elasticSearch/elastic-search-client.service';
import { RedisService } from 'src/middleware/redisConfig';
import { ciqElasticSearchAggregateService } from './ciq-elastic-search-aggregate.service';
import { elasticSearchIndex } from 'src/library/enums/elastic-search-index.enum';

@Injectable()
export class CiqElasticSearchService {
    constructor(private readonly elasticSearchService: ElasticSearchService,
        private readonly ciqElasticSearchAggregateService:ciqElasticSearchAggregateService){}

    async searchEntities(data){
        try{
            const aggregateCompanyList = await this.ciqElasticSearchAggregateService.elasticSearchAggregate(data);
            return {
                data:aggregateCompanyList.data,
                status:true,
                msg:"elastic search success",
                total: aggregateCompanyList.listCount,
                pageStart: data?.pageStart ?? 0,
                pageSize: data.size ?? 10 
            }
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"elastic search based failed"
            }
        }
    }

    async searchAllEntities(){
        try{
            // const index = payload.index;
            // const criteria = payload.criteria;
            
            const response = await this.elasticSearchService.searchAll(elasticSearchIndex.ciqsimpleindustry);
            console.log(response," response")
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"elastic search based failed"
            }
        }
    }

    async searchEntityByCompanyId(companyId){
        try{
            const companyDetails = await this.ciqElasticSearchAggregateService.findByCompanyId(companyId);
            return {
                data: companyDetails,
                status:true,
                msg:"elastic search based on company id fetched successfully"
            };
        }
        catch(error){
            return{
                error:error,
                status:false,
                msg:"elastic search based on company id not found"
            }
        }
    }

    async searchEntityByPriceEquity(data){
        try{
            const priceEquityDetail = await this.ciqElasticSearchAggregateService.elasticSearchPriceEquityAggregate(data);
            return {
                data: priceEquityDetail.data,
                total:priceEquityDetail.total,
                status:true,
                msg:"Ciq price equity fetched successfully"    
            }

        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"Ciq price equity search failed"
            }
        }
    }

    async searchEntitiesAllListedCompanies(){
        try{
            const listedCompaniesList = await this.ciqElasticSearchAggregateService.fetchAllListedCompanies();

            return {
                data:listedCompaniesList,
                status:true,
                msg:"listed companies list"
            }
        
        }
        catch(error){
            return{
                error:error,
                status:false,
                msg:"Listed companies search failed"
            }
        }
    }
}
