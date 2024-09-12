import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as stream from 'stream';
import * as ExcelJS from 'exceljs';
import { columnsList } from './excelSheetConfig';
import { AuthGuard } from '@nestjs/passport';
import { MODEL } from 'src/constants/constants';
import { KeyCloakAuthGuard } from 'src/middleware/key-cloak-auth-guard';
import { templateYearSet } from './common.methods';

@Controller('download')
export class ExportTemplateController {

  // @UseGuards(KeyCloakAuthGuard)
  @Get('/template')
  async download(
    @Query('projectionYears') projectionYears: number,
    @Query('modelName') modelName: string | undefined,
    @Query('valuationDate') valuationDate: string | undefined,
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
    if(modelName === MODEL[8]){
      const filePath = `template/slumpSaleTemplate.xlsx`;
      const buffer = fs.readFileSync(filePath);

      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename= Template-${new Date().getTime()}.xlsx`,
      );
    
      res.send(buffer);
    return;
    }

    let PLheaderRow = ['A1']; // Starting of PL header row
    let BSheaderRow = ['A1']; // Starting of BS header row
    const filePath = `template/new-excel-template.xlsx`;

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
    const rawValuationDate = valuationDate || new Date().getTime();
    const getFinancialYearDate = await templateYearSet(+rawValuationDate);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    //#region Profit Loss excel
    /**
     * Profit Loss excel Sheet Index starts from 5
     */
    const worksheet:any = workbook.getWorksheet(2);
    
    PLheaderRow.push('B1')// Intentially pushing 'B' since we want to start adding years from C column and not from B
    const currentYear = new Date(getFinancialYearDate).getFullYear();
    worksheet.getColumn(
      'C',
    ).header = `'{{Add provisional financial date in DD-MM-YYYY}} format`;
    PLheaderRow.push('C1');
    // `Provisionals/Audited Nos. close to valuation, ${currentYear - 1}-${currentYear}`;
    // Add new columns with headers
    if(modelName !== 'marketApproach'){
      let count = 0;
      // Start for loop from C column incase of P&L, i = 2 
      // console.log(projectionYears,"projection years")
      for (let i = 1; i <= projectionYears; i++) {
        const columnLetter = columnsList[i+1];
        PLheaderRow.push(`${columnLetter}1`);
        const headerText = `${currentYear + count}-${currentYear + i}`;
        if(!headerText){
          // console.log(headerText,"all header", i)
        }
        // console.log(columnLetter,"column letter")
        worksheet.getColumn(columnLetter).header = headerText;
        worksheet.getColumn(columnLetter).width = 15;
        count++;
      }
    }

    // Set common styles for all headers
    await this.setHeaderStyles(worksheet, PLheaderRow, '195478', 'FFFFFF'); 
    await this.addCellAutoFilters(worksheet, PLheaderRow.length);
    
    const getProfitLossFirstRow = await this.getFirstRowIndexName(worksheet);
    await this.updateExcelFormulas(worksheet,getProfitLossFirstRow, 'P&L');
    //#endregion Profit Loss excel
    

    //#region Balance Sheet Excel
    /**
     * Balance Sheet Sheet Index starts from 5
     */
    const worksheet2:any = workbook.getWorksheet(5);
    worksheet2.getColumn(
      'B',
    ).header = `'{{Add provisional financial date in DD-MM-YYYY}} format`;
    BSheaderRow.push('B1');
    // `Provisionals/Audited Nos. close to valuation, ${currentYear - 1}-${currentYear}`;
    // Add new columns with headers
    if(modelName !== 'marketApproach'){
    let count2 = 0;
    for (let i = 1; i <= projectionYears; i++) {
      const columnLetter = columnsList[i];
        BSheaderRow.push(`${columnLetter}1`);
        const headerText = `${currentYear + count2}-${currentYear + i}`;
        worksheet2.getColumn(columnLetter).header = headerText;
        worksheet2.getColumn(columnLetter).width = 15;
      count2++;
    }
    }

    // Set common styles for all headers
    await this.setHeaderStyles(worksheet2, BSheaderRow, '195478', 'FFFFFF'); 
    await this.addCellAutoFilters(worksheet2, BSheaderRow.length);
  
    const getBalanceSheetFirstRow = await this.getFirstRowIndexName(worksheet2)
    await this.updateExcelFormulas(worksheet2,getBalanceSheetFirstRow, 'BS')
    //#endregion Balance Sheet Excel

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
    let firstRowName = [];
    let currentColumn = '';
    let letterIndex = 0;

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (rowNumber === 1 && cell.text) {
                if (letterIndex === 0) {
                    currentColumn = String.fromCharCode(65 + letterIndex); // 'A'
                } else {
                    currentColumn = this.getColumnLabel(letterIndex);
                }
                firstRowName.push(currentColumn);
                letterIndex++;
            }
        });
    });

    return firstRowName;
   }
   catch(error){
    throw error;
   }
  }
 
  /**
   * Create Excel using Shared formulae
   * @param worksheet 
   * @param firsRowName 
   * @param sheetName 
   */
  async updateExcelFormulas(worksheet,firsRowName, sheetName){
   try{
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (cell.value && 
          typeof cell.value === 'string' && 
          (
            cell.value.toLowerCase().includes("cash and cash equivalent") || 
            cell.value.toLowerCase().includes('retained earnings')
          ) 
        ) {
          for (let i = 0; i < firsRowName.length; i++) {
            if(sheetName === 'BS'){
              if(firsRowName[i] !== 'A' && firsRowName[i] !== 'B' ){
                const newCellAddress = firsRowName[i] + rowNumber;
                worksheet.getCell(newCellAddress).fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFBBBBBB' },
                  bgColor: { argb: 'FFBBBBBB' }
                };
              }
            }
          }
        }
        if (cell.formula) {
          for (let i = 0; i < firsRowName.length; i++) {
            if(sheetName === 'BS'){
              if(firsRowName[i] !== 'A' && firsRowName[i] !== 'B' ){
                const columnLetter = String.fromCharCode(65 + colNumber - 1);
                const cellAddress = columnLetter + rowNumber;
                const newCellAddress = firsRowName[i] + rowNumber;
                worksheet.getCell(newCellAddress).value = {
                  formula: this.replaceColumnReferences(worksheet.getCell(cellAddress).formula, 'B', `${firsRowName[i]}`),
                  result: 0
                };
             
                if (cell.fill) {
                  worksheet.getCell(newCellAddress).fill = {
                      type: 'pattern',
                      pattern: cell.fill.pattern,
                      fgColor: cell.fill.fgColor,
                      bgColor: cell.fill.bgColor
                  };
                }
                const prevCell = row.getCell(columnLetter); // Get previous cell in the same row
                if (prevCell.border) {
                    worksheet.getCell(newCellAddress).border = {
                        top: prevCell.border.top,
                        left: prevCell.border.left,
                        bottom: prevCell.border.bottom,
                        right: prevCell.border.right
                    };
                }
                if (prevCell.font && prevCell.font.bold) {
                  worksheet.getCell(newCellAddress).font = {
                      bold: true,
                  };
                }
              }
            }
            else{
              if(firsRowName[i] !== 'A' && firsRowName[i] !== 'B' && firsRowName[i] !== 'C'){
                const columnLetter = String.fromCharCode(65 + colNumber - 1);
                const cellAddress = columnLetter + rowNumber;
                const newCellAddress = firsRowName[i] + rowNumber;
                worksheet.getCell(newCellAddress).value = {
                  formula: this.replaceColumnReferences(worksheet.getCell(cellAddress).formula, 'C', `${firsRowName[i]}`),
                  result: 0
                };

                if (cell.fill) {
                  worksheet.getCell(newCellAddress).fill = {
                      type: 'pattern',
                      pattern: cell.fill.pattern,
                      fgColor: cell.fill.fgColor,
                      bgColor: cell.fill.bgColor
                  };
                }
                // console.log() BDBDBD
                const prevCell = row.getCell(columnLetter); // Get previous cell in the same row
                if (prevCell.border) {
                    worksheet.getCell(newCellAddress).border = {
                        top: prevCell.border.top,
                        left: prevCell.border.left,
                        bottom: prevCell.border.bottom,
                        right: prevCell.border.right
                    };
                }
              
                if (prevCell.font && prevCell.font.bold) {
                  worksheet.getCell(newCellAddress).font = {
                      bold: true,
                  };
                }
              }

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


/**
 * Used to Replace the old column Cell Alphabet with the new one
 * @param formula 
 * @param oldColumn 
 * @param newColumn 
 * @returns 
 */
replaceColumnReferences(formula, oldColumn, newColumn) {
  const escapedOldColumn = oldColumn.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  
  const regex = new RegExp(escapedOldColumn, 'g');
  const newFormula = formula.replace(regex, newColumn);
  
  return newFormula;
}

/**
 * @param worksheet 
 * @param headers 
 * @param bgColor 
 * @param textColor 
 */
async setHeaderStyles(worksheet, headers, bgColor, textColor) {
  headers.forEach((header) => {
      const cell = worksheet.getCell(header);
      cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor } // Background color
      };
      cell.font = {
        size: 11,
        bold: true,
        color: { argb: textColor },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      // wrapText: true,
  };
  });
}

async addCellAutoFilters(worksheet, projectionYears){
  const startColumn = String.fromCharCode(65); // Start column ('A' is the first column)
  const endColumn = String.fromCharCode(65 + projectionYears - 1); // Last column based on projectionYears
  
  worksheet.autoFilter = {
      from: { row: 1, column: worksheet.getColumn(startColumn).number },
      to: { row: 1, column: worksheet.getColumn(endColumn).number }
  };

  worksheet.views = [
      { state: 'frozen', ySplit: 1 } 
  ];
}

getColumnLabel(index) {
  let label = '';
  while (index >= 0) {
      label = String.fromCharCode(65 + (index % 26)) + label;
      index = Math.floor(index / 26) - 1;
  }
  return label;
}
}
