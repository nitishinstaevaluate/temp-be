import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    BetaIndustriesController,
} from './data-references.controller';

import {
    BetaIndustriesService,
} from './data-references.service';

import {
    BetaIndustrySchema,
} from './schema/data-references.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
          { name: 'betaIndustry', schema: BetaIndustrySchema },
        ]),
      ],
      controllers: [
        BetaIndustriesController,
      ],
    
      providers: [
        BetaIndustriesService,
      ],
      exports: [
        
      ],
})
export class DataReferencesModule {}
