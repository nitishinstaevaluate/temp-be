import { Injectable } from '@nestjs/common';

// @Injectable()
// export class CalculationService {}

// Indian Treasury Yield Service
@Injectable()
export class CalculationService {
  constructor(
    // @InjectModel('indianTreasuryYield')
    // private readonly indianTresauryYieldModel: Model<IndianTreasuryYieldDocument>
  ) { }

  async calculateWACC(): Promise<any> {
    return {
        result: 'cagr',
        valuationDate : 'valuationDate',
        close: close[0],
        open: open[0],
        message: 'BSE 500 historical return CAGR in %',
        status: true
      }
  }

//   async getIndianTreasuryYieldById(id: string): Promise<any> {
//     return 1
//   }
}
