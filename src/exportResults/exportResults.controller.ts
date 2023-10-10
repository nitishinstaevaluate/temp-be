import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { generatePdf } from './exportResults.method';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import { UsersService } from 'src/users/users.service';
import { CustomLogger } from 'src/loggerService/logger.service';
import { AuthGuard } from '@nestjs/passport';
@Controller('export')
export class ExportResultsController {
  constructor(
    private readonly valuationsService: ValuationsService,
    private readonly usersService: UsersService,
    private readonly customLogger:CustomLogger,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':reportId')
  async generatePdf(@Param('reportId') reportId: string, @Res() res: Response) {
    this.customLogger.log({
      message: 'Request is entered into exportResults Controller.',
     });
    const valuation = await this.valuationsService.getValuationById(reportId);
    if (valuation) {
      const user = await this.usersService.getUserById(valuation.userId);
      valuation['user'] = user;
      generatePdf(valuation, res);
      this.customLogger.log({
        message: 'Export Pdf Request is executed successfully.',
       });
    } else res.send(`Valuation Data not found for this reportId: ${reportId}`);
  }
}
