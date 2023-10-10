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
    UseInterceptors,
    UseGuards
  } from '@nestjs/common';

  import {
    BetaIndustry,
    IndustriesRatio,
    HistoricalReturns,
    HistoricalBSE500Returns,
    IndianTreasuryYield
  } from './schema/data-references.schema';


  import {
    BetaIndustriesService,
    IndustriesRatioService,
    HistoricalReturnsService,
    IndianTreasuryYieldService
  } from './data-references.service';
import { AuthGuard } from '@nestjs/passport';
  
@Controller('data-references')
export class DataReferencesController {}

//Beta Industries Controller
@Controller('betaindustries')
export class BetaIndustriesController {
  constructor(private betaIndustriesService: BetaIndustriesService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    // @Param('industryId') industryId: string,
  ): Promise<BetaIndustry[]> {
    return this.betaIndustriesService.getBetaIndustries();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':industryId')
  async findByID(@Param('industryId') id: string): Promise<BetaIndustry[]> {
    return this.betaIndustriesService.getBetaIndustriesById(id);
  }

}

// Industries Ratio Controller
@Controller('industriesratio')
export class IndustriesRatioController {
  constructor(private industriesRatioService: IndustriesRatioService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Param('industryId') industryId: string,
    // @Query() query: { industryId: string }
  ): Promise<IndustriesRatio[]> {
    return this.industriesRatioService.getIndustriesRatio();
  }
  @UseGuards(AuthGuard('jwt'))
  @Get(':industryId')
  async findByID(@Param('industryId') id: string): Promise<IndustriesRatio[]> {
    return this.industriesRatioService.getIndustriesRatioById(id);
  }


}

// Historical Returns Controller
@Controller('historicalreturns')

export class HistoricalReturnsController {
  constructor(private historicalReturnsService: HistoricalReturnsService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    // @Param('') industryId: string,
    ): Promise<HistoricalReturns[]> {
    return this.historicalReturnsService.getHistoricalReturns();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('bse500')
  async find(
    @Query('baseYrs') baseYrs: string,
    @Query('asOnDate') asOnDate: string,
  ): Promise<any> {
      return this.historicalReturnsService.getBSE(parseInt(baseYrs),parseInt(asOnDate));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findById(@Param('id') id: string): Promise<HistoricalReturns[]> {
    return this.historicalReturnsService.getHistoricalReturnsById(id);
  }

  


}

// Indian Treasury Yield Controller
@Controller('indiantreasuryyields')
export class IndianTreasuryYieldController {
  constructor(private indianTresuryYieldService: IndianTreasuryYieldService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    // @Param('') industryId: string,
    ): Promise<IndianTreasuryYield[]> {
    return this.indianTresuryYieldService.getIndianTreasuryYield();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findById(@Param('id') id: string): Promise<IndianTreasuryYield[]> {
    return this.indianTresuryYieldService.getIndianTreasuryYieldById(id);
  }


}
