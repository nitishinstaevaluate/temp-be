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
import { Observable, catchError, from } from 'rxjs';
import { ExcelSheetService } from './uploadExcel.service';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadFile(@UploadedFile() file) {
  
    this.customLogger.log({
      message: 'Upload Request is executed successfully into uploadExcel Controller.',
     });
    return { excelSheetId: file.filename };
  }

  //For deleting the uploaded excel files based on uploaded Date.

  // @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
  @Get('sheet/:fileName/:sheetName')
  getSheetData(
    @Param('fileName') fileName: string,
    @Param('sheetName') sheetName: string,
  ): Observable<any> {
    return from(this.excelSheetService.getSheetData(fileName, sheetName)).pipe(
      catchError((error) => {
        throw new NotFoundException(error.message);
      })
    );
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get('generate/:reportId/:model/:specificity')
  async generatePdf(
    @Param('reportId') reportId : string,
    @Param('model') model : string = null,
    @Param('specificity') specificity : boolean = false, 
    @Res() res
  ) {
    return await this.excelSheetService.generatePdfFromHtml(reportId,model,specificity,res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('modifyExcel')
  async modifyExcel(@Body() excelData){
    return await this.excelSheetService.modifyExcelSheet(excelData);
  } 
}
