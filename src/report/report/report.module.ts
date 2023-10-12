import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import { ValuationProcessModule } from 'src/valuationProcess/valuationProcess.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportSchema } from './schema/report.schema';

@Module({
  providers: [ReportService],
  controllers: [ReportController],
  imports:[ValuationProcessModule,
    MongooseModule.forFeature([{ name: 'report', schema: ReportSchema }]),
  ]
})
export class ReportModule {}