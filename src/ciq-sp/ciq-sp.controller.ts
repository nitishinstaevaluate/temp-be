import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CiqSpService } from './ciq-sp.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ciq-sp')
export class CiqSpController {

    constructor(private capitalIqAndSPService: CiqSpService){}
    
  // https://localhost:3000/ciq-sp/hierarchy-based-industry-list
  @UseGuards(AuthGuard('jwt'))
  @Get('hierarchy-based-industry-list')
  async getSPHierarchyBasedIndustry() {
    return this.capitalIqAndSPService.fetchSPHierarchyBasedIndustry();
  }

  // https://localhost:3000/ciq-sp/sp-industry-list
  @UseGuards(AuthGuard('jwt'))
  @Get('sp-industry-list')
  async getAllSPIndustry() {
    return this.capitalIqAndSPService.fetchAllSPIndustry();
  }

  // https://localhost:3000/ciq-sp/sp-industry-list/search?
  @UseGuards(AuthGuard('jwt'))
  @Get('sp-industry-list/search')
  async getSPIndustryListByName(
    @Query('industry') industry: string,
    @Query('location') location: string,
  ) {
    return this.capitalIqAndSPService.fetchSPIndustryListByName(industry,location);
  }

  // https://localhost:3000/ciq-sp/hierarchy-based-level-four-industry/:descriptor
  @UseGuards(AuthGuard('jwt'))
  @Get('hierarchy-based-level-four-industry/:descriptor')
  async getSPLevelFourIndustryBasedList(
    @Param('descriptor') descriptor: string,
  ) {
    return this.capitalIqAndSPService.fetchSPLevelFourIndustryBasedList(descriptor);
  }

  // https://localhost:3000/ciq-sp/sp-level-four-industry-list
  @UseGuards(AuthGuard('jwt'))
  @Post('sp-level-four-industry-list')
  async getSPIndustryListByLevelFourIndustries(@Body() levelFourIndustry:any) {
    return this.capitalIqAndSPService.fetchSPIndustryListByLevelFourIndustries(levelFourIndustry);
  }

  // https://localhost:3000/ciq-sp/sp-company-status-type
  @UseGuards(AuthGuard('jwt'))
  @Get('sp-company-status-type')
  async getSPCompanyStatusType() {
    return this.capitalIqAndSPService.fetchSPCompanyStatusType();
  }

  // https://localhost:3000/ciq-sp/sp-company-type
  @UseGuards(AuthGuard('jwt'))
  @Get('sp-company-type')
  async getSPCompanyType() {
    return this.capitalIqAndSPService.fetchSPCompanyType();
  }

  // https://localhost:3000/ciq-sp/calculate-sp-beta-aggregate
  @UseGuards(AuthGuard('jwt'))
  @Post('calculate-sp-beta-aggregate')
  async calculateSpBetaAggregate(@Body() payload: any) {
    return this.capitalIqAndSPService.calculateBetaAggregate(payload)
  }

  // https://localhost:3000/ciq-sp/calculate-sp-companies-mean-median
  @UseGuards(AuthGuard('jwt'))
  @Post('calculate-sp-companies-mean-median')
  async calculateSPCompaniesMeanMedianRatio(@Body() payload: any) {
    return this.capitalIqAndSPService.calculateCompaniesMeanMedianRatio(payload)
  }
}