import { Injectable, NestInterceptor, ExecutionContext, CallHandler,BadRequestException  } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class MyMiddleware implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const inputs = req.body;
    const {model,discountingPeriod}=inputs;
    
console.log('Middleware: This is Valuation Process Validation Middleware.');

 
 //discountingPeriod Validation
 const discountingPeriods=['Full_Period','Mid_Period'];
    if(!discountingPeriods.includes(discountingPeriod))
    throw new BadRequestException('Invalid discounting period.');

    //models Validation   
    const developedModels=["FCFE","FCFF"];
    if(developedModels.includes(model))
    return next.handle();
    
    const futureModels=['Excess_Earnings','Relative_Valuation','CTM','NAV'];
   if (futureModels.includes(model))
    throw new BadRequestException('This model is Under Development');
   else 
   throw new BadRequestException('Invalid Model: Input a valid model name.');
  }
  
}
