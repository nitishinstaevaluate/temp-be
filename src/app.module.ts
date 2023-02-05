import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImportController } from './import/import.controller';
import { ImportService } from './import/import.service';
import { ImportModule } from './import/import.module';

@Module({
  imports: [ImportModule],
  controllers: [AppController, ImportController],
  providers: [AppService, ImportService],
})
export class AppModule {}
