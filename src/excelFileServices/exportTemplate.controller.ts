import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as stream from 'stream';
import * as ExcelJS from 'exceljs';
import { columnsList } from './excelSheetConfig';

@Controller('download')
export class ExportTemplateController {
  @Get('/template/:projectionYears')
  async download(
    @Param('projectionYears') projectionYears: number,
    @Res() res: Response,
  ) {
    const filePath = `template/Template.xlsx`;

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);
    const currentYear = new Date().getFullYear();
    worksheet.getColumn(
      'B',
    ).header = `Provisionals/Audited Nos. close to valuation, ${
      currentYear - 1
    }-${currentYear}`;
    // Add new columns with headers
    let count = 0;
    for (let i = 1; i < projectionYears; i++) {
      worksheet.getColumn(columnsList[i]).header = `${currentYear + count}-${
        currentYear + i
      }`;
      count++;
    }

    const worksheet2 = workbook.getWorksheet(2);
    worksheet2.getColumn(
      'B',
    ).header = `Provisionals/Audited Nos. close to valuation, ${
      currentYear - 1
    }-${currentYear}`;
    // Add new columns with headers
    let count2 = 0;
    for (let i = 1; i < projectionYears; i++) {
      worksheet2.getColumn(columnsList[i]).header = `${currentYear + count2}-${
        currentYear + i
      }`;
      count2++;
    }

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
}
