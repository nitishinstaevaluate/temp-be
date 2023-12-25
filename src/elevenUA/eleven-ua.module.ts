import { Module } from '@nestjs/common';
import { ElevenUaService } from './eleven-ua.service';

@Module({
  providers: [ElevenUaService]
})
export class ElevenUaModule {}
