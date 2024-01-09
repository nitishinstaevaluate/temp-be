import { Module } from '@nestjs/common';
import { CiqSpService } from '../ciq-sp/ciq-sp.service';
import { CiqSpController } from './ciq-sp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SnowflakeClientServiceService } from 'src/snowflake/snowflake-client-service.service';
import { ciqsimpleindustrySchema, ciqindustryhierarchySchema, ciqcompanystatustypeSchema, ciqcompanytypeSchema } from './schema/ciq-sp.chema';
import { RedisService } from 'src/middleware/redisConfig';
import { ProcessStatusManagerService } from 'src/processStatusManager/process-status-manager.service';
import { ProcessStatusManagerModule } from 'src/processStatusManager/process-status-manager.module';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { CustomLogger } from 'src/loggerService/logger.service';
import { utilsService } from 'src/utils/utils.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { UsersModule } from 'src/users/users.module';
import { ProcessManagerSchema } from 'src/processStatusManager/schema/process-status-manager.schema';
import { JwtModule } from '@nestjs/jwt';
import { ValuationSchema } from 'src/valuationProcess/schema/valuation.schema';

@Module({
  providers: [CiqSpService,SnowflakeClientServiceService,RedisService,ProcessStatusManagerService,CustomLogger,AuthenticationService,utilsService],
  controllers: [CiqSpController],
  imports:[MongooseModule.forFeature([
    {name: 'ciqsimpleindustry', schema : ciqsimpleindustrySchema},
    {name: 'ciqindustryhierarchy', schema : ciqindustryhierarchySchema},
    {name:'ciqcompanystatustype', schema : ciqcompanystatustypeSchema},
    {name:'ciqcompanytype', schema : ciqcompanytypeSchema},
    {name: 'processManager', schema: ProcessManagerSchema},
    {name: 'valuation', schema: ValuationSchema}
  ]),
  ProcessStatusManagerModule,
  AuthenticationModule,
  UsersModule,
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '24h' },
  })]
})
export class CiqSpModule {}