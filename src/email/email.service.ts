import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { contactEmailAggregateService } from './contact-email-aggregate.service';
import { emailDataCheckListAggregateService } from './email-data-checklist-aggregate.service';


@Injectable()
export class EmailService {
    constructor(private readonly contactEmailAggregateService: contactEmailAggregateService,
      private readonly emailDataCheckListAggregateService: emailDataCheckListAggregateService){}

    async sendEmail(payload) {
        try{
            return await this.contactEmailAggregateService.contactAggregateEmail(payload);
        }
        catch(error){
            console.log(error,"Error")
            throw new HttpException(
                {
                  error: error,
                  status: false,
                  msg: 'Contact email sending failed',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
        }
      }


      async sendDataCheckListViaEmail() {
        try{
            return await this.emailDataCheckListAggregateService.dataChecklistAggregateEmail();
        }
        catch(error){
            console.log(error,"Error")
            throw new HttpException(
                {
                  error: error,
                  status: false,
                  msg: 'Data checklist email sending failed',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
        }
      }
      async sendDataCheckListViaEmailVersionTwo(emailPayload) {
        try{
            return await this.emailDataCheckListAggregateService.dataChecklistAggregateEmailVersionTwo(emailPayload);
        }
        catch(error){
            console.log(error,"Error")
            throw new HttpException(
                {
                  error: error,
                  status: false,
                  msg: 'Data checklist email sending failed',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
        }
      }

      async postEmailDataChecklist(formData){
        try{
          return {message:"Your response has been saved successfully"}
        }
        catch(error){
          throw error
        }
      }
}
