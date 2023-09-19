import { Controller,Get,Put,Post,Param, Query } from '@nestjs/common';
import { CalculationService} from './calculation.service'; 

@Controller('calculation')
export class CalculationController {}

//Beta Industries Controller
@Controller('coe')
export class WaccController {
  constructor(private calculationService: CalculationService) { }

  @Get('/adjcoe')
  async find(
    @Query('riskFreeRate') riskFreeRate: string,
    @Query('expMarketReturn') expMarketReturn: string,
    @Query('beta') beta: string,
    @Query('riskPremium') riskPremium: string,
    @Query('coeMethod') coeMethod: string,
  ): Promise<any> {
    return this.calculationService.adjCOE(parseFloat(riskFreeRate), parseFloat(expMarketReturn), parseFloat(beta), parseFloat(riskPremium),coeMethod);
  }

  @Get('/wacc')
  async findByID(
    @Query('adjustedCostOfEquity') adjustedCostOfEquity: string,
    @Query('equityProp') equityProp: string,
    @Query('costOfDebt') costOfDebt: string,
    @Query('taxRate') taxRate: string,
    @Query('debtProp') debtProp: string,
    @Query('copShareCapital') copShareCapital: string,
    @Query('prefProp') prefProp: string,
    @Query('coeMethod') coeMethod: string,
    ): Promise<any> {
    return this.calculationService.getWACC(parseFloat(adjustedCostOfEquity),parseFloat(equityProp),
    parseFloat(costOfDebt),
    parseFloat(taxRate),
    parseFloat(debtProp),
    parseFloat(copShareCapital),
    parseFloat(prefProp),
    coeMethod)
  }

}