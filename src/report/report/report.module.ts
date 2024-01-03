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

@Module({
  providers: [ReportService,CalculationService,CustomLogger,ElevenUaService,ExcelSheetService,AuthenticationService],
  controllers: [ReportController],
  imports:[ValuationProcessModule,LoggerModule,
    MongooseModule.forFeature(
      [
        { name: 'report', schema: ReportSchema },
        { name:'ruleelevenua',schema:ElevenUaSchema },
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