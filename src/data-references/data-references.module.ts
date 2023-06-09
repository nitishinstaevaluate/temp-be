import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    BetaIndustriesController,
    IndustriesRatioController
} from './data-references.controller';

import {
    BetaIndustriesService,
    IndustriesRatioService
} from './data-references.service';

import {
    BetaIndustrySchema,
    IndustriesRatioSchema
} from './schema/data-references.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
          { name: 'betaIndustry', schema: BetaIndustrySchema },
          { name: 'industriesRatio', schema: IndustriesRatioSchema },
        ]),
      ],
      controllers: [
        BetaIndustriesController,
        IndustriesRatioController
      ],
    
      providers: [
        BetaIndustriesService,
        IndustriesRatioService
      ],
      exports: [

      ],
})
export class DataReferencesModule {}
