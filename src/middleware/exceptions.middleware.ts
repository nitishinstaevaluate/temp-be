import {
  HttpException,
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Logger } from '../loggerService/logger.schema';
import { CustomLogger } from 'src/loggerService/logger.service';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private customLogger: CustomLogger) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    // Handle the exception
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const requestBody = request.body;
    const stack = exception.stack;
    let message ="The request is not an HTTP exception so you can use the stack value for debug." as any;
    if (exception instanceof HttpException) {
      const httpException = exception as HttpException;
       message = httpException.getResponse();
      const status = httpException.getStatus();
      response.status(status).json({
        message,
        statusCode: status,
      });
    } else {
      response.status(500).json({
        message: 'Internal server error',
        statusCode: 500,
      });
    }

    const logger: Logger = {
      userId: 'user_id',
      requestMethod: request.method,
      requestBody: requestBody || null,
      level: 'Error',
      error:message,
      apiUrl: request.url,
      stack: stack,
      message: `An error occurred while processing the ${request.method} request to ${request.url}`,
    } as Logger;

    this.customLogger.error(logger);
  }
}
