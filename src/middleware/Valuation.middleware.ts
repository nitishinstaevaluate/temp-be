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
      industry,
      projectionYears,
      model,
      discountingPeriod,
    } = inputs;

    console.log('Middleware: This is Valuation Process Validation Middleware.');
    if (!userId) throw new BadRequestException('userId is required.');
    if (!excelSheetId)
      throw new BadRequestException('excelSheetId is required.');

    if (!valuationDate)
      throw new BadRequestException('valuationDate is required.');

    if (!company) throw new BadRequestException('company is required.');

    if (!industry) throw new BadRequestException('industry is required.');
    if (!projectionYears)
      throw new BadRequestException('projectionYears is required.');
    if (!model) throw new BadRequestException('model is required.');

    //discountingPeriod Validation
    const discountingPeriods = ['Full_Period', 'Mid_Period'];
    if (!discountingPeriods.includes(discountingPeriod))
      throw new BadRequestException('Invalid discounting period.');

    const futureModels = ['Excess_Earnings', 'CTM', 'NAV'];
    if (futureModels.includes(model))
      throw new BadRequestException('This model is Under Development');

    //models Validation
    const developedModels = ['FCFE', 'FCFF', 'Relative_Valuation'];
    if (!developedModels.includes(model))
      throw new BadRequestException('Invalid Model: Input a valid model name.');

    if (model === 'Relative_Valuation') {
      const { companies } = inputs;
      if (!companies) throw new BadRequestException('companies is required.');
    }
    return next.handle();
  }
}
