import { Module } from '@nestjs/common';
import { ExportResultsController } from './exportResults.controller';
import { ValuationProcessModule } from 'src/valuationProcess/valuationProcess.module';
@Module({
    imports: [ValuationProcessModule],
    controllers: [ExportResultsController], //ImportController
    providers: [], //ImportService
  })
  export class ExportResultsModule {}