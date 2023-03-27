import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DropDownsController } from './dropDowns.controller';
import { IndustriesService } from './Industry.service';
import { IndustrySchema } from './schema/industries.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'industry',schema: IndustrySchema }])],
  controllers: [DropDownsController],
  providers: [IndustriesService],
})
export class IndustriesModule {}