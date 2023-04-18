import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerService } from './logger.service';

import { LoggerSchema} from './logger.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'logger', schema: LoggerSchema }])
      ],
  controllers: [], //ImportController
  providers: [LoggerService], //ImportService
  exports: [LoggerService],
})
export class LoggerModule {}
