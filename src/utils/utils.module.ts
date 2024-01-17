import { Module } from '@nestjs/common';
import { utilsService } from './utils.service';
import { ValuationProcessModule } from 'src/valuationProcess/valuationProcess.module';
import { UtilController } from './util.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ValuationSchema } from 'src/valuationProcess/schema/valuation.schema';
import { ProcessManagerSchema } from 'src/processStatusManager/schema/process-status-manager.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';

@Module({
  imports: [ValuationProcessModule,
    MongooseModule.forFeature([
      { name: 'valuation', schema: ValuationSchema },
      { name: 'processManager', schema: ProcessManagerSchema }
    ]),
    AuthenticationModule
  ],
  controllers: [UtilController], 
  providers: [utilsService],
  exports: [utilsService],
})
export class UtilsModule {}
