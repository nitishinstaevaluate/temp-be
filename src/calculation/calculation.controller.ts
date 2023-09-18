import { Controller,Get,Put,Post } from '@nestjs/common';
import { CalculationService} from './calculation.service'; 

@Controller('calculation')
export class CalculationController {}

//Beta Industries Controller
@Controller('calculatedwacc')
export class WaccController {
  constructor(private calculationService: CalculationService) { }

  @Get()
  async findAll(
    // @Param('industryId') industryId: string,
  ): Promise<any> {
    return this.calculationService.calculateWACC();
  }

//   @Get(':industryId')
//   async findByID(@Param('industryId') id: string): Promise<BetaIndustry[]> {
//     return this.betaIndustriesService.getBetaIndustriesById(id);
//   }

}