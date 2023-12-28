import { Module } from '@nestjs/common';
import { CiqSpService } from '../ciq-sp/ciq-sp.service';
import { CiqSpController } from './ciq-sp.controller';
import { SnowflakeClientModule } from 'src/snowflake/snowflake-client.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SnowflakeClientServiceService } from 'src/snowflake/snowflake-client-service.service';
import { ciqsimpleindustrySchema, ciqindustryhierarchySchema } from './schema/ciq-sp.chema';

@Module({
  providers: [CiqSpService,SnowflakeClientServiceService],
  controllers: [CiqSpController],
  imports:[MongooseModule.forFeature([
    {name: 'ciqsimpleindustry', schema : ciqsimpleindustrySchema},
    {name: 'ciqindustryhierarchy', schema : ciqindustryhierarchySchema}
  ])]
})
export class CiqSpModule {}