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
import { ElevenUaModule } from 'src/elevenUA/eleven-ua.module';
import { ElevenUaService } from 'src/elevenUA/eleven-ua.service';
import { ElevenUaSchema } from 'src/elevenUA/schema/eleven-ua.schema';
import { ExcelSheetService } from 'src/excelFileServices/uploadExcel.service';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ProcessStatusManagerService } from 'src/processStatusManager/process-status-manager.service';
import { ProcessManagerSchema } from 'src/processStatusManager/schema/process-status-manager.schema';
import { ValuationSchema } from 'src/valuationProcess/schema/valuation.schema';
import { utilsService } from 'src/utils/utils.service';
import { HistoricalReturnsService } from 'src/data-references/data-references.service';
import { HistoricalBSE500ReturnsSchema, HistoricalReturnsSchema } from 'src/data-references/schema/data-references.schema';

@Module({
  providers: [ReportService,CalculationService,CustomLogger,ElevenUaService,ExcelSheetService,AuthenticationService, ProcessStatusManagerService, utilsService,HistoricalReturnsService],
  controllers: [ReportController],
  imports:[ValuationProcessModule,LoggerModule,
    MongooseModule.forFeature(
      [
        { name: 'report', schema: ReportSchema },
        { name:'ruleelevenua',schema:ElevenUaSchema },
        { name: 'processManager', schema: ProcessManagerSchema },
        { name: 'valuation', schema: ValuationSchema },
        { name: 'historicalReturns', schema : HistoricalReturnsSchema},
          { name: 'historicalBSE500Returns', schema : HistoricalBSE500ReturnsSchema},
      ]
    ),
    UsersModule,
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '24h' },
  }),
  ElevenUaModule
  ]
})
export class ReportModule {}