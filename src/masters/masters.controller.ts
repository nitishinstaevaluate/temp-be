import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateIndustryDto,CreateValuationMethodDto,CreateTaxRateDto,CreateDiscountRateDto,CreateTerminalGrowthRateDto } from './dto/masters.dto';
import { IndustriesService,ValuationMethodsService,TaxRatesService, DiscountRatesService,TerminalGrowthRatesService } from './masters.service';
import { Industry,ValuationMethod,TaxRate,DiscountRate,TerminalGrowthRate } from './schema/masters.schema';

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
