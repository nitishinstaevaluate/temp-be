import { Module } from '@nestjs/common';
import { StartUpValuationController } from './controller/start-up-valuation.controller';
import { StartUpValuationService } from './service/start-up-valuation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StartupValuationSchema } from './schema/startup-valuation.schema';
import { BerkusService } from './service/berkus.service';

@Module({
  providers:[StartUpValuationService, BerkusService],
  imports:[
    MongooseModule.forFeature([
      { name: 'startupValuation', schema: StartupValuationSchema}
    ])
],
  controllers: [StartUpValuationController]
})
export class StartUpValuationModule {}
