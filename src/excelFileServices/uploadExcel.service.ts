import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

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
