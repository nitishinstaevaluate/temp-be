import { ConflictException, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { emailDto } from "./dto/email.dto";
import { KeyCloakAuthGuard } from "src/middleware/key-cloak-auth-guard";
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const otplib = require('otplib');

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
          throw new HttpException(
            {
              error: error,
              status: false,
              msg: 'data checklist email sending failed',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
    }

    async dataChecklistAggregateEmailVersionTwo(emailPayload:emailDto){
      try{
          const templateHtml = fs.readFileSync(path.join(process.cwd(), 'src', 'email', 'v2-email-data-checklist.html'), 'utf8');

          const template = handlebars.compile(templateHtml);

          await this.loadDataCheckListHelper(emailPayload);

          const emailHtml = template(emailPayload);

          const logopath = path.join(process.cwd(), 'images', 'logo.jpg');

          return await this.mailerService.sendMail(this.createDataCheckListPayload(emailHtml, logopath, emailPayload.emailId));
      }
      catch(error){
        throw new HttpException(
          {
            error: error,
            status: false,
            msg: 'v2 - data checklist aggregate email sending failed',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    createDataCheckListPayload(html,logoPath, sendersEmail?){
      return {
          from:process.env.IFINWORTH_EMAIL_ID,
          to: [sendersEmail || process.env.IFINWORTH_EMAIL_ID], 
          subject: 'Data Checklist Form',
          attachments: [{
            filename: 'logo.jpg',
            path: logoPath,
            cid: 'logo'
            }],
          html: html
      };
    }

    async loadDataCheckListHelper(data){
      try{
        handlebars.registerHelper('checkListLink',()=>{
          return data.checkListUrl
        })
      }
      catch(error){
        return{
          error:error,
          status:false,
          msg:"data checklist helper failed"
        }
      }

    }

    async sendEmailOtp(body){
      try{
        const KCAuthInstance = new KeyCloakAuthGuard();
        const emailExistence = await KCAuthInstance.checkEmailExistence(body.email).toPromise();

        if(!emailExistence.isEmailExisting)
          throw new ConflictException({emailExistence,errorDescription: 'email does not exist'}).getResponse();

        const rawOtpData = await this.generateOtp();

          const otpBody={
            email: body.email,
            otp: rawOtpData.otp
          }

          const templateHtml = fs.readFileSync(path.join(process.cwd(), 'src', 'email', 'email-verification.html'), 'utf8');

          const template = handlebars.compile(templateHtml);

          await this.loadEmailVerificationHelpers(otpBody);

          const emailHtml = template(otpBody);

          const logopath = path.join(process.cwd(), 'images', 'logo.jpg');

          await this.mailerService.sendMail(this.createEmailOtpPayload(emailHtml, logopath, otpBody.email));
          return {
            status: true,
            authSecret:rawOtpData.secret,
            msg:'Otp sent success'
          }
      }
      catch(error){
        throw new HttpException(error,HttpStatus.INTERNAL_SERVER_ERROR).getResponse();
      }
    }

    createEmailOtpPayload(html,logoPath, sendersEmail?){
      return {
          from:process.env.IFINWORTH_EMAIL_ID,
          to: [sendersEmail || process.env.IFINWORTH_EMAIL_ID], 
          subject: 'Password Reset',
          attachments: [{
            filename: 'logo.jpg',
            path: logoPath,
            cid: 'logo'
            }],
          html: html
      };
    }

   async generateOtp(){
      otplib.totp.options = { digits: 6, algorithm: "sha512", epoch: 0 }
      const secret = otplib.authenticator.generateSecret();
      const otp = otplib.totp.generate(secret); 
      return { otp, secret }
    }

    loadEmailVerificationHelpers(data){
      try{
        handlebars.registerHelper('otp',()=>{
          return data.otp;
        })
      }
      catch(error){
        return{
          error:error,
          status:false,
          msg:"data checklist helper failed"
        }
    }
  }

  async verifyEmailOtp(body){
    try{
      return otplib.totp.check(body.otp, body.authSecret);
    }
    catch(error){
      throw new HttpException(error,HttpStatus.INTERNAL_SERVER_ERROR).getResponse();
    }
  }
}