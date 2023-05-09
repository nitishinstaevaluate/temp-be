import { Module } from '@nestjs/common';
import { ExportResultsController } from './exportResults.controller';
import { ValuationProcessModule } from 'src/valuationProcess/valuationProcess.module';
import { LoggerModule } from 'src/loggerService/logger.module';
import { MastersModule } from 'src/masters/masters.module';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [ValuationProcessModule,LoggerModule,MastersModule,UsersModule],
  controllers: [ExportResultsController],
  providers: [],
})
export class ExportResultsModule {}
