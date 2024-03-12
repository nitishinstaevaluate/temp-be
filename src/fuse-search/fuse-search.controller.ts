import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FuseSearchService } from './fuse-search.service';
import { AuthGuard } from '@nestjs/passport';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';

@Controller('fuse-search')
export class FuseSearchController {
    constructor(private readonly fuseSearchService: FuseSearchService){}

    // https://localhost:3000/fuse-search/fuse-search-by-company-name
    // @UseGuards(KeyCloakAuthGuard)
    @Get('fuse-search-by-company-name/:companyName')
    async fuzzySearchByCompanyName(@Param('companyName') companyName:string, @Req() request) {
        return this.fuseSearchService.fuseSearchByCompanyName(request, companyName);
    }
}
