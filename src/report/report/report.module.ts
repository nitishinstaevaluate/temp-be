import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import { ValuationProcessModule } from 'src/valuationProcess/valuationProcess.module';

@Module({
  providers: [ReportService],
  controllers: [ReportController],
  imports:[ValuationProcessModule]
})
export class ReportModule {}