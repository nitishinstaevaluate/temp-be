import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import { ValuationProcessModule } from 'src/valuationProcess/valuationProcess.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportSchema } from './schema/report.schema';
import { CalculationService } from 'src/calculation/calculation.service';
import { LoggerModule } from 'src/loggerService/logger.module';
import { CustomLogger } from 'src/loggerService/logger.service';

@Module({
  providers: [ReportService,CalculationService,CustomLogger],
  controllers: [ReportController],
  imports:[ValuationProcessModule,LoggerModule,
    MongooseModule.forFeature([{ name: 'report', schema: ReportSchema }]),
  ]
})
export class ReportModule {}