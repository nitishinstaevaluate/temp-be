import { Module } from '@nestjs/common';
import { IndustryService } from './industry.service';

@Module({
    imports: [],
    controllers: [], //ImportController
    providers: [IndustryService], //ImportService
    exports:[IndustryService]
  })
  export class IndustryModule {}