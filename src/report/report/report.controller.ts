import {
  Body,
    Controller,
    Get,
    Param,
    Post,
    Res,
    UseGuards,
  } from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('report')
export class ReportController {
    constructor(private reportService:ReportService){}

  @UseGuards(AuthGuard('jwt'))
  @Get('getReport/:reportId')
  async getReport(
    @Param('reportId') reportId : string,
    @Res() res
  ) {
    const result = await this.reportService.getReport(reportId, res);
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('generateReport')
  async generateReport(
  @Body() data) {
    const result = await this.reportService.createReport(data);
    return result;
  }
}
