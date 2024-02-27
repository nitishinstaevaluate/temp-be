import {
  Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
  } from '@nestjs/common';
import { ReportService } from './report.service';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

const storage = diskStorage({
  destination: './pdf',
  filename: (req, file, cb) => {
    const reportId = req.params.reportId
    const fileName = `${file.originalname}`;
    cb(null, fileName);
  },
});
@Controller('report')
export class ReportController {
    constructor(private reportService:ReportService){}

  @UseGuards(AuthGuard('jwt'))
  @Get('getReport/:approach/:reportId')
  async getReport(
    @Param('reportId') reportId : string,
    @Param('approach') approach : string,
    @Res() res,
    @Req() req
  ) {
    try {
      const result = await this.reportService.getReport(reportId, res, req, approach);
      if (result.status) {
         return result;
      } else {
          res.status(500).json(result); 
      }
  } catch (error) {
      console.error("Controller Error:", error);
      res.status(500).json({
          msg: "Internal Server Error",
          status: false,
          error: error.message
      });
  }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('generateReport')
  async generateReport(
  @Body() data) {
    const result = await this.reportService.createReport(data);
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('rule-eleven-ua-report/:reportId')
  async generateElevenUaReport(
  @Param('reportId') reportId : string,
  @Res() res) {
    return await this.reportService.ruleElevenUaReport(reportId, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('sebi-report/:reportId')
  async generateSebiReport(
  @Param('reportId') reportId : string,
  @Res() res,
  @Req() req) {
    return await this.reportService.sebiReport(reportId, res, req);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('preview-sebi-report/:reportId')
  async previewSebiReport(
  @Param('reportId') reportId : string,
  @Res() res,
  @Req() req) {
    return await this.reportService.previewSebiReport(reportId, res, req);
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Get('previewReport/:approach/:reportId')
  async previewReport(
    @Param('reportId') reportId : string='',
    @Param('approach') approach : string='',
    @Res() res,
    @Req() req) {
    const result = await this.reportService.previewReport(reportId, res,req, approach);
    return  result;
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Get('preview-rule-eleven-ua-report/:reportId')
  async previewElevenUa(
    @Param('reportId') reportId : string='',
    @Res() res) {
    return await this.reportService.ruleElevenUaPreviewReport(reportId, res);
  }

  @Put('updateReportDoc/:reportId')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { storage }))
  async updateDocx(@UploadedFile() file,@Param('reportId') reportId:string) {
    return await this.reportService.updateReportDocxBuffer(reportId,file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mandate-report/:reportId')
  async generateMandateReport(
  @Param('reportId') reportId : string,
  @Res() res) {
    return await this.reportService.mandateReport(reportId, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mrl-report/:processStateId')
  async generateMrlReport(
  @Param('processStateId') processStateId : string,
  @Res() res) {
    return await this.reportService.mrlReport(processStateId, res);
  }
}
