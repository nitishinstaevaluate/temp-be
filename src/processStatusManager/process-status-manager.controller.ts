import {
    Body,
      Controller,
      Get,
      Param,
      Query,
      Put,
      UseGuards,
      Request
    } from '@nestjs/common';
import { ProcessStatusManagerService } from './process-status-manager.service';
import { AuthGuard } from '@nestjs/passport';
import { ProcessStatusManagerDTO } from './dto/process-status-manager.dto';

@Controller('process-status-manager')
export class ProcessStatusManagerController {
    constructor(private processStatusManagerService:ProcessStatusManagerService){}

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
}
