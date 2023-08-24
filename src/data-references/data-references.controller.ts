import {
    Controller,
    Get,
    Post,
    Body,
    Delete,
    Query,
    Param,
    Put,
    UploadedFile,
    UseInterceptors
  } from '@nestjs/common';

  import {
    BetaIndustry,
    IndustriesRatio,
    HistoricalReturns,
    IndianTreasuryYield
  } from './schema/data-references.schema';


  import {
    BetaIndustriesService,
    IndustriesRatioService,
    HistoricalReturnsService,
    IndianTreasuryYieldService
  } from './data-references.service';

@Controller('data-references')
export class DataReferencesController {}

//Beta Industries Controller
@Controller('betaindustries')
export class BetaIndustriesController {
  constructor(private betaIndustriesService: BetaIndustriesService) { }

  @Get()
  async findAll(
    // @Param('industryId') industryId: string,
  ): Promise<BetaIndustry[]> {
    return this.betaIndustriesService.getBetaIndustries();
  }

  @Get(':industryId')
  async findByID(@Param('industryId') id: string): Promise<BetaIndustry[]> {
    return this.betaIndustriesService.getBetaIndustriesById(id);
  }

}

// Industries Ratio Controller
@Controller('industriesratio')
export class IndustriesRatioController {
  constructor(private industriesRatioService: IndustriesRatioService) { }

  @Get()
  async findAll(
    @Param('industryId') industryId: string,
    // @Query() query: { industryId: string }
  ): Promise<IndustriesRatio[]> {
    return this.industriesRatioService.getIndustriesRatio();
  }

  @Get(':industryId')
  async findByID(@Param('industryId') id: string): Promise<IndustriesRatio[]> {
    return this.industriesRatioService.getIndustriesRatioById(id);
  }


}

// Historical Returns Controller
@Controller('historicalreturns')
export class HistoricalReturnsController {
  constructor(private historicalReturnsService: HistoricalReturnsService) { }

  @Get()
  async findAll(
    // @Param('') industryId: string,
    ): Promise<HistoricalReturns[]> {
    return this.historicalReturnsService.getHistoricalReturns();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<HistoricalReturns[]> {
    return this.historicalReturnsService.getHistoricalReturnsById(id);
  }


}

// Indian Treasury Yield Controller
@Controller('indiantreasuryyields')
export class IndianTreasuryYieldController {
  constructor(private indianTresuryYieldService: IndianTreasuryYieldService) { }

  @Get()
  async findAll(
    // @Param('') industryId: string,
    ): Promise<IndianTreasuryYield[]> {
    return this.indianTresuryYieldService.getIndianTreasuryYield();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<IndianTreasuryYield[]> {
    return this.indianTresuryYieldService.getIndianTreasuryYieldById(id);
  }


}
