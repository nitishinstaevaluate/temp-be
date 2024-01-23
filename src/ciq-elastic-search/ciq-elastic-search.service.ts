import { Injectable } from '@nestjs/common';
import { ElasticSearchService } from 'src/elasticSearch/elastic-search-client.service';
import { RedisService } from 'src/middleware/redisConfig';
import { ciqElasticSearchAggregateService } from './ciq-elastic-search-aggregate.service';

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
            
            const response = await this.elasticSearchService.searchAll('ciqsimpleindustry');
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
}
