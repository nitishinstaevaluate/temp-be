import {
    Controller,
    Get,
    Post,
    Body,
    Delete,
    Param,
    Put,
    UploadedFile,
    UseInterceptors
  } from '@nestjs/common';

  import {
    BetaIndustry,
  } from './schema/data-references.schema';


  import {
    BetaIndustriesService,
  } from './data-references.service';

@Controller('data-references')
export class DataReferencesController {}

//Beta Industries Controller
@Controller('betaindustries')
export class BetaIndustriesController {
  constructor(private betaIndustriesService: BetaIndustriesService) { }

  @Get()
  async findAll(
    @Param('industryId') industryId: string,
  ): Promise<BetaIndustry[]> {
    return this.betaIndustriesService.getBetaIndustries();
  }

  @Get(':industryId')
  async findByID(@Param('industryId') id: string): Promise<BetaIndustry[]> {
    return this.betaIndustriesService.getBetaIndustriesById(id);
  }


}
