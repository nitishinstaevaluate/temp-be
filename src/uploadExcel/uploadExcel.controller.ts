import { Controller, Post,Get, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

const storage = diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  });

  
@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadFile(@UploadedFile() file) {
    return {excelSheetId:file.filename};
  }

  //For deleting the uploaded excel files based on uploaded Date.

  @Get('dates')
  getUploadDates() {
    const uploadDir = path.join(__dirname, '../../uploads');
    const excelFiles = fs.readdirSync(uploadDir).filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
    const fileDates = excelFiles.map(file => ({
      fileName: file,
      uploadDate: fs.statSync(path.join(uploadDir, file)).mtime,
    }));
    return fileDates;
  }
}
