import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { generatePdf } from './exportResults.method';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import { CompaniesService } from 'src/masters/masters.service';
import { UsersService } from 'src/users/users.service';

@Controller('export')
export class ExportResultsController {
  constructor(
    private valuationsService: ValuationsService,
    private companiesService: CompaniesService,
    private usersService: UsersService,
  ) {}
  @Get(':reportId')
  async generatePdf(@Param('reportId') reportId: string, @Res() res: Response) {
    const valuation = await this.valuationsService.getValuationById(reportId);
    if (valuation) {
      const user = await this.usersService.getUserById(valuation.userId);
      valuation['user'] = user;
      if (valuation.model === 'Relative_Valuation') {
        const promises = valuation.inputData.companies.map((id) =>
          this.companiesService.getCompanyById(id),
        );
        const companies = await Promise.all(promises);
        valuation['companies'] = companies;
      }
      generatePdf(valuation, res);
    } else res.send(`Valuation Data not found for this reportId: ${reportId}`);
  }
}
