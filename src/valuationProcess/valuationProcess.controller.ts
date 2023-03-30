import { Body, Controller,Post} from '@nestjs/common';
import * as XLSX from 'xlsx';
import {FCFEMethod } from './valuationProcess.method';
import { ValuationsService } from './valuationProcess.service';

@Controller('valuationProcess')
export class ValuationController {

  constructor(private valuationsService: ValuationsService) {}

  @Post()
 async processExcelFile (@Body() inputs): Promise<any> {
 const {model,company,userId,excelSheetId}=inputs;

const workbook = XLSX.readFile(`./uploads/${excelSheetId}`);
const worksheet1 = workbook.Sheets['P&L'];

// const worksheet2 = workbook.Sheets['BS'];
// const sheet2 = XLSX.utils.sheet_to_json(worksheet2);

// Performe calculation by specific method
if(model==="FCFE"){
  const valuationResult= await FCFEMethod(inputs,worksheet1);

  // Store the result in Database
  const data={
  "company":company,
  "model":model,
  "valuationData":valuationResult,
  "userId":userId
  };
 const reportId= await this.valuationsService.createValuation(data);
  
  // Send Valuation Report Id in  Response.
    //  return  {"reportId":reportId};
    return valuationResult;
}else{
  return "Invalid Model: Input a valid model name.";
}
  }
}