import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { contactEmailAggregateService } from './contact-email-aggregate.service';
import { emailDataCheckListAggregateService } from './email-data-checklist-aggregate.service';
require('dotenv').config();

@Module({
  providers: [EmailService, contactEmailAggregateService, emailDataCheckListAggregateService],
  controllers: [EmailController],
  imports:[MailerModule.forRoot({
    transport: {
      host: process.env.IFINWORTH_EMAIL_HOST,
      port: process.env.IFINWORTH_EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.IFINWORTH_EMAIL_ID,
        pass: process.env.IFINWORTH_EMAIL_PASSWORD,
      }
    },
  }),
],
})
export class EmailModule {}
