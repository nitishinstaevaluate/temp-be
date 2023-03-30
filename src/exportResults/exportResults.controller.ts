import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { generatePdf } from './exportResults.method';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import { headingObj } from './exportResults.data';

@Controller('export')
export class ExportResultsController {
  constructor(private valuationsService: ValuationsService) {}
  @Get((':reportId'))
  async generatePdf(@Param('reportId') reportId: string,@Res() res: Response) {
    const valuation=await this.valuationsService.getValuationById(reportId);
    const valuationData = [];
    Object.entries(valuation.valuationData).forEach(([key, value]) => {
      valuationData.push([headingObj[key], value ]);
    });
    if(valuation){
      generatePdf(valuationData,res);
    }
  }
}
