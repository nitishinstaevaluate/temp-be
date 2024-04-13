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
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';

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

  @UseGuards(KeyCloakAuthGuard)
  @Get('getReport/:approach/:reportId/:type')
  async getReport(
    @Param('reportId') reportId : string,
    @Param('approach') approach : string,
    @Param('type') formatType : string,
    @Res() res,
    @Req() req
  ) {
    try {
      const result = await this.reportService.getReport(reportId, res, req, approach, formatType);
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

  @UseGuards(KeyCloakAuthGuard)
  @Post('generateReport')
  async generateReport(
  @Body() data) {
    const result = await this.reportService.createReport(data);
    return result;
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('rule-eleven-ua-report/:reportId/:type')
  async generateElevenUaReport(
  @Param('reportId') reportId : string,
  @Param('type') formatType : string,
  @Res() res) {
    return await this.reportService.ruleElevenUaReport(reportId, res, formatType);
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('nav-report/:reportId/:type')
  async generateNavReport(
  @Param('reportId') reportId : string,
  @Param('type') formatType : string,
  @Res() res) {
    return await this.reportService.navReport(reportId, res, formatType);
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('preview-nav-report/:reportId')
  async previewNavReport(
  @Param('reportId') reportId : string,
  @Res() res) {
    return await this.reportService.previewNavReport(reportId, res);
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('sebi-report/:reportId/:type')
  async generateSebiReport(
  @Param('reportId') reportId : string,
  @Param('type') formatType : string,
  @Res() res,
  @Req() req) {
    return await this.reportService.sebiReport(reportId, res, req, formatType);
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('preview-sebi-report/:reportId')
  async previewSebiReport(
  @Param('reportId') reportId : string,
  @Res() res,
  @Req() req) {
    return await this.reportService.previewSebiReport(reportId, res, req);
  }
  
  @UseGuards(KeyCloakAuthGuard)
  @Get('previewReport/:approach/:reportId')
  async previewReport(
    @Param('reportId') reportId : string='',
    @Param('approach') approach : string='',
    @Res() res,
    @Req() req) {
    const result = await this.reportService.previewReport(reportId, res,req, approach);
    return  result;
  }
  
  @UseGuards(KeyCloakAuthGuard)
  @Get('preview-rule-eleven-ua-report/:reportId')
  async previewElevenUa(
    @Param('reportId') reportId : string='',
    @Res() res) {
    return await this.reportService.ruleElevenUaPreviewReport(reportId, res);
  }

  @Put('updateReportDoc/:reportId')
  @UseGuards(KeyCloakAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage }))
  async updateDocx(@UploadedFile() file,@Param('reportId') reportId:string) {
    return await this.reportService.updateReportDocxBuffer(reportId,file);
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('mandate-report/:reportId')
  async generateMandateReport(
  @Param('reportId') reportId : string,
  @Res() res) {
    return await this.reportService.mandateReport(reportId, res);
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('mrl-report/:processStateId')
  async generateMrlReport(
  @Param('processStateId') processStateId : string,
  @Res() res) {
    return await this.reportService.mrlReport(processStateId, res);
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('mrl-docx-report/:processStateId')
  async generateMrlDocxReport(
  @Param('processStateId') processStateId : string,
  @Res() res) {
    return await this.reportService.mrlDocxReport(processStateId, res);
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('rule-eleven-mrl-report/:processStateId')
  async generateElevenUaMrlPdfReport(
  @Param('processStateId') processStateId : string,
  @Res() res) {
    return await this.reportService.elevenUaMrlReport(processStateId, res);
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('rule-eleven-mrl-docx-report/:processStateId')
  async generateElevenUaMrlDocxReport(
  @Param('processStateId') processStateId : string,
  @Res() res) {
    return await this.reportService.elevenUaMrlDocxReport(processStateId, res);
  }
}
