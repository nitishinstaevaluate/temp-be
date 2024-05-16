import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    BetaIndustriesController,
    HistoricalReturnsController,
    IndustriesRatioController,
    IndianTreasuryYieldController,
    PurposeOfReportController
} from './data-references.controller';

import {
    BetaIndustriesService,
    HistoricalReturnsService,
    IndustriesRatioService,
    IndianTreasuryYieldService,
    PurposeOfReportService
} from './data-references.service';

import {
    // BetaIndustrySchema,
    IndianBetaIndustrySchema,
    IndustriesRatioSchema,
    HistoricalReturnsSchema,
    IndianTreasuryYieldSchema,
    HistoricalBSE500ReturnsSchema,
    PurposeOfReportSchema,
    HistoricalBankNiftyReturnsSchema,
    HistoricalSensex30ReturnsSchema,
    HistoricalNifty50ReturnsSchema,
} from './schema/data-references.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
          // { name: 'betaIndustry', schema: BetaIndustrySchema },
          { name: 'indianBetaIndustry', schema: IndianBetaIndustrySchema },
          { name: 'industriesRatio', schema: IndustriesRatioSchema },
          { name: 'historicalReturns', schema : HistoricalReturnsSchema},
          { name: 'indianTreasuryYield', schema : IndianTreasuryYieldSchema},
          { name: 'historicalBSE500Returns', schema : HistoricalBSE500ReturnsSchema},
          { name: 'historicalBankNiftyReturns', schema : HistoricalBankNiftyReturnsSchema},
          { name: 'historicalSensex30Returns', schema : HistoricalSensex30ReturnsSchema},
          { name: 'historicalNifty50Returns', schema : HistoricalNifty50ReturnsSchema},
          { name: 'purposeOfReport', schema : PurposeOfReportSchema}
        ]),
      ],
      controllers: [
        BetaIndustriesController,
        IndustriesRatioController,
        HistoricalReturnsController,
        IndianTreasuryYieldController,
        PurposeOfReportController
      ],
    
      providers: [
        BetaIndustriesService,
        IndustriesRatioService,
        HistoricalReturnsService,
        IndianTreasuryYieldService,
        PurposeOfReportService
      ],
      exports: [

      ],
})
export class DataReferencesModule {}
