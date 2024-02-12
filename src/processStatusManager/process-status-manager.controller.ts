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
    @Get('retrieveStage/:processId')
    async fetchActiveStage(
        @Param('processId') processId?: string
        ) {
      return await this.processStatusManagerService.fetchActiveStage(processId);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Put('updateStage')
    async updateActiveStage(
      @Body() processStage:any
        ) {
      return await this.processStatusManagerService.updateActiveStage(processStage);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('paginate')
    async getPaginatedValuations(
      @Request() req,
      @Query('page', ParseIntPipe) page: number = 1,
      @Query('pageSize', ParseIntPipe) pageSize: number = 10,
      @Query('query') query: string | undefined
    ) :Promise<any>{
      return this.utilsService.paginateValuationByUserId(page,pageSize, req,query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('retrieve-particular-stage/filter')
    async getStageWiseDetails(
        @Query('processId') processId?: string,
        @Query('stageDetails') stageDetails?: string,
        ) {
      return await this.processStatusManagerService.fetchStageWiseDetails(processId, stageDetails);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('excel-status/:processStateId')
    async fetchExcelStatus(
      @Param('processStateId') processStateId: string,
    ) {
      return await this.processStatusManagerService.getExcelStatus(processStateId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('update-edited-excel-status/:processStateId')
    async updateEditedExcelStatus(
      @Param() processStateId:any
        ) {
      return await this.processStatusManagerService.updateEditedExcelStatus(processStateId);
    }
}
