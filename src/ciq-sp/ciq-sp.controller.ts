import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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
}