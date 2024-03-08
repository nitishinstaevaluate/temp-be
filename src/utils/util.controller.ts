import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards, ValidationPipe, Request, ParseIntPipe } from '@nestjs/common';
import { utilsService } from './utils.service';
import { AuthGuard } from '@nestjs/passport';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';

@Controller('util')
export class UtilController {
    constructor(private readonly utilService:utilsService){}

    // https://localhost:3000/util/get-word-list/search?word
    @UseGuards(KeyCloakAuthGuard)
    @Get('get-word-list/search')
    async getWordList(@Query('word') word:string) {
        return await this.utilService.getWordList(word);
    }

    // https://localhost:3000/util/generate-link-id
    @UseGuards(KeyCloakAuthGuard)
    @Post('generate-link-id')
    async generateLinkUniqueLinkId(@Req() request,@Body() emailPayload: any) {
        return await this.utilService.generateUniqueLink(request, emailPayload);
    }

    // https://localhost:3000/util/validate-link-id
    // @UseGuards(KeyCloakAuthGuard)
    @Get('validate-link-id/:linkId/:queryCheckList')
    async validateLinkId(@Param() checklistDetails:any) {
        return await this.utilService.isValidUniqueLink(checklistDetails);
    }
    
    // https://localhost:3000/util/update-mandate-checklist
    // @UseGuards(KeyCloakAuthGuard)
    @Put('update-mandate-checklist/:linkId')
    async updateMandateChecklist(@Param() linkId:any, @Body() mandatePayload: any) {
        return await this.utilService.updateMandateChecklist(mandatePayload, linkId);
    }

    // https://localhost:3000/util/update-data-checklist
    // @UseGuards(KeyCloakAuthGuard)
    @Put('update-data-checklist/:linkId')
    async updateDataChecklist(@Param() linkId:any, @Body(ValidationPipe) dataChecklistPayload: any) {
        return await this.utilService.updateDataChecklist(dataChecklistPayload, linkId);
    }

    // // https://localhost:3000/util/get-email-list
    // @UseGuards(KeyCloakAuthGuard)
    // @Get('get-email-list')
    // async fetchAllDataCheklistEmails() {
    //     return await this.utilService.fetchDataChecklistAllEmails();
    // }

    // https://localhost:3000/util/resend-data-checklist
    @UseGuards(KeyCloakAuthGuard)
    @Get('resend-data-checklist/:linkId')
    async resendDataChecklist(@Param() linkId:any) {
        return await this.utilService.resendDatachecklist(linkId);
    }

    // https://localhost:3000/util/get-data-checklist
    @UseGuards(KeyCloakAuthGuard)
    @Get('get-data-checklist/:linkId')
    async getDataChecklist(@Param() linkId:any) {
        return await this.utilService.fetchDataChecklistByLinkId(linkId);
    }

    @UseGuards(KeyCloakAuthGuard)
    @Get('get-all-datachecklist/paginate')
    async getPaginatedValuations(
      @Request() req,
      @Query('page', ParseIntPipe) page: number = 1,
      @Query('pageSize', ParseIntPipe) pageSize: number = 10
    ) :Promise<any>{
      return this.utilService.paginateDatachecklist(page,pageSize, req);
    }
}
