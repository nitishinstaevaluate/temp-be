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
        result: 13.54,
        valuationDate : 'valuationDate',
        close: 1000,
        open: 500,
        message: 'BSE 500 historical return CAGR in %',
        status: true
      }
  }

//   async getIndianTreasuryYieldById(id: string): Promise<any> {
//     return 1
//   }
}
