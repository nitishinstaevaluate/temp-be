import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from './logger.schema';

@Injectable()
export class LoggerService {
  constructor(@InjectModel("logger") private loggerModel: Model<Logger>) {}

  async createLogger(logger: Logger): Promise<Logger> {
    const createdLogger = new this.loggerModel(logger);
    return createdLogger.save();
  }
}