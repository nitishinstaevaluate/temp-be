import { Module } from '@nestjs/common';
import { ProcessStatusManagerService } from './process-status-manager.service';
import { CustomLogger } from 'src/loggerService/logger.service';
import { ProcessStatusManagerController } from './process-status-manager.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProcessStatusManagerSchema } from './schema/process-status-manager.schema';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
require('dotenv').config();

@Module({
  providers: [ProcessStatusManagerService,CustomLogger,AuthenticationService],
  controllers: [ProcessStatusManagerController],
  imports:[MongooseModule.forFeature([{ name: 'processStatusManager', schema: ProcessStatusManagerSchema }]),AuthenticationModule,UsersModule,JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '24h' },
  })]
})
export class ProcessStatusManagerModule {}
