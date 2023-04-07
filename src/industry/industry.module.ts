import { Module } from '@nestjs/common';
import { IndustryService } from './industry.service';
import {MastersModule} from '../masters/masters.module';

@Module({
    imports: [MastersModule],
    controllers: [], //ImportController
    providers: [IndustryService], //ImportService
    exports:[IndustryService]
  })
  export class IndustryModule {}