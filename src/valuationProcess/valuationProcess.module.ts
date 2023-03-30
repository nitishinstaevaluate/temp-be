import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValuationController } from './valuationProcess.controller';
import { ValuationsService } from './valuationProcess.service';
import { ValuationSchema } from './schema/valuation.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'valuation',schema: ValuationSchema }])],
    controllers: [ValuationController], //ImportController
    providers: [ValuationsService], //ImportService
    exports:[ValuationsService]
  })
  export class ValuationProcessModule {}