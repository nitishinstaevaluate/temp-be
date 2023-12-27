import { Module } from '@nestjs/common';
import { ElevenUaService } from './eleven-ua.service';
import { ElevenUaController } from './eleven-ua.controller';

@Module({
  providers: [ElevenUaService],
  controllers: [ElevenUaController]
})
export class ElevenUaModule {}
