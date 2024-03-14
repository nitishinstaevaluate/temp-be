import { Body, Controller, Get, Param, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { CiqElasticSearchService } from './ciq-elastic-search.service';
import { AuthGuard } from '@nestjs/passport';
import { ciqFetchPriceEquityDto } from './dto/ciq-elastic-search.dto';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';
import { ciqGetFinancialDto } from 'src/ciq-sp/dto/ciq-sp.dto';

@Controller('ciq-elastic-search')
export class CiqElasticSearchController {
    constructor(private readonly ciqElasticSearchService: CiqElasticSearchService){}

    // https://localhost:3000/ciq-elastic-search/ciq-elastic-search-entities
    @UseGuards(KeyCloakAuthGuard)
    @Post('ciq-elastic-search-entities')
    async searchCiqEntities(@Body() payload: any) {
        return this.ciqElasticSearchService.searchEntities(payload)
    }

    // https://localhost:3000/ciq-elastic-search/ciq-elastic-search-company-details
    @UseGuards(KeyCloakAuthGuard)
    @Get('ciq-elastic-search-company-details/:companyId')
    async searchCiqEntityByCompanyId(@Param() companyId : any) {
        return await this.ciqElasticSearchService.searchEntityByCompanyId(companyId)
    }

    // https://localhost:3000/ciq-elastic-search/ciq-elastic-search-price-equity
    @UseGuards(KeyCloakAuthGuard)
    @Post('ciq-elastic-search-price-equity')
    async searchCiqEntityByPriceEquity(@Body(ValidationPipe) companyDetails : ciqFetchPriceEquityDto) {
        return await this.ciqElasticSearchService.searchEntityByPriceEquity(companyDetails)
    }

    // https://localhost:3000/ciq-elastic-search/ciq-elastic-search-all-listed-companies
    // @UseGuards(KeyCloakAuthGuard)
    @Get('ciq-elastic-search-all-listed-companies')
    async searchCiqEntitiesAllListedCompanies() {
        return await this.ciqElasticSearchService.searchEntitiesAllListedCompanies();
    }

    // https://localhost:3000/ciq-elastic-search/calculate-sp-financial-data
    @UseGuards(KeyCloakAuthGuard)
    @Post('ciq-elastic-search-financial-data')
    async searchCiqFinancialData(@Body(ValidationPipe) payload: ciqGetFinancialDto) {
        return this.ciqElasticSearchService.searchEntityByFinancialData(payload)
    }
}
