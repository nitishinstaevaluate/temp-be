import { Module } from '@nestjs/common';
import { ProcessStatusManagerService } from './process-status-manager.service';
import { CustomLogger } from 'src/loggerService/logger.service';
import { ProcessStatusManagerController } from './process-status-manager.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProcessStatusManagerSchema } from './schema/process-status-manager.schema';


@Module({
  providers: [ProcessStatusManagerService,CustomLogger],
  controllers: [ProcessStatusManagerController],
  imports:[MongooseModule.forFeature([{ name: 'processStatusManager', schema: ProcessStatusManagerSchema }])]
})
export class ProcessStatusManagerModule {}
