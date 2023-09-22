import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import * as puppeteer from 'puppeteer';

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
                return of(sheetData);
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
          // Set the HTML content
          const contenread = await page.setContent(htmlContent);
          console.log(contenread,"content from html")
          await page.pdf({ path: pdfFilePath, format: 'A4', height: '20mm'});
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          await browser.close();
        }
      }
}
