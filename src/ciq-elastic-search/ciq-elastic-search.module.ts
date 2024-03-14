import { Module } from '@nestjs/common';
import { CiqElasticSearchService } from './ciq-elastic-search.service';
import { CiqElasticSearchController } from './ciq-elastic-search.controller';
import { ElasticSearchService } from 'src/elasticSearch/elastic-search-client.service';
import { RedisService } from 'src/middleware/redisConfig';
import { ciqElasticSearchAggregateService } from './ciq-elastic-search-aggregate.service';
import { ciqElasticCompanyListSearchService } from './ciq-elastic-company-list-search.service';
import { ciqElasticPriceEquityService } from './ciq-elastic-price-equity.service';
import { ciqElasticFinancialSegmentService } from './ciq-elastic-financial-segment.service';

@Module({
  providers: [CiqElasticSearchService, ElasticSearchService, RedisService, ciqElasticSearchAggregateService, ciqElasticCompanyListSearchService, ciqElasticPriceEquityService, ciqElasticFinancialSegmentService],
  controllers: [CiqElasticSearchController]
})
export class CiqElasticSearchModule {}
