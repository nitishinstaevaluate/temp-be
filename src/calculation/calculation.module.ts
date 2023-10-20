import { Module } from '@nestjs/common';
import { CalculationController,WaccController } from './calculation.controller';
import { CalculationService } from './calculation.service';
import { LoggerModule } from 'src/loggerService/logger.module';

@Module({
  imports:[LoggerModule],
  controllers: [CalculationController,WaccController],
  providers: [CalculationService],
  exports:[CalculationService]
})
export class CalculationModule {}
