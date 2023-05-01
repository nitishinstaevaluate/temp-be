import { Module } from '@nestjs/common';
import { ExportResultsController } from './exportResults.controller';
import { ValuationProcessModule } from 'src/valuationProcess/valuationProcess.module';
import { LoggerModule } from 'src/loggerService/logger.module';
import { MastersModule } from 'src/masters/masters.module';
@Module({
  imports: [ValuationProcessModule,LoggerModule,MastersModule],
  controllers: [ExportResultsController], //ImportController
  providers: [], //ImportService
})
export class ExportResultsModule {}
