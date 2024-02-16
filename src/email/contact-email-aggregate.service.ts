import { MailerService } from "@nestjs-modules/mailer";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

@Injectable()
export class contactEmailAggregateService{
    constructor(private readonly mailerService: MailerService){}

    async contactAggregateEmail(body){
        try{
            
            const data = {
                name: body.name,
                email: body.email,
                subject: 'Contact Feedback Form',
                message: body.message,
                company:body.company,
                mobileNumber:body.mobileNumber,
                logo: 'cid:logo'
            };

            const templateHtml = fs.readFileSync(path.join(process.cwd(), 'src', 'email', 'contact-email.html'), 'utf8');
            const template = handlebars.compile(templateHtml);

            await this.loadEmailHelper(data);

            const emailHtml = template(data);

            const filePath = path.join(process.cwd(), 'images', 'logo.jpg');
            
            return await this.sendContactEmail(data, emailHtml, filePath);
        }
        catch(error){
            throw new HttpException(
                {
                  error: error,
                  status: false,
                  msg: 'contact sales email aggregate failed',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
        }
    }

    async loadEmailHelper(data){
        try{
            handlebars.registerHelper('name',()=>{
                if(data.name)
                  return data.name;
                return '';
              })

            handlebars.registerHelper('email',()=>{
                if(data.email)
                  return data.email;
                return '';
              })

            handlebars.registerHelper('subject',()=>{
                if(data.subject)
                  return data.subject;
                return '';
              })

            handlebars.registerHelper('message',()=>{
                if(data.message)
                  return data.message;
                return '';
              })

            handlebars.registerHelper('company',()=>{
              if(data.company)
                return data.company;
              return '';
            })
          
            handlebars.registerHelper('mobileNumber',()=>{
              if(data.mobileNumber)
                return data.mobileNumber;
              return '';
            })
        }
        catch(error){
            throw new HttpException(
                {
                  error: error,
                  status: false,
                  msg: 'helper binding failed',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
        }
      }

    async sendContactEmail(data, emailHtml, logopath) {
        try {
            const response =  await this.mailerService.sendMail(this.createContactEmailPayload(data, emailHtml, logopath));
    
            if(response.accepted){
                return {
                    response,
                    status:true,
                    msg:"Contact Email triggered successfully"
                };
            }
            else{
                throw new HttpException(
                    {
                      error: response,
                      status: false,
                      msg: 'Email sending failed',
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
            }
        } catch (error) {
            throw new HttpException(
              {
                error: error,
                status: false,
                msg: 'Nodemailer email triggering failed',
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );;
        }
    }
    
    createContactEmailPayload(emailDetails,html,logopath){
        return {
            from:process.env.IFINWORTH_EMAIL_ID,
            to: [process.env.SENDERS_EMAIL], 
            subject: emailDetails.subject,
            attachments: [{
              filename: 'logo.jpg',
              path: logopath,
              cid: 'logo'
              }],
            html: html
        };
      }
}