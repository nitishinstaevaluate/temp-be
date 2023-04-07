import { Injectable} from '@nestjs/common';
import {COEMethodsService,RiskFreeRatesService,ExpMarketReturnsService} from '../masters/masters.service';

@Injectable()
export class IndustryService {
  constructor(
    private readonly coeMethodService: COEMethodsService,
    private readonly riskFreeRateService: RiskFreeRatesService,
    private readonly expMarketReturnService: ExpMarketReturnsService
    ) {}

  private readonly value: number = 2;

 async getDiscountingFactor(inputs:any): Promise<number> {
    const{coeMethodId,riskFreeRateId,expMarketReturnId}=inputs;
    console.log(coeMethodId,riskFreeRateId,expMarketReturnId);
    const coeMethod = await this.coeMethodService.getCOEMethodById(coeMethodId);
    const riskFreeRate = await this.riskFreeRateService.getRiskFreeRateById(riskFreeRateId);
    const expMarketReturn = await this.expMarketReturnService.getExpMarketReturnById(expMarketReturnId);


    console.log('Testing',coeMethod,riskFreeRate,expMarketReturn)
    return this.value;
  }
}