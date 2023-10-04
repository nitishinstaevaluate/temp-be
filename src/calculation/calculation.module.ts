import { Module } from '@nestjs/common';
import { CalculationController,WaccController } from './calculation.controller';
import { CalculationService } from './calculation.service';

@Module({
  controllers: [CalculationController,WaccController],
  providers: [CalculationService]
})
export class CalculationModule {}
