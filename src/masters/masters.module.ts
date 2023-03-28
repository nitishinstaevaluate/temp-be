import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndustriesController,ValuationMethodsController,TaxRatesController,DiscountRatesController } from './masters.controller';
import { IndustriesService,ValuationMethodsService,TaxRatesService,DiscountRatesService } from './masters.service';
import { IndustrySchema,ValuationMethodSchema,TaxRateSchema,DiscountRateSchema } from './schema/masters.schema';

@Module({
    imports: [MongooseModule.forFeature([
      { name: 'industry',schema: IndustrySchema },
      { name: 'valuationMethod',schema: ValuationMethodSchema },
      { name: 'taxRate',schema: TaxRateSchema },
      { name: 'discountRate',schema: DiscountRateSchema }
    ])],
  controllers: [IndustriesController,ValuationMethodsController,TaxRatesController,DiscountRatesController],
  providers: [IndustriesService,ValuationMethodsService,TaxRatesService,DiscountRatesService],
})
export class MastersModule {}