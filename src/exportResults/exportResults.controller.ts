import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Controller('export')
export class ExportController {
  @Get()
  async generatePdf(@Res() res: Response) {
    const docDefinition = {
      content: [
        { text: 'Valuation', style: 'header' },
        { text: 'Valuation of a firm based on Profit loss and balance sheet statements.', style: 'subheader' },
        { text: 'Data', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*'],
            body: [
              ['Particulars', '2023'],
              ['PAT','4421370'],
            ['Depn and Amortisation',4421370],
            ['Oher Non Cash items',4421370],
            ['Change in NCA',4421370],
            ['Add/Less: Deferred Tax Assets(Net)',4421370],
            ['Net Cash Flow',4421370],
            ['Change in fixed assets',4421370],
            ['FCFF',4421370],
            ['Discounting Period (Mid Year)',4421370],
            ['Discounting Factor @WACCAT',4421370],
            ['Present Value of FCFF',4421370],
            ['Sum of Cash Flows',4421370],
            ['Less: Debt as on Date',4421370],
            ['Add: Cash & Cash Equivalents',4421370],
            ['Add: Surplus Assets/Investments',4421370],
            ['Add/Less: Other Adjustments(if any)',4421370],
            ['Equity Value',4421370],
            ['No. of Shares',4421370],
            ['Value per Share',4421370],

            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true
        },
        subheader: {
          fontSize: 14,
          margin: [0, 15, 0, 0]
        },
        sectionHeader: {
          bold: true,
          fontSize: 14,
          margin: [0, 15, 0, 0]
        }
      }
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer(buffer => {
      res.type('application/pdf');
      res.end(buffer, 'binary');
    });
  }
}
