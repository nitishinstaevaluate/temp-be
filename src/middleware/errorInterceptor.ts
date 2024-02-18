import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus, Inject, LoggerService } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import moment = require('moment');

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService,) {}

async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.originalUrl;
    let userInfo ;
    return next.handle().pipe(
      tap((res) => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.log(
          `${moment(now)} | ${response.statusCode} | [${method}] ${url} - ${delay}ms ${JSON.stringify(
            request.body,
          )} | ${JSON.stringify(userInfo)}`,
        );
      }),
      catchError((error) => {
        // const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.error(
          `${moment(now)} | ${error.response.statusCode} | [${method}] ${url} - ${delay}ms ${JSON.stringify(
            request.body,
          )} ${JSON.stringify(error)} | ${JSON.stringify(userInfo)}`,
        );

        const res = JSON.stringify(error) ? JSON.stringify(error).length > 3000 ? 'large error' : JSON.stringify(error) : {} 
        const log:any = {}; //use this log for storing error log
        log.request = JSON.stringify(request.body);
        log.response = JSON.stringify(res);
        log.type = method;
        log.url = url;
        log.statusCode = error.response.statusCode;
        log.loginUser =  JSON.stringify(userInfo);
        return throwError(error);
      }),
    );
  }
}
