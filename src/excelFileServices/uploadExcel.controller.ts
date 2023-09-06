import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { CustomLogger } from 'src/loggerService/logger.service';
import { Observable, catchError, from } from 'rxjs';
import { ExcelSheetService } from './uploadExcel.service';

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

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadFile(@UploadedFile() file) {
  
    this.customLogger.log({
      message: 'Upload Request is executed successfully into uploadExcel Controller.',
     });
    return { excelSheetId: file.filename };
  }

  //For deleting the uploaded excel files based on uploaded Date.

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
}
