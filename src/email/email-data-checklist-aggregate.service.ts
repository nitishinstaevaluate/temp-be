import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

@Injectable()
export class emailDataCheckListAggregateService{
    
    constructor(private readonly mailerService:MailerService){}

    async dataChecklistAggregateEmail(){
        try{

            const templateHtml = fs.readFileSync(path.join(process.cwd(), 'src', 'email', 'email-data-checklist.html'), 'utf8');

            const logopath = path.join(process.cwd(), 'images', 'logo.jpg');
            
            return await this.sendDatachecklistEmail(templateHtml, logopath);
        }
        catch(error){
            throw new HttpException(
                {
                  error: error,
                  status: false,
                  msg: 'data checklist aggregate service failed',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
        }
    }

    async sendDatachecklistEmail(emailHtml, logopath){
        try{
            const response =  await this.mailerService.sendMail(this.createDataCheckListPayload(emailHtml, logopath));
    
            if(response.accepted){
                return {
                    response,
                    status:true,
                    msg:"data checklist Email triggered successfully"
                };
            }
            else{
                throw new HttpException(
                    {
                      error: response,
                      status: false,
                      msg: 'data checklist Email sending failed',
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
            }
        }
        catch(error){

        }
    }
  
    createDataCheckListPayload(html,logoPath){
      return {
          from:process.env.IFINWORTH_EMAIL_ID,
          to: [process.env.SENDERS_EMAIL], 
          subject: 'Data Checklist Form',
          attachments: [{
            filename: 'logo.jpg',
            path: logoPath,
            cid: 'logo'
            }],
          html: html
      };
    }
}