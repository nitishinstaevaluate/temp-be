import { Module } from '@nestjs/common';
import { ElasticSearchService } from './elastic-search-client.service';

@Module({
  providers: [ElasticSearchService],
  exports:[ElasticSearchService]
})
export class ElasticSearchModule {}
