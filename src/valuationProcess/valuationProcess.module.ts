import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValuationController } from './valuationProcess.controller';
import { ValuationsService } from './valuationProcess.service';
import { ValuationSchema } from './schema/valuation.schema';
import { IndustryModule } from 'src/industry/industry.module';
import { ValuationMethodsService } from './valuation.methods.service';
import { MastersModule } from 'src/masters/masters.module';
import { RelativeValuationService } from './relativeValuation.service';
import { FCFEAndFCFFService } from './fcfeAndFCFF.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'valuation', schema: ValuationSchema }]),
    IndustryModule,
    MastersModule,
  ],
  controllers: [ValuationController], //ImportController
  providers: [
    ValuationsService,
    FCFEAndFCFFService,
    RelativeValuationService,
    ValuationMethodsService,
  ], //ImportService
  exports: [ValuationsService, ValuationMethodsService],
})
export class ValuationProcessModule {}
