import { Controller,Post } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Controller('valuationProcess')
export class ValuationController {
  @Post()
  processExcelFile(): any {
    
    const workbook = XLSX.readFile('./uploads/FCFE_Template.xlsx');
    const worksheet1 = workbook.Sheets['P&L'];
const sheet1 = XLSX.utils.sheet_to_json(worksheet1);
const worksheet2 = workbook.Sheets['BS'];
const sheet2 = XLSX.utils.sheet_to_json(worksheet2);
    return {"sheet1":sheet1,"sheet2":sheet2};
  }
}