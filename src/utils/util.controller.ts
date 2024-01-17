import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { utilsService } from './utils.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('util')
export class UtilController {
    constructor(private readonly utilService:utilsService){}

    // https://localhost:3000/util/get-word-list/search?word
    @UseGuards(AuthGuard('jwt'))
    @Get('get-word-list/search')
    async getWordList(@Query('word') word:string) {
        console.log(word,"word")
        return await this.utilService.getWordList(word);
    }
}
