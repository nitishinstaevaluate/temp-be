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
    const valuationData =[];
    const Pats=[];
    Pats.push(headingObj['pat']);
  // (valuation.valuationData as any[]).map((valuation)=>{
  //     Object.entries(valuation).forEach(([key, value]) => {
  //       if(key==="pat")
  //       Pats.push(value)
  //     });
  //   })
    Object.entries(valuation.valuationData[0]).forEach(([key, value]) => {
      valuationData.push([headingObj[key], value ]);
    });
    // valuationData.push(Pats);
    if(valuation){
      generatePdf(valuationData,res);
    }
  }
}
