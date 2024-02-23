import { Body, Controller, Get, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { emailDto, validateDataCheckListDto } from './dto/email.dto';

const storage = diskStorage({
    destination: './email-uploads',
    filename: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  });

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService){
        this.createEmailUploadsDirectoryIfNotExist();
    }

    private createEmailUploadsDirectoryIfNotExist() {
        const directory = './email-uploads';
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory);
        }
      }

    // https://localhost:3000/email/send-email
    @Post('send-email')
    async sendEmail(@Body() payload:any) {
        return await this.emailService.sendEmail(payload);
    }

    // https://localhost:3000/email/submit-form
    @Post('submit-form')
    @UseInterceptors(FileInterceptor('excelTemplate',{ storage }))
    async submitForm( @UploadedFile() excelTemplate:any, @Body(ValidationPipe) formData: validateDataCheckListDto) {
        console.log('Form data:', formData);
        console.log('Uploaded Excel file:', excelTemplate);
        return await this.emailService.postEmailDataChecklist(formData);
    }

    // https://localhost:3000/email/send-data-checklist
    @Get('send-data-checklist')
    async sendDataCheckList() {
        return await this.emailService.sendDataCheckListViaEmail();
    }

    // https://localhost:3000/email/v2/send-data-checklist-email
    @Post('v2/send-data-checklist-email')
    async versionTwosendDataCheckList(@Body(ValidationPipe) emailPayload: emailDto ) {
        return await this.emailService.sendDataCheckListViaEmailVersionTwo(emailPayload);
    }
}

