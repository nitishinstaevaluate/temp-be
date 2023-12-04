import {
    Body,
      Controller,
      Get,
      Param,
      Query,
      Put,
      UseGuards,
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
        @Body() process: ProcessStatusManagerDTO,
        @Query('processId') processId?: string
        ) {
      return await this.processStatusManagerService.upsertProcess(process,processId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('retrieveProcess/:processId')
    async fetchProcessState(
        @Param('processId') processId?: string
        ) {
      return await this.processStatusManagerService.fetchProcess(processId);
    }
}
