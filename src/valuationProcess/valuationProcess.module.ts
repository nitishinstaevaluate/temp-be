import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValuationController } from './valuationProcess.controller';
import { ValuationsService } from './valuationProcess.service';
import { ValuationSchema } from './schema/valuation.schema';
import { IndustryModule } from 'src/industry/industry.module';
import { ValuationMethodsService } from './valuation.methods.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'valuation', schema: ValuationSchema }]),
    IndustryModule,
  ],
  controllers: [ValuationController], //ImportController
  providers: [ValuationsService, ValuationMethodsService], //ImportService
  exports: [ValuationsService, ValuationMethodsService],
})
export class ValuationProcessModule {}
