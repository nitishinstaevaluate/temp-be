import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateIndustryDto } from './dto/createIndustry.dto';
import { IndustriesService } from './Industry.service';
import { Industry } from './schema/industries.schema';

@Controller('industries')
export class DropDownsController {
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