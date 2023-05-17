import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  Get,
  Param,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ValuationsService } from './valuationProcess.service';
import { ValuationMethodsService } from './valuation.methods.service';
import { MyMiddleware } from '../middleware/Valuation.middleware';
@Controller('valuationProcess')
@UseInterceptors(MyMiddleware)
export class ValuationProcessController {
  constructor(
    private valuationsService: ValuationsService,
    private valuationMethodsService: ValuationMethodsService,
  ) {}

  @Post()
  async processExcelFile(@Body() inputs): Promise<any> {
    const { model, company, userId, excelSheetId } = inputs;

    const workbook = XLSX.readFile(`./uploads/${excelSheetId}`);
    const worksheet1 = workbook.Sheets['P&L'];

    const worksheet2 = workbook.Sheets['BS'];

    // Performe calculation by specific method
    if (model === 'FCFE') {
      const valuationResponse = await this.valuationMethodsService.FCFEMethod(
        inputs,
        worksheet1,
        worksheet2,
      );
      if (valuationResponse.result === null) return valuationResponse.msg;

      const valuationResult = valuationResponse.result;
      // Store the result in Database
      const data = {
        company: company,
        model: model,
        valuation:245387,
        inputData: inputs,
        valuationData: valuationResult,
        userId: userId,
      };
      const reportId = await this.valuationsService.createValuation(data);

      // Send Response.
      return { reportId: reportId, valuationData: valuationResult };
    } else if (model === 'FCFF') {
      const valuationResponse = await this.valuationMethodsService.FCFFMethod(
        inputs,
        worksheet1,
        worksheet2,
      );
      if (valuationResponse.result === null) return valuationResponse.msg;

      const valuationResult = valuationResponse.result;
      // Store the result in Database
      const data = {
        company: company,
        model: model,
        valuation:348383,
        inputData: inputs,
        valuationData: valuationResult,
        userId: userId,
      };
      const reportId = await this.valuationsService.createValuation(data);

      // Send Response.
      return { reportId: reportId, valuationData: valuationResult };
    } else if (model === 'Relative_Valuation') {
      const valuationResponse =
        await this.valuationMethodsService.Relative_Valuation_Method(
          inputs,
          worksheet1,
          worksheet2,
        );
      if (valuationResponse.result === null) return valuationResponse.msg;

      const valuationResult = valuationResponse.result;
      // Store the result in Database
      const data = {
        company: company,
        model: model,
        valuation:845397,
        inputData: inputs,
        valuationData: valuationResult,
        userId: userId,
      };
      const reportId = await this.valuationsService.createValuation(data);

      // Send Response.
      return { reportId: reportId, valuationData: valuationResult };
    }
  }
}

//Industries Controller
@Controller('valuations')
export class ValuationsController {
  constructor(private valuationsService: ValuationsService) {}
  @Get(':userId')
  async findAllByUserId(@Param('userId') userId: string): Promise<any[]> {
    return this.valuationsService.getValuationsByUserId(userId);
  }
}
