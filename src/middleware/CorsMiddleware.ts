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
    
    // new headers
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Content-Security-Policy', 'default-src \'self\'');
    res.header('Referrer-Policy', 'no-referrer-when-downgrade');
    res.header('Feature-Policy', 'geolocation \'self\'; midi \'self\'; sync-xhr \'self\'');
    res.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.header('X-Permitted-Cross-Domain-Policies', 'none');
    res.header('Expect-CT', 'enforce, max-age=31536000');

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
