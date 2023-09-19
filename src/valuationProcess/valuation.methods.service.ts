import { Injectable } from '@nestjs/common';
import { RelativeValuationService } from './relativeValuation.service';
import { FCFEAndFCFFService } from './fcfeAndFCFF.service';
import { ExcessEarningsService } from './excessEarnings.service';

//Valuation Methods Service
@Injectable()
export class ValuationMethodsService {
  constructor(
    private readonly relativeValuationService: RelativeValuationService,
    private readonly fcfeAndFCFFService: FCFEAndFCFFService,
    private readonly excessEarningsService: ExcessEarningsService,
  ) {}

  async FCFEMethod(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    // console.log("Hello Counter");
    return await this.fcfeAndFCFFService.FCFEAndFCFF_Common(
      inputs,
      worksheet1,
      worksheet2,
    );
  }
  async FCFFMethod(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    return await this.fcfeAndFCFFService.FCFEAndFCFF_Common(
      inputs,
      worksheet1,
      worksheet2,
    );
  }

  async Relative_Valuation_Method(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    return await this.relativeValuationService.Relative_Valuation(
      inputs,
      worksheet1,
      worksheet2,
    );
  }

  async Excess_Earnings_method(
    inputs: any,
    worksheet1: any,
    worksheet2: any,
  ): Promise<any> {
    return await this.excessEarningsService.Excess_Earnings(
      inputs,
      worksheet1,
      worksheet2,
    );
  }
}
