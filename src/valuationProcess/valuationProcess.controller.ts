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
import {
  calculateDaysFromDate,
  isLeapYear,
} from '../excelFileServices/common.methods';
@Controller('valuationProcess')
@UseInterceptors(MyMiddleware)
export class ValuationProcessController {
  constructor(
    private valuationsService: ValuationsService,
    private valuationMethodsService: ValuationMethodsService,
  ) {}

  @Post()
  async processExcelFile(@Body() inputs): Promise<any> {
    const { model, valuationDate, company, userId, excelSheetId } = inputs;

    const workbook = XLSX.readFile(`./uploads/${excelSheetId}`);
    const worksheet1 = workbook.Sheets['P&L'];
    const worksheet2 = workbook.Sheets['BS'];

    //if we want to get date from excel sheet.
    // const B1Cell = worksheet1['B1'];
    // const B1Value = B1Cell.v;
    // const data = B1Value.split(',');
    // const date = data[2];
    
    if (model === 'FCFE' || model === 'FCFF') {
      const plDays = calculateDaysFromDate(valuationDate);
      const date = new Date(valuationDate);
      const totalDays = isLeapYear(date.getFullYear()) ? 366 : 365;
      if (plDays <totalDays) {
        console.log(
          'Testing....................',
          'Date: ',
          valuationDate,
          'Days:',
          plDays,
        );
        // Change column B values for worksheet1
        const range = XLSX.utils.decode_range(worksheet1['!ref']);

        for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: 1 }); // Column B
          const cell = worksheet1[cellAddress];
          if (cell && cell.t === 'n') {
            // Check if the cell contains a number
            cell.v = (cell.v / plDays) * (365 - plDays) + cell.v;
          }
        }

        // Change column B values for worksheet2
        const range2 = XLSX.utils.decode_range(worksheet2['!ref']);

        for (let rowNum = range2.s.r + 1; rowNum <= range2.e.r; rowNum++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: 1 }); // Column B
          const cell = worksheet2[cellAddress];
          if (cell && cell.t === 'n') {
            // Check if the cell contains a number
            cell.v = (cell.v / plDays) * (365 - plDays) + cell.v;
          }
        }
      }
    }

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
        valuation: valuationResponse.valuation,
        inputData: inputs,
        valuationData: valuationResult,
        userId: userId,
      };
      console.log(inputs);
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
        valuation: valuationResponse.valuation,
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
        valuation: valuationResponse.valuation,
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
