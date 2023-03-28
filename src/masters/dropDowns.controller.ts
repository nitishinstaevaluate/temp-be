import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateIndustryDto,CreateValuationMethodDto } from './dto/dropDowns.dto';
import { IndustriesService } from './Industry.service';
import { ValuationMethodsService } from './valuationMethods.service';
import { Industry,ValuationMethod } from './schema/dropDowns.schema';

@Controller('industries')
export class IndustriesController {
  constructor(private industriesService: IndustriesService) {}

  @Post()
  async create(@Body() createIndustryDto: CreateIndustryDto) {
    return this.industriesService.createIndustry(createIndustryDto);
  }

  @Get()
  async findAll(): Promise<Industry[]> {
    return this.industriesService.getIndustries();
  }
}

@Controller('valuationMethods')
export class ValuationMethodsController {
  constructor(private methodService: ValuationMethodsService) {}

  @Post()
  async create(@Body() methodDto: CreateValuationMethodDto) {
    return this.methodService.createValuationMethod(methodDto);
  }

  @Get()
  async findAll(): Promise<ValuationMethod[]> {
    return this.methodService.getValuationMethods();
  }
}