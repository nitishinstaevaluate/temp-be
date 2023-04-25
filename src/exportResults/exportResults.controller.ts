import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { generatePdf } from './exportResults.method';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';

@Controller('export')
export class ExportResultsController {
  constructor(private valuationsService: ValuationsService) {}
  @Get(':reportId')
  async generatePdf(@Param('reportId') reportId: string, @Res() res: Response) {
    const valuation = await this.valuationsService.getValuationById(reportId);
    if (valuation) {
      generatePdf(valuation.valuationData, res);
    } else res.send(`Valuation Data not found for this reportId: ${reportId}`);
  }
}
