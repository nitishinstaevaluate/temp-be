import { Module } from '@nestjs/common';
import {CustomLogger} from './logger.service';
@Module({
    imports: [],
  controllers: [], //ImportController
  providers: [CustomLogger ], //ImportService
  exports: [CustomLogger ],
})
export class LoggerModule {}
