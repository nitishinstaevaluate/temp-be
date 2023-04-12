import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Put,
} from '@nestjs/common';

import {
  CreateIndustryDto,
  CreateValuationMethodDto,
  CreateTaxRateDto,
  CreateDiscountRateDto,
  CreateTerminalGrowthRateDto,
  CreateCOEMethodDto,
  CreateRiskFreeRateDto,
  CreateExpMarketReturnDto,
  CreateBetaDto,
  CreateRiskPremiumDto,
  CreateCOPShareCapitalDto,
  CreateCODDto,
  CreateCapitalStructureDto,
} from './dto/masters.dto';

import {
  IndustriesService,
  ValuationMethodsService,
  TaxRatesService,
  DiscountRatesService,
  TerminalGrowthRatesService,
  COEMethodsService,
  RiskFreeRatesService,
  ExpMarketReturnsService,
  BetaService,
  RiskPremiumService,
  COPShareCapitalService,
  CODService,
  CapitalStructureService,
} from './masters.service';

import {
  Industry,
  ValuationMethod,
  TaxRate,
  DiscountRate,
  TerminalGrowthRate,
  COEMethod,
  RiskFreeRate,
  ExpMarketReturn,
  Beta,
  RiskPremium,
  COPShareCapital,
  COD,
  CapitalStructure,
} from './schema/masters.schema';

//Masters Controller for FrontEnd DropDowns Integration.
@Controller('masters')
export class MastersController {
  constructor(
    private industriesService: IndustriesService,
    private methodService: ValuationMethodsService,
    private taxRateService: TaxRatesService,
    private discountRateService: DiscountRatesService,
    private growthRateService: TerminalGrowthRatesService,
    private coeMethodService: COEMethodsService,
    private riskFreeRateService: RiskFreeRatesService,
    private expMarketReturnService: ExpMarketReturnsService,
    private betaService: BetaService,
    private riskPremiumService: RiskPremiumService,
    private copShareCapitalService: COPShareCapitalService,
    private codService: CODService,
    private capitalStructureService: CapitalStructureService,
  ) {}

