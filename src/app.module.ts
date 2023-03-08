import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImportController } from './import/import.controller';
import { ImportService } from './import/import.service';
import { ImportModule } from './import/import.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
require('dotenv').config();

@Module({
  imports: [ImportModule, AuthenticationModule],
    // , UsersModule,
    // MongooseModule.forRoot('mongodb+srv://admin:iFinWorth@2023@cluster1.v81jlie.mongodb.net/ifin?retryWrites=false&w=majority')],
    // mongodb+srv://admin:graineasy2020@cluster0.73bc4.mongodb.net/graineasy-stg?retryWrites=true&w=majority
  controllers: [AppController, ImportController, AuthenticationController],
  providers: [AppService, ImportService, AuthenticationService],
})
export class AppModule {}
