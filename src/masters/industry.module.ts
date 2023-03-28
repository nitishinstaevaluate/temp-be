import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IndustriesController,ValuationMethodsController } from './dropDowns.controller';
import { IndustriesService } from './Industry.service';
import { IndustrySchema,ValuationMethodSchema } from './schema/dropDowns.schema';
import { ValuationMethodsService } from './valuationMethods.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'industry',schema: IndustrySchema }]),MongooseModule.forFeature([{ name: 'valuationMethod',schema: ValuationMethodSchema }])],
  controllers: [IndustriesController,ValuationMethodsController],
  providers: [IndustriesService,ValuationMethodsService],
})
export class IndustriesModule {}