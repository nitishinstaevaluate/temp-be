import { Controller, Get, Post, Body, Delete, Param, Put } from '@nestjs/common';

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
  @Put(':id')
  async update(@Param('id') id: string, @Body() industry:Industry): Promise<Industry> {
    return this.industriesService.updateIndustry(id,industry);
  }
  
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
      return this.industriesService.deleteIndustry(id);
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
  @Put(':id')
  async update(@Param('id') id: string, @Body() method:ValuationMethod): Promise<ValuationMethod> {
    return this.methodService.updateValuationMethod(id,method);
  }
  
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
      return this.methodService.deleteValuationMethod(id);
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
  @Put(':id')
  async update(@Param('id') id: string, @Body() taxRate:TaxRate): Promise<TaxRate> {
    return this.taxRateService.updateTaxRate(id,taxRate);
  }
  
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
      return this.taxRateService.deleteTaxRate(id);
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
  @Put(':id')
  async update(@Param('id') id: string, @Body() discountRate:DiscountRate): Promise<DiscountRate> {
    return this.discountRateService.updateDiscountRate(id,discountRate);
  }
  
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
      return this.discountRateService.deleteDiscountRate(id);
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
  @Put(':id')
  async update(@Param('id') id: string, @Body() growthRate:TerminalGrowthRate): Promise<TerminalGrowthRate> {
    return this.growthRateService.updateGrowthRate(id,growthRate);
  }
  
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
      return this.growthRateService.deleteGrowthRate(id);
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
  @Put(':id')
  async update(@Param('id') id: string, @Body() coeMethod:COEMethod): Promise<COEMethod> {
    return this.coeMethodService.updateCOEMethod(id,coeMethod);
  }
  
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
      return this.coeMethodService.deleteCOEMethod(id);
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
  @Put(':id')
  async update(@Param('id') id: string, @Body() riskFreeRate:RiskFreeRate): Promise<RiskFreeRate> {
    return this.riskFreeRateService.updateRiskFreeRate(id,riskFreeRate);
  }
  
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<any> {
      return this.riskFreeRateService.deleteRiskFreeRate(id);
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

  @Put(':id')
async update(@Param('id') id: string, @Body() expMarketReturn:ExpMarketReturn): Promise<ExpMarketReturn> {
  return this.expMarketReturnService.updateExpMarketReturn(id,expMarketReturn);
}

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.expMarketReturnService.deleteExpReturn(id);
  }
}