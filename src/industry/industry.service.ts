import { Injectable, Inject } from '@nestjs/common';
import {COEMethodsService} from '../masters/masters.service';

@Injectable()
export class IndustryService {
  // constructor(@Inject(COEMethodsService)  private coeMethodService: COEMethodsService) {}
  constructor(private readonly coeMethodService: COEMethodsService) {}
  // constructor(
  //   private coeMethodService: COEMethodsService,
  //   // private riskFreeRateService: RiskFreeRatesService,
  //   // private expMarketReturnService: ExpMarketReturnsService
  //   ) {}
  private readonly value: number = 2;

 async getDiscountingFactor(inputs:any): Promise<number> {
    const {coeMethodId,riskFreeRateId,expMarketReturnId}=inputs;
    console.log(coeMethodId,riskFreeRateId,expMarketReturnId);
    const coe = await this.coeMethodService.getCOEMethods();
    console.log('Testing',coe)
    return this.value;
  }
}