  @Get(':fieldName')
  async findByFieldName(@Param('fieldName') fieldName: string): Promise<any> {
    if (fieldName.toLowerCase() === 'all') {
      const dropDowns = {};
      dropDowns['industries'] = await this.industriesService.getIndustries();
      dropDowns['valuationmethods'] =
        await this.methodService.getValuationMethods();
      dropDowns['taxrates'] = await this.taxRateService.getTaxRates();
      dropDowns['discountrates'] =
        await this.discountRateService.getDiscountRates();
      dropDowns['growthrates'] = await this.growthRateService.getGrowthRates();
      dropDowns['coemethods'] = await this.coeMethodService.getCOEMethods();
      dropDowns['riskfreerates'] =
        await this.riskFreeRateService.getRiskFreeRates();
      dropDowns['expmarketreturns'] =
        await this.expMarketReturnService.getExpMarketReturns();
      dropDowns['betas'] = await this.betaService.getBetas();
      dropDowns['riskPremiums'] =
        await this.riskPremiumService.getRiskPremiums();
      dropDowns['copShareCapitals'] =
        await this.copShareCapitalService.getCOPShareCapitals();
      dropDowns['costOfDebts'] = await this.codService.getCOD();
      dropDowns['capitalStructures'] =
        await this.capitalStructureService.getCapitalStructure();

      return dropDowns;
    } else if (fieldName.toLowerCase() === 'industries')
      return await this.industriesService.getIndustries();
    else if (fieldName.toLowerCase() === 'valuationmethods')
      return await this.methodService.getValuationMethods();
    else if (fieldName.toLowerCase() === 'taxrates')
      return await this.taxRateService.getTaxRates();
    else if (fieldName.toLowerCase() === 'discountrates')
      return await this.discountRateService.getDiscountRates();
    else if (fieldName.toLowerCase() === 'growthrates')
      return await this.growthRateService.getGrowthRates();
    else if (fieldName.toLowerCase() === 'coemethods')
      return await this.coeMethodService.getCOEMethods();
    else if (fieldName.toLowerCase() === 'riskfreerates')
      return await this.riskFreeRateService.getRiskFreeRates();
    else if (fieldName.toLowerCase() === 'expmarketreturns')
      return await this.expMarketReturnService.getExpMarketReturns();
    else if (fieldName.toLowerCase() === 'betas')
      return await this.betaService.getBetas();
    else if (fieldName.toLowerCase() === 'riskpremiums')
      return await this.riskPremiumService.getRiskPremiums();
    else if (fieldName.toLowerCase() === 'copsharecapitals')
      return await this.copShareCapitalService.getCOPShareCapitals();
    else if (fieldName.toLowerCase() === 'costofdebts')
      return await this.codService.getCOD();
    else if (fieldName.toLowerCase() === 'capitalstructures')
      return await this.capitalStructureService.getCapitalStructure();
    else return [];
  }
}

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
  async update(
    @Param('id') id: string,
    @Body() industry: Industry,
  ): Promise<Industry> {
    return this.industriesService.updateIndustry(id, industry);
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
  async update(
    @Param('id') id: string,
    @Body() method: ValuationMethod,
  ): Promise<ValuationMethod> {
    return this.methodService.updateValuationMethod(id, method);
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
  async update(
    @Param('id') id: string,
    @Body() taxRate: TaxRate,
  ): Promise<TaxRate> {
    return this.taxRateService.updateTaxRate(id, taxRate);
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
  async update(
    @Param('id') id: string,
    @Body() discountRate: DiscountRate,
  ): Promise<DiscountRate> {
    return this.discountRateService.updateDiscountRate(id, discountRate);
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
  async update(
    @Param('id') id: string,
    @Body() growthRate: TerminalGrowthRate,
  ): Promise<TerminalGrowthRate> {
    return this.growthRateService.updateGrowthRate(id, growthRate);
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
  async update(
    @Param('id') id: string,
    @Body() coeMethod: COEMethod,
  ): Promise<COEMethod> {
    return this.coeMethodService.updateCOEMethod(id, coeMethod);
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
  async update(
    @Param('id') id: string,
    @Body() riskFreeRate: RiskFreeRate,
  ): Promise<RiskFreeRate> {
    return this.riskFreeRateService.updateRiskFreeRate(id, riskFreeRate);
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
    return this.expMarketReturnService.createExpMarketReturn(
      expMarketReturnDto,
    );
  }

  @Get()
  async findAll(): Promise<ExpMarketReturn[]> {
    return this.expMarketReturnService.getExpMarketReturns();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() expMarketReturn: ExpMarketReturn,
  ): Promise<ExpMarketReturn> {
    return this.expMarketReturnService.updateExpMarketReturn(
      id,
      expMarketReturn,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.expMarketReturnService.deleteExpReturn(id);
  }
}

//Betas Controller
@Controller('betas')
export class BetasController {
  constructor(private betaService: BetaService) {}

  @Post()
  async create(@Body() betaDto: CreateBetaDto) {
    return this.betaService.createBeta(betaDto);
  }

  @Get()
  async findAll(): Promise<Beta[]> {
    return this.betaService.getBetas();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() beta: Beta): Promise<Beta> {
    return this.betaService.updateBeta(id, beta);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.betaService.deleteBeta(id);
  }
}

//Risk Premium Controller
@Controller('riskPremiums')
export class RiskPremiumsController {
  constructor(private riskPremimumService: RiskPremiumService) {}

  @Post()
  async create(@Body() riskPremiumDto: CreateRiskPremiumDto) {
    return this.riskPremimumService.createRiskPremium(riskPremiumDto);
  }

  @Get()
  async findAll(): Promise<RiskPremium[]> {
    return this.riskPremimumService.getRiskPremiums();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() riskPremium: RiskPremium,
  ): Promise<RiskPremium> {
    return this.riskPremimumService.updateRiskPremium(id, riskPremium);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.riskPremimumService.deleteRiskPremium(id);
  }
}

//Cost of Preference Share Capital Controller
@Controller('copShareCapitals')
export class COPShareCapitalController {
  constructor(private copShareCapitalService: COPShareCapitalService) {}

  @Post()
  async create(@Body() copShareCapitalDto: CreateCOPShareCapitalDto) {
    return this.copShareCapitalService.createCOPShareCapital(
      copShareCapitalDto,
    );
  }

  @Get()
  async findAll(): Promise<COPShareCapital[]> {
    return this.copShareCapitalService.getCOPShareCapitals();
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() copShareCapital: COPShareCapital,
  ): Promise<COPShareCapital> {
    return this.copShareCapitalService.updateCOPShareCapital(
      id,
      copShareCapital,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.copShareCapitalService.deleteCOPShareCapital(id);
  }
}

//Cost of Debt Controller
@Controller('costOfDebts')
export class CODController {
  constructor(private codService: CODService) {}

  @Post()
  async create(@Body() codDto: CreateCODDto) {
    return this.codService.createCOD(codDto);
  }

  @Get()
  async findAll(): Promise<COD[]> {
    return this.codService.getCOD();
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() cod: COD): Promise<COD> {
    return this.codService.updateCOD(id, cod);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.codService.deleteCOD(id);
  }
}

//Capital Structure Controller
@Controller('capitalStructures')
export class CapitalStructureController {
  constructor(private capitalStructureService: CapitalStructureService) {}

  @Post()
  async create(@Body() capitalStructureDto: CreateCapitalStructureDto) {
    return this.capitalStructureService.createCapitalStructure(
      capitalStructureDto,
    );
  }

  @Get()
  async findAll(): Promise<CapitalStructure[]> {
    return this.capitalStructureService.getCapitalStructure();
  }
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() capitalStructure: CapitalStructure,
  ): Promise<CapitalStructure> {
    return this.capitalStructureService.updateCapitalStructure(
      id,
      capitalStructure,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    return this.capitalStructureService.deleteCapitalStructure(id);
  }
}
