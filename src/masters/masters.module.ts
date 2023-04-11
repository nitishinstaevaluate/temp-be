import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndustriesController,ValuationMethodsController,
  TaxRatesController,DiscountRatesController,
  TerminalGrowthRatesController,COEMethodsController,
  RiskFreeRatesController,ExpMarketReturnsController, 
  MastersController,BetasController,RiskPremiumsController
  ,COPShareCapitalController,CODController,CapitalStructureController } from './masters.controller';

import { IndustriesService,ValuationMethodsService,TaxRatesService,
  DiscountRatesService,TerminalGrowthRatesService,COEMethodsService,
  RiskFreeRatesService,ExpMarketReturnsService,BetaService,RiskPremiumService
  ,COPShareCapitalService,CODService,CapitalStructureService } from './masters.service';

import { IndustrySchema,ValuationMethodSchema,TaxRateSchema,
  DiscountRateSchema,TerminalGrowthRateSchema,COEMethodSchema,
  RiskFreeRateSchema,ExpMarketReturnSchema,BetaSchema,RiskPremiumSchema
  ,COPShareCapitalSchema,CODSchema,CapitalStructureSchema } from './schema/masters.schema';

@Module({
    imports: [MongooseModule.forFeature([
      { name: 'industry',schema: IndustrySchema },
      { name: 'valuationMethod',schema: ValuationMethodSchema },
      { name: 'taxRate',schema: TaxRateSchema },
      { name: 'discountRate',schema: DiscountRateSchema },
      { name: 'terminalGrowthRate',schema: TerminalGrowthRateSchema },
      { name: 'coeMethod',schema: COEMethodSchema },
      { name: 'riskFreeRate',schema: RiskFreeRateSchema },
      { name: 'expMarketReturn',schema: ExpMarketReturnSchema },
      { name: 'beta',schema: BetaSchema },
      { name: 'riskPremium',schema: RiskPremiumSchema },
      { name: 'copShareCapital',schema: COPShareCapitalSchema },
      { name: 'costOfDebt',schema: CODSchema },
      { name: 'capitalStructure',schema: CapitalStructureSchema },
    ])],
  controllers: [IndustriesController,ValuationMethodsController,
    TaxRatesController,DiscountRatesController,TerminalGrowthRatesController,
    COEMethodsController,RiskFreeRatesController,ExpMarketReturnsController,
    MastersController,BetasController,RiskPremiumsController,
    COPShareCapitalController,CODController,CapitalStructureController],

  providers: [IndustriesService,ValuationMethodsService,TaxRatesService,
    DiscountRatesService,TerminalGrowthRatesService,COEMethodsService,
    RiskFreeRatesService,ExpMarketReturnsService,BetaService,RiskPremiumService,
    COPShareCapitalService,CODService,CapitalStructureService],
    exports:[ValuationMethodsService]
})
export class MastersModule {}