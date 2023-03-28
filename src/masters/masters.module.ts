import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndustriesController,ValuationMethodsController,TaxRatesController } from './masters.controller';
import { IndustriesService,ValuationMethodsService,TaxRatesService } from './masters.service';
import { IndustrySchema,ValuationMethodSchema,TaxRateSchema } from './schema/masters.schema';

@Module({
    imports: [MongooseModule.forFeature([
      { name: 'industry',schema: IndustrySchema },
      { name: 'valuationMethod',schema: ValuationMethodSchema },
      { name: 'taxRate',schema: TaxRateSchema }
    ])],
  controllers: [IndustriesController,ValuationMethodsController,TaxRatesController],
  providers: [IndustriesService,ValuationMethodsService,TaxRatesService],
})
export class MastersModule {}