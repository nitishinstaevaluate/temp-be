import { Module } from '@nestjs/common';
import { utilsService } from './utils.service';
import { ValuationProcessModule } from 'src/valuationProcess/valuationProcess.module';

@Module({
  imports: [ValuationProcessModule],
  controllers: [], 
  providers: [utilsService],
  exports: [utilsService],
})
export class UtilsModule {}
