import {
    Body,
      Controller,
      Get,
      Param,
      Query,
      Put,
      UseGuards,
      Request,
      ParseIntPipe
    } from '@nestjs/common';
import { ProcessStatusManagerService } from './process-status-manager.service';
import { AuthGuard } from '@nestjs/passport';
import { ProcessStatusManagerDTO } from './dto/process-status-manager.dto';
import { utilsService } from 'src/utils/utils.service';

@Controller('process-status-manager')
export class ProcessStatusManagerController {
    constructor(private processStatusManagerService:ProcessStatusManagerService,
      private readonly utilsService:utilsService){}

    @UseGuards(AuthGuard('jwt'))
    @Put('instantiateProcess')
    async upsertProcessState(
        @Request() req,
        @Body() process: ProcessStatusManagerDTO,
        @Query('processId') processId?: string
        ) {
      return await this.processStatusManagerService.upsertProcess(req,process,processId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('retrieveProcess/:processId')
    async fetchProcessState(
        @Param('processId') processId?: string
        ) {
      return await this.processStatusManagerService.fetchProcess(processId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('paginate/:ids')
    async getPaginatedValuations(
      @Param('ids') ids: string,
      @Query('page', ParseIntPipe) page: number = 1,
      @Query('pageSize', ParseIntPipe) pageSize: number = 10,
    ) :Promise<any>{
      return this.utilsService.paginateValuationByUserId(ids,page,pageSize);
    }
}
