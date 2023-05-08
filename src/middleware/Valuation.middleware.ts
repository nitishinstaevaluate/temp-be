import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MyMiddleware implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const inputs = req.body;
    const {
      userId,
      excelSheetId,
      valuationDate,
      company,
      projectionYears,
      model,
    } = inputs;

    console.log('Middleware: This is Valuation Process Validation Middleware.');
    if (!userId) throw new BadRequestException('userId is required.');
    if (!excelSheetId)
      throw new BadRequestException('excelSheetId is required.');

    if (!projectionYears)
      throw new BadRequestException('projectionYears is required.');

    if (!valuationDate)
      throw new BadRequestException('valuationDate is required.');

    if (!model) throw new BadRequestException('model is required.');

    const futureModels = ['Excess_Earnings', 'CTM', 'NAV'];
    if (futureModels.includes(model))
      throw new BadRequestException('This model is Under Development');

    //models Validation
    const developedModels = ['FCFE', 'FCFF', 'Relative_Valuation'];
    if (!developedModels.includes(model))
      throw new BadRequestException('Invalid Model: Input a valid model name.');

    if (!company) throw new BadRequestException('company is required.');
    if (model === 'FCFE' || model === 'FCFF') {
      const { industry, coeMethod, discountingPeriod, outstandingShares } =
        inputs;
      if (!industry) throw new BadRequestException('industry is required.');
      else if (!coeMethod)
        throw new BadRequestException('coeMethod is required.');
      else if (!discountingPeriod)
        throw new BadRequestException('discountingPeriod is required.');
      else if (!outstandingShares)
        throw new BadRequestException('outstandingShares is required.');

      if (coeMethod === 'CAPM') {
        const {
          riskFreeRateType,
          riskFreeRate,
          expMarketReturn,
          beta,
          riskPremium,
        } = inputs;
        if (riskFreeRateType === 'user_input_year') {
          const { riskFreeRateYear } = inputs;
          if (!riskFreeRateYear)
            throw new BadRequestException('riskFreeRateYear is required.');
        }
        if (!riskFreeRate)
          throw new BadRequestException('riskFreeRate is required.');
        else if (!expMarketReturn)
          throw new BadRequestException('expMarketReturn is required.');
        else if (!beta) throw new BadRequestException('beta is required.');
        else if (!riskPremium)
          throw new BadRequestException('riskPremium is required.');
      }
      //discountingPeriod Validation
      const discountingPeriods = ['Full_Period', 'Mid_Period'];
      if (!discountingPeriods.includes(discountingPeriod))
        throw new BadRequestException('Invalid discounting period.');
    }

    if(model==="FCFF"){
     const {taxRate,copShareCapital}=inputs; 
     if (!taxRate) throw new BadRequestException('taxRate is required.');
     else if (!copShareCapital) throw new BadRequestException('copShareCapital is required.');
    }

    if (model === 'Relative_Valuation') {
      const { companies, discountRate, discountRateValue } = inputs;
      if (!companies) throw new BadRequestException('companies is required.');
      else if (!discountRate)
        throw new BadRequestException('discountRate is required.');
      else if (!discountRateValue)
        throw new BadRequestException('discountRateValue is required.');
    }
    return next.handle();
  }
}
