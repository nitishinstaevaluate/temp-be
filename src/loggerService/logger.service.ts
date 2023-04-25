import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

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
      new transports.File({ filename: './loggerFiles/error.log', level: 'error' }),
      new transports.File({ filename: './loggerFiles/combined.log' })
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
