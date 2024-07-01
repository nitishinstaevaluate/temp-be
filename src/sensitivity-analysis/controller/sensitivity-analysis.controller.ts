import { Controller, Get, Param, UseGuards, Headers, Post, Body, Delete } from '@nestjs/common';
import { SensitivityAnalysisService } from '../service/sensitivity-analysis.service';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';

@Controller('sensitivity-analysis')
export class SensitivityAnalysisController {
    constructor(private readonly sensitivityAnalysisService: SensitivityAnalysisService){}

    @UseGuards(KeyCloakAuthGuard)
    @Get('get-by-id/:id')
    async fetchById(@Param('id') sensitivityId:any,
    @Headers() headers: Headers){
      return await this.sensitivityAnalysisService.fetchById(sensitivityId, headers);
    }

    @UseGuards(KeyCloakAuthGuard)
    @Post('update-selected-valuation-id')
    async updateSelectedValuationId(@Body() payload:any,
    @Headers() headers: Headers){
      return await this.sensitivityAnalysisService.updateSelectedValuationId(payload, headers);
    }

    @UseGuards(KeyCloakAuthGuard)
    @Post('sa-secondary-revaluation')
    async SAsecondaryRevaluation(
    @Body() payload: any,
    @Headers() headers: Headers){
      return await this.sensitivityAnalysisService.SAsecondaryRevaluation(payload, headers);
    }

    @UseGuards(KeyCloakAuthGuard)
    @Post('delete-sa-secondary-revaluation')
    async deleteSAsecondaryRevaluation(
    @Body() payload: any,
    @Headers() headers: Headers){
      return await this.sensitivityAnalysisService.removeSecondaryValuationByReportId(payload.SAid, payload.reportId);
    }
}
