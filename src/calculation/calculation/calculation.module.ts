import { Module } from '@nestjs/common';
import { CalculationController } from './calculation.controller';
import { CalculationService } from './calculation.service';

@Module({
  controllers: [CalculationController],
  providers: [CalculationService]
})
export class CalculationModule {}
