import { Module } from '@nestjs/common';
import { ValuationController } from './valuationProcess.controller';

@Module({
    imports: [],
    controllers: [ValuationController], //ImportController
    providers: [], //ImportService
  })
  export class ValuationProcessModule {}