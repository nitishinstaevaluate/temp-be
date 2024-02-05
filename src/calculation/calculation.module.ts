import { Module } from '@nestjs/common';
import { CalculationController,WaccController } from './calculation.controller';
import { CalculationService } from './calculation.service';
import { LoggerModule } from 'src/loggerService/logger.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RiskFreeRateSchema } from 'src/masters/schema/masters.schema';

@Module({
  imports:[LoggerModule,
  MongooseModule.forFeature([ { name: 'riskFreeRate', schema: RiskFreeRateSchema }])
],
  controllers: [CalculationController,WaccController],
  providers: [CalculationService],
  exports:[CalculationService]
})
export class CalculationModule {}
