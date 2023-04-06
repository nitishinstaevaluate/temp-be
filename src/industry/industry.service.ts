import { Injectable } from '@nestjs/common';

@Injectable()
export class IndustryService {
  
  private readonly value: number = 2;

  getDiscountingFactor(inputs:any): number {
    const {coeMethodId,riskFreeRateId,expMarketReturnId}=inputs;
    console.log(coeMethodId,riskFreeRateId,expMarketReturnId);
    return this.value;
  }
}