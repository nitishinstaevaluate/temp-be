import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
export function generatePdf(valuationData,res) {
    const docDefinition = {
      tableLayout: 'auto',
      pageOrientation: 'landscape',
      content: [
        { text: 'Valuation', style: 'header' },
        { text: 'Valuation of a firm based on Profit loss and balance sheet statements.', style: 'subheader' },
        { text: 'Data', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto','*','*','*','*','*','*'],
            body: valuationData||[]
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