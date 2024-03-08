import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as stream from 'stream';
import * as ExcelJS from 'exceljs';
import { columnsList } from './excelSheetConfig';
import { AuthGuard } from '@nestjs/passport';
import { MODEL } from 'src/constants/constants';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';

@Controller('download')
export class ExportTemplateController {

  // @UseGuards(KeyCloakAuthGuard)
  @Get('/template/:projectionYears/:modelName')
  async download(
    @Param('projectionYears') projectionYears: number,
    @Param('modelName') modelName: string | undefined,
    @Res() res: Response,
  ) {
   try{
    if(modelName === MODEL[6]){
      const filePath = `template/ruleElevenUaTemplate.xlsx`;
      const buffer = fs.readFileSync(filePath);

      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename= Template-${new Date().getTime()}.xlsx`,
      );
    
      res.send(buffer);
    return;
    }
    const filePath = `template/test-template.xlsx`;

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet:any = workbook.getWorksheet(1);
    const currentYear = new Date().getFullYear();
    worksheet.getColumn(
      'B',
    ).header = `'{{Add provisional financial date in DD-MM-YYYY}}`
    // `Provisionals/Audited Nos. close to valuation, ${currentYear - 1}-${currentYear}`;
    // Add new columns with headers
    let count = 0;
    for (let i = 1; i <= projectionYears; i++) {
      worksheet.getColumn(columnsList[i]).header = `${+currentYear + count}-${
        currentYear + i
      }`;
      count++;
    }

    const getProfitLossFirstRow = await this.getFirstRowIndexName(worksheet);
    await this.updateExcelFormulas(worksheet,getProfitLossFirstRow);

    const worksheet2:any = workbook.getWorksheet(2);
    worksheet2.getColumn(
      'B',
    ).header = `'{{Add provisional financial date in DD-MM-YYYY}}`
    // `Provisionals/Audited Nos. close to valuation, ${currentYear - 1}-${currentYear}`;
    // Add new columns with headers
    let count2 = 0;
    for (let i = 1; i <= projectionYears; i++) {
      worksheet2.getColumn(columnsList[i]).header = `${currentYear + count2}-${
        currentYear + i
      }`;
      count2++;
    }
  
    const getBalanceSheetFirstRow = await this.getFirstRowIndexName(worksheet2)
    await this.updateExcelFormulas(worksheet2,getBalanceSheetFirstRow)

    const buffer = await workbook.xlsx.writeBuffer();
    const fileStream = new stream.PassThrough();
    fileStream.end(buffer);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename= Template-${new Date().getTime()}.xlsx`,
    );

    fileStream.pipe(res);
   }
   catch(error){
    console.log(error);
    throw error;
   }
  }

  async getFirstRowIndexName(worksheet){
   try{
    let  firstRowName=[]
    let letterIndex = 65; //starting capital letter in ascii format
    let letter;
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (rowNumber === 1 && cell.text) {
              letter = String.fromCharCode(letterIndex);
              firstRowName.push(letter);
            }
            letterIndex++;
          });
      });

    return firstRowName;
   }
   catch(error){
    throw error;
   }
  }
 
  async updateExcelFormulas(worksheet,firsRowName){
   try{
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (cell.formula) {
          for (let i = 0; i < firsRowName.length; i++) {
            if(firsRowName[i] !== 'A' && firsRowName[i] !== 'B'){
              const columnLetter = String.fromCharCode(65 + colNumber - 1);
              const cellAddress = columnLetter + rowNumber;
              const newCellAddress = firsRowName[i] + rowNumber;
              worksheet.getCell(`${newCellAddress}`).value = { sharedFormula: `${cellAddress}`, result: 0 };
            }
            // if(firsRowName[i]==='B'){   //Add date validation in excel 
            //   const dateValidationOptions = {
            //     type: 'date',
            //     operator: 'between',
            //     allowBlank: false,
            //     showInputMessage: true,
            //     formula1: '01-01-2000', // Start date in dd-mm-yyyy format
            //     formula2: '31-12-2022', // End date in dd-mm-yyyy format
            //     promptTitle: 'Date Validation',
            //     prompt: 'The date must be between 01-01-2022 and 31-12-2022',
            // };
            
            // // Set date validation for cell A1
            // worksheet.getCell('B1').dataValidation = dateValidationOptions;
            // }
          }
        }
      });
    });
   }
   catch(error){
    throw error;
   }
  }
}
