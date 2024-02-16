import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import 'dotenv/config';
import { ErrorInterceptor } from './middleware/errorInterceptor';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
const path = require('path');
const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const combinedLog = path.join(logDir, 'combined.log');
const errorLog = path.join(logDir, 'error.log');

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(process.env.KEYPATH,'utf8'),
    cert: fs.readFileSync(process.env.CERTIFICATEPATH,'utf8')
  };

  const app = await NestFactory.create(AppModule,{
    httpsOptions
  });

  app.useGlobalInterceptors(
    new ErrorInterceptor(
      WinstonModule.createLogger({
        transports: [
          new transports.File({ filename: combinedLog }),
          new transports.File({ filename: errorLog, level: 'error' }),
          new transports.Console({
            format: format.combine(format.timestamp(), format.ms(), nestWinstonModuleUtilities.format.nestLike('Ifin', {
              colors: true,
              prettyPrint: true,
              })),
          }),
        ]
      }),
    ),
  );
  
  app.enableCors({
    origin: [
      'http://10.250.1.99:9100',
      'http://10.250.1.99',
      'http://10.250.1.99:9020',
      'https://app.ifinworth.com',
      'localhost',
      'https://localhost:4000',
      'https://localhost:4200'
    ],
  });

  const port = process.env.PORT || 443;
  await app.listen(port);
}
bootstrap();
