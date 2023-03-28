import { Controller, Get, Post, Body } from '@nestjs/common';

import { CreateIndustryDto,CreateValuationMethodDto,
  CreateTaxRateDto,CreateDiscountRateDto,
  CreateTerminalGrowthRateDto,CreateCOEMethodDto,
  CreateRiskFreeRateDto,CreateExpMarketReturnDto } from './dto/masters.dto';

import { IndustriesService,ValuationMethodsService,TaxRatesService,
   DiscountRatesService,TerminalGrowthRatesService,COEMethodsService,
   RiskFreeRatesService,ExpMarketReturnsService } from './masters.service';

import { Industry,ValuationMethod,TaxRate,DiscountRate,
  TerminalGrowthRate,COEMethod,
  RiskFreeRate,ExpMarketReturn } from './schema/masters.schema';

//Industries Controller
@Controller('industries')
export class IndustriesController {
  constructor(private industriesService: IndustriesService) {}

  @Post()
  async create(@Body() createIndustryDto: CreateIndustryDto) {
    return this.industriesService.createIndustry(createIndustryDto);
  }

  @Get()
  async findAll(): Promise<Industry[]> {
    return this.industriesService.getIndustries();
  }
}

//ValuationMethods Controller
@Controller('valuationMethods')
export class ValuationMethodsController {
  constructor(private methodService: ValuationMethodsService) {}

  @Post()
  async create(@Body() methodDto: CreateValuationMethodDto) {
    return this.methodService.createValuationMethod(methodDto);
  }

  @Get()
  async findAll(): Promise<ValuationMethod[]> {
    return this.methodService.getValuationMethods();
  }
}

//TaxRates Controller
@Controller('taxRates')
export class TaxRatesController {
  constructor(private taxRateService: TaxRatesService) {}

  @Post()
  async create(@Body() taxRateDto: CreateTaxRateDto) {
    return this.taxRateService.createTaxRate(taxRateDto);
  }

  @Get()
  async findAll(): Promise<TaxRate[]> {
    return this.taxRateService.getTaxRates();
  }
}

//DiscountRates Controller
@Controller('discountRates')
export class DiscountRatesController {
  constructor(private discountRateService: DiscountRatesService) {}

  @Post()
  async create(@Body() discountRateDto: CreateDiscountRateDto) {
    return this.discountRateService.createDiscountRate(discountRateDto);
  }

  @Get()
  async findAll(): Promise<DiscountRate[]> {
    return this.discountRateService.getDiscountRates();
  }
}

//TerminalGrowthRates Controller
@Controller('terminalGrowthRates')
export class TerminalGrowthRatesController {
  constructor(private growthRateService: TerminalGrowthRatesService) {}

  @Post()
  async create(@Body() growthRateDto: CreateTerminalGrowthRateDto) {
    return this.growthRateService.createGrowthRate(growthRateDto);
  }

  @Get()
  async findAll(): Promise<TerminalGrowthRate[]> {
    return this.growthRateService.getGrowthRates();
  }
}


//COEMethods Controller
@Controller('coeMethods')
export class COEMethodsController {
  constructor(private coeMethodService: COEMethodsService) {}

  @Post()
  async create(@Body() coeMethodDto: CreateCOEMethodDto) {
    return this.coeMethodService.createCOEMethod(coeMethodDto);
  }

  @Get()
  async findAll(): Promise<COEMethod[]> {
    return this.coeMethodService.getCOEMethods();
  }
}

//RiskFreeRates Controller
@Controller('riskFreeRates')
export class RiskFreeRatesController {
  constructor(private riskFreeRateService: RiskFreeRatesService) {}

  @Post()
  async create(@Body() riskFreeRateDto: CreateRiskFreeRateDto) {
    return this.riskFreeRateService.createRiskFreeRate(riskFreeRateDto);
  }

  @Get()
  async findAll(): Promise<RiskFreeRate[]> {
    return this.riskFreeRateService.getRiskFreeRates();
  }
}

//ExpMarketReturns Controller
@Controller('expMarketReturns')
export class ExpMarketReturnsController {
  constructor(private expMarketReturnService: ExpMarketReturnsService) {}

  @Post()
  async create(@Body() expMarketReturnDto: CreateExpMarketReturnDto) {
    return this.expMarketReturnService.createExpMarketReturn(expMarketReturnDto);
  }

  @Get()
  async findAll(): Promise<ExpMarketReturn[]> {
    return this.expMarketReturnService.getExpMarketReturns();
  }
}