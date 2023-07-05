import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    BetaIndustriesController,
    HistoricalReturnsController,
    IndustriesRatioController,
    IndianTreasuryYieldController
} from './data-references.controller';

import {
    BetaIndustriesService,
    HistoricalReturnsService,
    IndustriesRatioService,
    IndianTreasuryYieldService
} from './data-references.service';

import {
    BetaIndustrySchema,
    IndustriesRatioSchema,
    HistoricalReturnsSchema,
    IndianTreasuryYieldSchema
} from './schema/data-references.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
          { name: 'betaIndustry', schema: BetaIndustrySchema },
          { name: 'industriesRatio', schema: IndustriesRatioSchema },
          { name: 'historicalReturns', schema : HistoricalReturnsSchema},
          { name: 'indianTreasuryYield', schema : IndianTreasuryYieldSchema}
        ]),
      ],
      controllers: [
        BetaIndustriesController,
        IndustriesRatioController,
        HistoricalReturnsController,
        IndianTreasuryYieldController
      ],
    
      providers: [
        BetaIndustriesService,
        IndustriesRatioService,
        HistoricalReturnsService,
        IndianTreasuryYieldService
      ],
      exports: [

      ],
})
export class DataReferencesModule {}
