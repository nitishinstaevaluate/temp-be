import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValuationProcessController, ValuationsController } from './valuationProcess.controller';
import { ValuationsService } from './valuationProcess.service';
import { ValuationSchema } from './schema/valuation.schema';
import { IndustryModule } from 'src/industry/industry.module';
import { ValuationMethodsService } from './valuation.methods.service';
import { MastersModule } from 'src/masters/masters.module';
import { RelativeValuationService } from './relativeValuation.service';
import { FCFEAndFCFFService } from './fcfeAndFCFF.service';
import { ExcessEarningsService } from './excessEarnings.service';
import { NetAssetValueService } from './netAssetValue.service';
import { utilsService } from 'src/utils/utils.service';
import {LoggerModule} from '../loggerService/logger.module'; 
import { ProcessManagerSchema } from 'src/processStatusManager/schema/process-status-manager.schema';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { DataCheckListSchema } from 'src/utils/schema/dataCheckList.schema';
import { MandateSchema } from 'src/utils/schema/mandate.schema';
import { terminalValueWorkingService } from './terminal-value-working.service';
import { ProcessStatusManagerService } from 'src/processStatusManager/process-status-manager.service';
import { MarketPriceService } from './market-price.service';
import { SensitivityAnalysisService } from 'src/sensitivity-analysis/service/sensitivity-analysis.service';
import { sensitivityAnalysisSchema } from 'src/sensitivity-analysis/schema/sensitivity-analysis.schema';
import { SensitivityAnalysisModule } from 'src/sensitivity-analysis/sensitivity-analysis.module';
import { ExcelArchiveService } from 'src/excel-archive/service/excel-archive.service';
import { ExcelArchiveSchema } from 'src/excel-archive/schema/excel-archive.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'valuation', schema: ValuationSchema }]),
    MongooseModule.forFeature([
      { name: 'processManager', schema: ProcessManagerSchema }, 
      { name: 'dataChecklist', schema: DataCheckListSchema },
      { name: 'mandate', schema: MandateSchema },
      { name: 'sensitivityanalysis', schema: sensitivityAnalysisSchema },
      { name: 'excelArchive', schema: ExcelArchiveSchema },
    ]),
    IndustryModule,
    MastersModule,
    LoggerModule,
    AuthenticationModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    })
  ],
  controllers: [ValuationProcessController,ValuationsController], //ImportController
  providers: [
    ValuationsService,
    FCFEAndFCFFService,
    RelativeValuationService,
    ValuationMethodsService,
    ExcessEarningsService,
    NetAssetValueService,
    utilsService,
    AuthenticationService,
    terminalValueWorkingService,
    ProcessStatusManagerService,
    MarketPriceService,
    SensitivityAnalysisService,
    ExcelArchiveService
  ], //ImportService
  exports: [ValuationsService, ValuationMethodsService,FCFEAndFCFFService, terminalValueWorkingService],
})
export class ValuationProcessModule {}
