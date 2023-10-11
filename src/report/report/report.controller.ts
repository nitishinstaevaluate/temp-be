import {
    Controller,
    Get,
    Param,
    Res,
    UseGuards,
  } from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('report')
export class ReportController {
    constructor(private reportService:ReportService){}

  @UseGuards(AuthGuard('jwt'))
  @Get('generate/:reportId')
  async generateReport(
    @Param('reportId') reportId : string,
    @Res() res
  ) {
    const result = await this.reportService.createReport(reportId, res);
    return result;
  }
}
