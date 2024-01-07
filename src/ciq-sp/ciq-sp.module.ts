import { Module } from '@nestjs/common';
import { CiqSpService } from '../ciq-sp/ciq-sp.service';
import { CiqSpController } from './ciq-sp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SnowflakeClientServiceService } from 'src/snowflake/snowflake-client-service.service';
import { ciqsimpleindustrySchema, ciqindustryhierarchySchema, ciqcompanystatustypeSchema, ciqcompanytypeSchema } from './schema/ciq-sp.chema';

@Module({
  providers: [CiqSpService,SnowflakeClientServiceService],
  controllers: [CiqSpController],
  imports:[MongooseModule.forFeature([
    {name: 'ciqsimpleindustry', schema : ciqsimpleindustrySchema},
    {name: 'ciqindustryhierarchy', schema : ciqindustryhierarchySchema},
    {name:'ciqcompanystatustype', schema : ciqcompanystatustypeSchema},
    {name:'ciqcompanytype', schema : ciqcompanytypeSchema}
  ])]
})
export class CiqSpModule {}