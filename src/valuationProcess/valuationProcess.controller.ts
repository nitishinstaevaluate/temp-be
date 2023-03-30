import { Body, Controller,Post} from '@nestjs/common';
import * as XLSX from 'xlsx';
import {FCFEMethod } from './calculationMethods';
import { ValuationsService } from './valuationProcess.service';

@Controller('valuationProcess')
export class ValuationController {

  constructor(private valuationsService: ValuationsService) {}

  @Post()
 async processExcelFile (@Body() inputs): Promise<any> {
    
  //get all input values which we needs in calculation from sheet1 and sheet2.
 const {model,company,userId,excelSheetId}=inputs;

const workbook = XLSX.readFile(`./uploads/${excelSheetId}`);
const worksheet1 = workbook.Sheets['P&L'];
const sheet1 = XLSX.utils.sheet_to_json(worksheet1);
const worksheet2 = workbook.Sheets['BS'];
const sheet2 = XLSX.utils.sheet_to_json(worksheet2);
// return {"sheet1":sheet1,"sheet2":sheet2};

// Performe calculation by specific method
if(model==="FCFE"){
  const valuationResult= await FCFEMethod(inputs);

  // Store the result in Database
  const data={
  "company":company,
  "model":model,
  "valuationData":valuationResult,
  "userId":userId
  };
 const reportId= await this.valuationsService.createValuation(data);
  
  // Send Valuation Report Id in  Response.
     return  {"reportId":reportId};
}else{
  return "Invalid Model: Input a valid model name.";
}
  }
}