import { Controller,Get,Put,Post,Param, Query , Body, UseGuards} from '@nestjs/common';
import { CalculationService} from './calculation.service';

import { valuationWeightage } from "./dto/calculation.dto";
import { AuthGuard } from '@nestjs/passport';

@Controller('calculation')
export class CalculationController {
  constructor(private calculationService: CalculationService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('/weightedvaluation')
  createPost(@Body() body: valuationWeightage) {
    return this.calculationService.calculateWeightedVal(body);
  }
}



//Beta Industries Controller
@Controller('coe')
export class WaccController {
  constructor(private calculationService: CalculationService) { }

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
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
  
  @UseGuards(AuthGuard('jwt'))
  @Get('/industryOrCompanyBasedWacc')
  async calculateWacc(
    @Query('adjCoe') adjCoe: string,
    @Query('costOfDebt') costOfDebt: string,
    @Query('copShareCapital') copShareCapital: string,
    @Query('deRatio') deRatio: string,
    @Query('type') type: string,
    @Query('taxRate') taxRate: string,
    @Query('excelSheetId') excelSheetId: string,
    @Query('capitalStructure') capitalStructure: any = null
    ): Promise<any> {
    return this.calculationService.getWaccExcptTargetCapStrc(parseFloat(adjCoe),
    excelSheetId,
    parseFloat(costOfDebt),
    parseFloat(copShareCapital),
    parseFloat(deRatio),
    type,
    taxRate,
    capitalStructure)
  } 

}