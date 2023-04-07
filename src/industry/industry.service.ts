import { Injectable} from '@nestjs/common';
import {COEMethodsService,RiskFreeRatesService,ExpMarketReturnsService,BetaService,RiskPremiumService} from '../masters/masters.service';

@Injectable()
export class IndustryService {
  constructor(
    private readonly coeMethodService: COEMethodsService,
    private readonly riskFreeRateService: RiskFreeRatesService,
    private readonly expMarketReturnService: ExpMarketReturnsService,
    private readonly betaService: BetaService,
    private readonly riskPremiumService: RiskPremiumService,
    ) {}

 async getDiscountingFactor(inputs:any): Promise<number> {
    const{coeMethodId,riskFreeRateId,expMarketReturnId,betaId,riskPremiumId}=inputs;
    const coeMethod = await this.coeMethodService.getCOEMethodById(coeMethodId);
    const riskFreeRate = await this.riskFreeRateService.getRiskFreeRateById(riskFreeRateId);
    const expMarketReturn = await this.expMarketReturnService.getExpMarketReturnById(expMarketReturnId);
    const beta = await this.betaService.getBetaById(betaId);

    //Cost of Equity Calculation, formula: =+C15+(C16-C15)*C17
     const COECalculation=riskFreeRate.rate+(expMarketReturn.rate-riskFreeRate.rate)*beta.rate;

     //Company Specific Risk Premium
     const riskPremium = await this.riskPremiumService.getRiskPremiumById(riskPremiumId);

     //Adjusted Cost of Equity, formula: =+C18+C19
      const adjustedCostOfEquity=COECalculation+riskPremium.riskPremium;
    
     //Cost of Preference Share Capital
     const COPShareCapital=1;

     //WACC, formula: =+C20*C28+C24*(1-C7)*C27+C22*C29
     const wacc=adjustedCostOfEquity;
    return wacc;
  }
}