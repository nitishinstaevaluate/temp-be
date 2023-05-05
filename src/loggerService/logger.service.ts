import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format} from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';


@Injectable()
export class CustomLogger  implements LoggerService {
  private logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp(),
      format.printf((obj) => {
        let message = '';
        message += `"timestamp": "${obj.timestamp}",\n`;
        message += `"level": "${obj.level}",\n`;
        message += `"userId": "${obj.userId}",\n`;
        message += `"requestMethod": "${obj.requestMethod}",\n`;
        message += `"requestBody": ${JSON.stringify(obj.requestBody)},\n`;
        message += `"apiUrl": "${obj.apiUrl}",\n`;
        message += `"message": "${obj.message}",\n`;
        message += `"error": ${JSON.stringify(obj.error, null, 2)},\n`;
        message += `"stack": "${obj.stack}"`;
        return `${obj.timestamp} ${obj.level} : {\n ${message}\n}`;
      })
    ),
    transports: [
      new DailyRotateFile({
        filename: './loggerFiles/logger-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '16m',
      })
    ]
  });

  error(error: any, context?: string) {
    this.logger.error(error);
  }

  warn(message: any, context?: string) {
    this.logger.warn(message);
  }

  log(message: any, context?: string) {
    this.logger.info(message);
  }
}
