import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndustriesController,ValuationMethodsController,
  TaxRatesController,DiscountRatesController,TerminalGrowthRatesController } from './masters.controller';
import { IndustriesService,ValuationMethodsService,TaxRatesService,
  DiscountRatesService,TerminalGrowthRatesService } from './masters.service';
import { IndustrySchema,ValuationMethodSchema,TaxRateSchema,DiscountRateSchema,TerminalGrowthRateSchema } from './schema/masters.schema';

@Module({
    imports: [MongooseModule.forFeature([
      { name: 'industry',schema: IndustrySchema },
      { name: 'valuationMethod',schema: ValuationMethodSchema },
      { name: 'taxRate',schema: TaxRateSchema },
      { name: 'discountRate',schema: DiscountRateSchema },
      { name: 'terminalGrowthRate',schema: TerminalGrowthRateSchema }
    ])],
  controllers: [IndustriesController,ValuationMethodsController
    ,TaxRatesController,DiscountRatesController,TerminalGrowthRatesController],
  providers: [IndustriesService,ValuationMethodsService,TaxRatesService,
    DiscountRatesService,TerminalGrowthRatesService],
})
export class MastersModule {}