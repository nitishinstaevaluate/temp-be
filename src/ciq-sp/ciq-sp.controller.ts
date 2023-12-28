import { Controller, Get, UseGuards } from '@nestjs/common';
import { CiqSpService } from './ciq-sp.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ciq-sp')
export class CiqSpController {

    constructor(private capitalIqAndSPService: CiqSpService){}
    
  // https://localhost:3000/ciq-sp/industry
  @UseGuards(AuthGuard('jwt'))
  @Get('industry')
  async getSPIndustryList() {
    return this.capitalIqAndSPService.fetchSPIndustryList();
  }

  // https://localhost:3000/ciq-sp/industry-based-company
  @UseGuards(AuthGuard('jwt'))
  @Get('industry-based-company')
  async getSPCompanyBasedIndustry() {
    return this.capitalIqAndSPService.fetchSPCompanyBasedIndustry();
  }
}