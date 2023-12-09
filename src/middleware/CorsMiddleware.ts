import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {  transports, format } from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule,  } from 'nest-winston';


@Injectable()
export class CorsMiddleware implements NestMiddleware {

  private readonly logger = WinstonModule.createLogger({
    transports: [
      new transports.File({ filename: 'combined.log' }),
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.Console({
        format: format.combine(
          format.timestamp(),
          format.ms(),
          nestWinstonModuleUtilities.format.nestLike('Ifin', {
            colors: true,
            prettyPrint: true,
          }),
        ),
      }),
    ],
  });

  use(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.status(200).send();
    } else {
      const { method, originalUrl } = req;

      res.on('finish', () => {
        const { statusCode } = res;
        if (statusCode >= 400) {
          this.logger.error(`Error Response ${method} ${originalUrl} ${statusCode} ${JSON.stringify({ error: Error.captureStackTrace, body: req.body })}`, );
        } else {
          this.logger.log(`Response ${method} ${originalUrl} ${statusCode} ${JSON.stringify({ body: req.body })}`);
        }
      });

      next();
    }
  }
}
