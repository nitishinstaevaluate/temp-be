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
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'valuation', schema: ValuationSchema }]),
    MongooseModule.forFeature([{ name: 'processManager', schema: ProcessManagerSchema }]),
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
    AuthenticationService
  ], //ImportService
  exports: [ValuationsService, ValuationMethodsService,FCFEAndFCFFService],
})
export class ValuationProcessModule {}
