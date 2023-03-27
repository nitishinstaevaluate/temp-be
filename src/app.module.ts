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
import { ValuationController } from './valuationProcess/valuationProcess.controller';
require('dotenv').config();

@Module({
  imports: [ImportModule, UsersModule,
    AuthenticationModule,MongooseModule.forRoot(process.env.DBCONN),
    ConfigModule.forRoot(),],
  controllers: [AppController,ValuationController], //ImportController
  providers: [AppService, ], //ImportService
})
export class AppModule {}
