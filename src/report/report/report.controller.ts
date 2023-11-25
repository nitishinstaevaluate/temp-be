import {
  Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
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
    @Res() res
  ) {
    try {
      const result = await this.reportService.getReport(reportId, res,approach);
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
  @Get('previewReport/:approach/:reportId')
  async previewReport(
    @Param('reportId') reportId : string='',
    @Param('approach') approach : string='',
    @Res() res) {
    const result = await this.reportService.previewReport(reportId, res,approach);
    return  result;
  }

  @Put('updateReportDoc/:reportId')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { storage }))
  async updateDocx(@UploadedFile() file,@Param('reportId') reportId:string) {
    return await this.reportService.updateReportDocxBuffer(reportId,file.filename);
  }
}
