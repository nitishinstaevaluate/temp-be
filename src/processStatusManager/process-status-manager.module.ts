import { Module } from '@nestjs/common';
import { ProcessStatusManagerService } from './process-status-manager.service';
import { CustomLogger } from 'src/loggerService/logger.service';
import { ProcessStatusManagerController } from './process-status-manager.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProcessManagerSchema } from './schema/process-status-manager.schema';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { utilsService } from 'src/utils/utils.service';
import { ValuationSchema } from 'src/valuationProcess/schema/valuation.schema';
require('dotenv').config();

@Module({
  providers: [ProcessStatusManagerService,CustomLogger,AuthenticationService,utilsService],
  controllers: [ProcessStatusManagerController],
  imports:[
    MongooseModule.forFeature([{ name: 'processManager', schema: ProcessManagerSchema }]),
    MongooseModule.forFeature([{ name: 'valuation', schema: ValuationSchema }]),
    AuthenticationModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    })
  ],
  exports:[ProcessStatusManagerService]
})
export class ProcessStatusManagerModule {}
