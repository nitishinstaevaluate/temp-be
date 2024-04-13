import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Param,
  NotFoundException,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { CustomLogger } from 'src/loggerService/logger.service';
import { Observable, catchError, from, throwError } from 'rxjs';
import { ExcelSheetService } from './uploadExcel.service';
import { AuthGuard } from '@nestjs/passport';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

@Controller('upload')
export class UploadController {
  constructor(
    private readonly customLogger:CustomLogger,
    private excelSheetService: ExcelSheetService,
  ) {
    this.createUploadsDirectoryIfNotExist();
  }
  private createUploadsDirectoryIfNotExist() {
    const directory = './uploads';
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
  }

  // @UseGuards(KeyCloakAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadFile(@UploadedFile() formData) {
    return await this.excelSheetService.pushInitialFinancialSheet(formData);
  }

  // @UseGuards(KeyCloakAuthGuard)
  @Get('dates')
  getUploadDates() {
    const uploadDir = path.join(__dirname, '../../uploads');
    const excelFiles = fs
      .readdirSync(uploadDir)
      .filter((file) => file.endsWith('.xlsx') || file.endsWith('.xls'));
    const fileDates = excelFiles.map((file) => ({
      fileName: file,
      uploadDate: fs.statSync(path.join(uploadDir, file)).mtime,
    }));
    return fileDates;
  }

  @UseGuards(KeyCloakAuthGuard)
  @Get('sheet/:fileName/:sheetName')
  getSheetData(
    @Param('fileName') fileName: string,
    @Param('sheetName') sheetName: string,
  ): Observable<any> {
    return from(this.excelSheetService.getSheetData(fileName, sheetName)).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  // @UseGuards(KeyCloakAuthGuard)
  @Get('generate-pdf/:reportId/:model/:specificity/:processId/:terminalType')
  async generatePdf(
    @Param('reportId') reportId : string,
    @Param('model') model : string = null,
    @Param('specificity') specificity : boolean = false, 
    @Param('processId') processId : string, 
    @Param('terminalType') terminalType : string, 
    @Res() res
  ) {
    return await this.excelSheetService.generatePdfFromHtml(reportId,model,specificity,res, processId, terminalType);
  }

  // @UseGuards(KeyCloakAuthGuard)
  @Get('generate-docx/:reportId/:model/:specificity/:processId/:terminalType')
  async generateDocx(
    @Param('reportId') reportId : string,
    @Param('model') model : string = null,
    @Param('specificity') specificity : boolean = false, 
    @Param('processId') processId : string, 
    @Param('terminalType') terminalType : string, 
    @Res() res
  ) {
    return await this.excelSheetService.generateDocxFromHtml(reportId,model,specificity,res, processId, terminalType);
  }

  // @UseGuards(KeyCloakAuthGuard)
  @Get('export-eleven-ua/:elevenUaId')
  async generateElevenUApdf(
    @Param('elevenUaId') id : string,
    @Res() res
  ) {
    return await this.excelSheetService.exportElevenUaPdf(id,res);
  }

  // @UseGuards(KeyCloakAuthGuard)
  @Get('export-eleven-ua-docx/:elevenUaId')
  async generateElevenUAdocx(
    @Param('elevenUaId') id : string,
    @Res() res
  ) {
    return await this.excelSheetService.exportElevenUaDocx(id,res);
  }

  @UseGuards(KeyCloakAuthGuard)
  @Post('modifyExcel')
  async modifyExcel(@Body() excelData){
    return await this.excelSheetService.modifyExcelSheet(excelData);
  }
}
