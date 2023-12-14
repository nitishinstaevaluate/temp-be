import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {  transports, format } from 'winston';
import { utilities as nestWinstonModuleUtilities, WinstonModule,  } from 'nest-winston';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
const path = require('path');
const fs = require('fs');

const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const combinedLog = path.join(logDir, 'combined.log');
const errorLog = path.join(logDir, 'error.log');

@Injectable()
export class CorsMiddleware implements NestMiddleware {

  private readonly logger = WinstonModule.createLogger({
    transports: [
      new transports.File({ filename: combinedLog }),
      new transports.File({ filename: errorLog, level: 'error' }),
      new transports.Console({
        format: format.combine(
          // format.timestamp(),
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

    const currentDateIST = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    });

    if (req.method === 'OPTIONS') {
      res.status(200).send();
    } else {
      const { method, originalUrl } = req;

      res.on('finish', () => {
        const { statusCode } = res;
        if (statusCode >= 400) {
          this.logger.error(`[${currentDateIST}] Error Response ${method} ${originalUrl} ${statusCode} ${JSON.stringify({ 
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            errorStack: new Error().stack,
            body: req.body
          })}`);
        }
        else {
          this.logger.log(`[${currentDateIST}] Response ${method} ${originalUrl} ${statusCode} ${JSON.stringify({ body: req.body })}`);
        }
      });
      next();
    }
  }
}
