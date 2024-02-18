import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { utilsService } from './utils.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('util')
export class UtilController {
    constructor(private readonly utilService:utilsService){}

    // https://localhost:3000/util/get-word-list/search?word
    @UseGuards(AuthGuard('jwt'))
    @Get('get-word-list/search')
    async getWordList(@Query('word') word:string) {
        return await this.utilService.getWordList(word);
    }

    // https://localhost:3000/util/generate-link-id
    // @UseGuards(AuthGuard('jwt'))
    @Get('generate-link-id')
    async generateLinkUniqueLinkId() {
        return await this.utilService.generateUniqueLink();
    }

    // https://localhost:3000/util/validate-link-id
    // @UseGuards(AuthGuard('jwt'))
    @Get('validate-link-id/:linkId')
    async validateLinkId(@Param() linkId:any) {
        return await this.utilService.isValidUniqueLink(linkId);
    }
}
