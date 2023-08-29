import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ValuationsService } from './valuationProcess.service';
import { ValuationMethodsService } from './valuation.methods.service';
import { MyMiddleware } from '../middleware/Valuation.middleware';
import {
  calculateDaysFromDate,
} from '../excelFileServices/common.methods';
import {CapitalStruc} from '../excelFileServices/fcfeAndFCFF.method';
import { utilsService } from 'src/utils/utils.service';
import { CustomLogger } from 'src/loggerService/logger.service';
@Controller('valuationProcess')
@UseInterceptors(MyMiddleware)
export class ValuationProcessController {
  constructor(
    private valuationsService: ValuationsService,
    private valuationMethodsService: ValuationMethodsService,
    private customLogger: CustomLogger,
  ) {}

  @Post()
  async processExcelFile(@Body() inputs): Promise<any> {
    console.log("Initiating Process");
    console.log(inputs);
    this.customLogger.log({
      message: 'Request is entered into Valuation Process Controller.',
      userId: inputs.userId,
    });
    const { model, valuationDate, company, userId, excelSheetId } = inputs;
let workbook=null;
    try{
   workbook = XLSX.readFile(`./uploads/${excelSheetId}`);
}catch{
  this.customLogger.log({
    message: `excelSheetId: ${excelSheetId} not available`,
    userId: inputs.userId,
  });
  return {
    result: null,
    msg: `excelSheetId: ${excelSheetId} not available`,
  };
}
    const worksheet1 = workbook.Sheets['P&L'];
    const worksheet2 = workbook.Sheets['BS'];
    let capitalStruc: any;

    // capitalStruc = await CapitalStruc(i,worksheet2);
    // console.log(capitalStruc.debtProp);

    //if we want to get date from excel sheet.
    // const B1Cell = worksheet1['B1'];
    // const B1Value = B1Cell.v;
    // const data = B1Value.split(',');
    // const date = data[2];

    if (model === 'FCFE' || model === 'FCFF') {
      // const plDays = calculateDaysFromDate(new Date(valuationDate));
      // const date = new Date(valuationDate);
      // const totalDays = isLeapYear(date.getFullYear()) ? 366 : 365;
      // if (plDays <totalDays) {
        console.log(
          'Running Valuation ..............',
          'Date: ',
          valuationDate,
          // 'Days:',
          // plDays.dateDiff,
        );
        // Change column B values for worksheet1
        const range = XLSX.utils.decode_range(worksheet1['!ref']);

        for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: 1 }); // Column B
          const cell = worksheet1[cellAddress];
          if (cell && cell.t === 'n') {
            // Check if the cell contains a number
            // cell.v = (cell.v / plDays) * (365 - plDays) + cell.v;
          }
        }

        // Change column B values for worksheet2
        const range2 = XLSX.utils.decode_range(worksheet2['!ref']);

        for (let rowNum = range2.s.r + 1; rowNum <= range2.e.r; rowNum++) {
          const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: 1 }); // Column B
          const cell = worksheet2[cellAddress];
          if (cell && cell.t === 'n') {
            // Check if the cell contains a number
            // cell.v = (cell.v / plDays) * (365 - plDays) + cell.v;
          }
        }
      // }
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
      // console.log(inputs);
      const reportId = await this.valuationsService.createValuation(data);
      this.customLogger.log({
        message:
          ' FCFE Request is sucessfully executed in Valuation Process Controller.',
        userId: inputs.userId,
      });
      // Send Response.
      return { reportId: reportId, valuationData: valuationResult };
    } else if (model === 'FCFF') {
      const valuationResponse = await this.valuationMethodsService.FCFFMethod(
        inputs,
        worksheet1,
        worksheet2,
      );
      // console.log(inputs);
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
      this.customLogger.log({
        message:
          'FCFF Request is sucessfully executed in Valuation Process Controller.',
        userId: inputs.userId,
      });
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
      this.customLogger.log({
        message:
          'Relative Valuation Request is sucessfully executed in Valuation Process Controller.',
        userId: inputs.userId,
      });
      // Send Response.
      return { reportId: reportId, valuationData: valuationResult };
    }
  }
}

//Industries Controller
@Controller('valuations')
export class ValuationsController {
  
  constructor(private valuationsService: ValuationsService,
    private readonly utilsService: utilsService) {}

  @Get(':userId')
  async findAllByUserId(@Param('userId') userId: string): Promise<any[]> {
    return this.valuationsService.getValuationsByUserId(userId);
  }

  @Get('paginate/:ids')
  async getPaginatedValuations(
    @Param('ids') ids: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
  ) :Promise<any>{
    return this.utilsService.paginateValuationByUserId(ids,page,pageSize);
  }
}
