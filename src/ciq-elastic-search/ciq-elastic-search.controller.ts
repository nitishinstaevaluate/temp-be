import { Body, Controller, Get, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { CiqElasticSearchService } from './ciq-elastic-search.service';
import { AuthGuard } from '@nestjs/passport';
import { ciqGetFinancialDto } from 'src/ciq-sp/dto/ciq-sp.dto';

@Controller('ciq-elastic-search')
export class CiqElasticSearchController {
    constructor(private readonly ciqElasticSearchService: CiqElasticSearchService){}

    // https://localhost:3000/ciq-elastic-search/ciq-elastic-search-entities
    @UseGuards(AuthGuard('jwt'))
    @Post('ciq-elastic-search-entities')
    async searchCiqEntities(@Body() payload: any) {
        return this.ciqElasticSearchService.searchEntities(payload)
    }
}
