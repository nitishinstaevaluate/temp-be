import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MastersModule } from './masters/masters.module';
import { ExportResultsModule } from './exportResults/exportResults.module';
import { ValuationProcessModule } from './valuationProcess/valuationProcess.module';
import { CorsMiddleware } from './middleware/CorsMiddleware';
import { UploadController } from './excelFileServices/uploadExcel.controller';
import { IndustryModule } from './industry/industry.module';
import { ExportTemplateController } from './excelFileServices/exportTemplate.controller';
import {LoggerModule} from './loggerService/logger.module'
import { ExceptionsFilter } from './middleware/exceptions.middleware';
import { APP_FILTER } from '@nestjs/core';
require('dotenv').config();

@Module({
  imports: [UsersModule,MastersModule,
    ValuationProcessModule,ExportResultsModule,
    AuthenticationModule,IndustryModule,LoggerModule,MongooseModule.forRoot(process.env.DBCONN),
    ConfigModule.forRoot(),],
  controllers: [AppController,UploadController,ExportTemplateController], //ImportController
  providers: [AppService, {
    provide: APP_FILTER,
    useClass: ExceptionsFilter,
  }, ], //ImportService
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*');
  }
}
