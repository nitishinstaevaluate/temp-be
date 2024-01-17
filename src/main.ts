import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import 'dotenv/config';


async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(process.env.KEYPATH,'utf8'),
    cert: fs.readFileSync(process.env.CERTIFICATEPATH,'utf8')
  };

  const app = await NestFactory.create(AppModule,{
    httpsOptions
  });
  
  const port = process.env.PORT || 443;
  await app.listen(port);
}
bootstrap();
