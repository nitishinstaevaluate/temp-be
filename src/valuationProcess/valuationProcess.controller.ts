import { Controller,Post,Request } from '@nestjs/common';
import * as XLSX from 'xlsx';
import {FCFEMethod } from './calculationMethods';
import { ValuationsService } from './valuationProcess.service';

@Controller('valuationProcess')
export class ValuationController {

  constructor(private valuationsService: ValuationsService) {}

  @Post()
  processExcelFile(@Request() req): any {
    
const workbook = XLSX.readFile('./uploads/FCFE_Template.xlsx');
const worksheet1 = workbook.Sheets['P&L'];
const sheet1 = XLSX.utils.sheet_to_json(worksheet1);
const worksheet2 = workbook.Sheets['BS'];
const sheet2 = XLSX.utils.sheet_to_json(worksheet2);
// return {"sheet1":sheet1,"sheet2":sheet2};

//get all input values which we needs in calculation from sheet1 and sheet2.
const inputValues={"value1":23,"value2":34};

// Performe calculation by specific method
const valuationResult= FCFEMethod(inputValues);

// Store the result in Database
const data={
"company":"ABC",
"modelId":"dfdsf",
"valuationData":valuationResult,
"userId":"dfsdfs"
};
this.valuationsService.createValuation(data);

// Send Output Response.
   return  valuationResult;
  }
}