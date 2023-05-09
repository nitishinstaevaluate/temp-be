import { Module } from '@nestjs/common';
import { IndustryService } from './industry.service';

@Module({
  imports: [],
  controllers: [], 
  providers: [IndustryService],
  exports: [IndustryService],
})
export class IndustryModule {}
