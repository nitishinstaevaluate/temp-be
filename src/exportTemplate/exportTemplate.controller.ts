import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as xlsx from 'xlsx';

@Controller('download')
export class ExportTemplateController {
  @Get('/template')
  async download(@Res() res: Response) {
    const filePath = `template/Template.xlsx`;

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    const fileStream = fs.createReadStream(filePath);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename= Template-${new Date().getTime()}.xlsx`,
    );

    fileStream.pipe(res);
  }
}


// @Controller('download')
// export class ExportTemplateController {
//   @Get('/template')
//   async download(@Res() res: Response) {
//     const filePath = `template/Template.xlsx`;
//     const fileBuffer = fs.readFileSync(filePath);

//     // Parse the Excel file using xlsx
//     const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

//     // Modify the worksheet by adding two columns with headers
//     const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//     xlsx.utils.sheet_add_aoa(worksheet, [['2023-2024', '2024-2025']], { origin: 'B1' });

//     // Convert the modified workbook back to a buffer
//     const fileContent = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

//     // Send the modified Excel file to the frontend
//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename=myfile.xlsx');
//     res.send(fileContent);
//   }
// }