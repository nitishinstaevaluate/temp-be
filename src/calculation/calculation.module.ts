import { Module } from '@nestjs/common';
import { CalculationController,WaccController } from './calculation.controller';
import { CalculationService } from './calculation.service';
import { LoggerModule } from 'src/loggerService/logger.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RiskFreeRateSchema } from 'src/masters/schema/masters.schema';
import { HistoricalReturnsSchema, HistoricalBSE500ReturnsSchema } from 'src/data-references/schema/data-references.schema';
import { HistoricalReturnsService } from 'src/data-references/data-references.service';

@Module({
  imports:[LoggerModule,
  MongooseModule.forFeature([ { name: 'riskFreeRate', schema: RiskFreeRateSchema },
  { name: 'historicalReturns', schema : HistoricalReturnsSchema},
  { name: 'historicalBSE500Returns', schema : HistoricalBSE500ReturnsSchema}])
],
  controllers: [CalculationController,WaccController],
  providers: [CalculationService,HistoricalReturnsService],
  exports:[CalculationService]
})
export class CalculationModule {}
