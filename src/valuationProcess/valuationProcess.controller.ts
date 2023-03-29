import { Body, Controller,Post} from '@nestjs/common';
import * as XLSX from 'xlsx';
import {FCFEMethod } from './calculationMethods';
import { ValuationsService } from './valuationProcess.service';

@Controller('valuationProcess')
export class ValuationController {

  constructor(private valuationsService: ValuationsService) {}

  @Post()
 async processExcelFile (@Body() inputs): Promise<any> {
    
const workbook = XLSX.readFile('./uploads/FCFE_Template.xlsx');
const worksheet1 = workbook.Sheets['P&L'];
const sheet1 = XLSX.utils.sheet_to_json(worksheet1);
const worksheet2 = workbook.Sheets['BS'];
const sheet2 = XLSX.utils.sheet_to_json(worksheet2);
// return {"sheet1":sheet1,"sheet2":sheet2};

//get all input values which we needs in calculation from sheet1 and sheet2.
 console.log('Inputs',inputs);
const {model,company}=inputs;

// Performe calculation by specific method
if(model==="FCFE"){
  const valuationResult= FCFEMethod(inputs);

  // Store the result in Database
  const data={
  "company":company,
  "model":model,
  "valuationData":valuationResult,
  "userId":"dfsdfs"
  };
  this.valuationsService.createValuation(data);
  
  // Send Output Response.
     return  valuationResult;
}else{
  return "Invalid Model: Input a valid model name.";
}
  }
}