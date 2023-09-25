import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import * as puppeteer from 'puppeteer';
import { mainLogo } from 'src/constants/constants';

@Injectable()
export class ExcelSheetService {
    getSheetData(fileName: string, sheetName: string): Observable<any> {
        const uploadDir = path.join(__dirname, '../../uploads');
        const filePath = path.join(uploadDir, fileName);
    
        return from(this.readFile(filePath)).pipe(
            switchMap((workbook) => {
                if (!workbook.SheetNames.includes(sheetName)) {
                  return throwError(new NotFoundException('Sheet not found'));
                }
        
                const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
                sheetData.forEach((row:any) => {
                    for (let columns in row) {
                      if (typeof row[columns] === 'string') {
                        row[columns] = row[columns].replace(/\r\n/g, '');
                    }
                  
                      if (typeof row[columns] === 'number') {
                        row[columns] = parseFloat(row[columns].toFixed(3));
                      }
                      if (typeof columns === 'string') {
                        const cleanedColumn = columns.trim().replace(/^\s+/g, '').replace(/\r\n/g, '');
                        // const cleanedColumn = columns.replace(/^\s+/g, '');
                        // console.log(cleanedColumn)
                        if (columns !== cleanedColumn) {
                          row[cleanedColumn] = row[columns];
                        //   console.log(row[cleanedColumn])
                          delete row[columns];
                        }
                      }
                    }
                  });
                  return from(this.transformData(sheetData)).pipe(switchMap((excelData)=>{
                    
                    return of(excelData)
                  }))
              }),
            catchError(() => {
                throw new NotFoundException('File not found');
            })
        );
      }
    
      async readFile(filePath: string): Promise<xlsx.WorkBook> {
        return new Promise((resolve, reject) => {
          if (!fs.existsSync(filePath)) {
            reject('File not found');
            return;
          }
    
          const workbook = xlsx.readFile(filePath);
          resolve(workbook);
        });
      }

      async generatePdfFromHtml() {
        const htmlFilePath = path.join(process.cwd(), 'pdf', 'FCFF.html');
        const pdfFilePath = path.join(process.cwd(), 'pdf', 'FCFF.pdf');
    
        try {
          const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
          await this.generatePdf(htmlContent, pdfFilePath);
        } catch (error) {
          console.error('Error reading HTML file:', error);
        }
      }
    
      async generatePdf(htmlContent: string, pdfFilePath: string) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

       
    
        try {
          const contenread = await page.setContent(htmlContent);
          console.log(contenread,"content from html")
            
          
          await page.pdf({
            path: pdfFilePath,
            format: 'A4' as puppeteer.PaperFormat, // Cast 'A4' to PaperFormat
            displayHeaderFooter: true,
            footerTemplate: `<table style="margin: 20px; width: 100%;">
            <tr>
              <td colspan="4" style="text-align: right; font-size: 12px; padding: 10px;">
                <table style="width: 100%; border-top: 1px solid #000; border-bottom: 1px solid #000;">
                  <tr>
                    <td style="width: 15%;">&nbsp;</td>
                    <td style="width: 70%; text-align: center;">
                      <span style="font-size: 10px;">Ifinworth | Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                    </td>
                    <td style="width: 15%; font-size: 10px;">V1/ Sept / 2023</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>`,
          headerTemplate: `
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
          <td style="width:86.2%;">
          
            <table border="0" cellspacing="0" cellpadding="0" style="height: 20px;width:100% !important;padding-left:2%;">
              <tr>
                <td style="border-bottom: solid 2px #03002f !important; font-size: 13px; height: 5px;width:100% !important;">Ifinworth Advisors Private Ltd.</td>
              </tr>

              <tr>
                <td style="font-size: 11px">&nbsp;</td>
              </tr>
            </table>
          </td>
        <td  align="right" style="padding-right:1%;" height="10px"><img src="${mainLogo}" width="100" height="" /></td>
        </tr></table>`
          });
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          await browser.close();
        }
      }
      async transformData(data: any[]) { //only for data table showcase on ui


        // const keysArray = Object.keys(data[0]);
        // data.unshift(keysArray)

        let maxKeys = Object.keys(data[0]).length;
        let maxKeysObject = data[0];

        for (let i = 1; i < data.length; i++) {
          const numKeys = Object.keys(data[i]).length;
          if (numKeys > maxKeys) {
            maxKeys = numKeys;
            maxKeysObject = data[i];
          }
        }
        const keysArray = Object.keys(maxKeysObject);
        data.unshift(keysArray)

      
        return data;
      }
      
}
