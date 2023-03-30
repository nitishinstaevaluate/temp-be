import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImportController } from './import/import.controller';
import { ImportService } from './import/import.service';
import { ImportModule } from './import/import.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MastersModule } from './masters/masters.module';
import { ExportResultsModule } from './exportResults/exportResults.module';
import { ValuationProcessModule } from './valuationProcess/valuationProcess.module';
require('dotenv').config();

@Module({
  imports: [ImportModule, UsersModule,MastersModule,
    ValuationProcessModule,ExportResultsModule,
    AuthenticationModule,MongooseModule.forRoot(process.env.DBCONN),
    ConfigModule.forRoot(),],
  controllers: [AppController], //ImportController
  providers: [AppService, ], //ImportService
})
export class AppModule {}
