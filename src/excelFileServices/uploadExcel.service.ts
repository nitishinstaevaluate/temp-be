import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';
import * as ExcelJS from 'exceljs';
import * as dateAndTime from 'date-and-time';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, last, switchMap } from 'rxjs/operators';
import * as puppeteer from 'puppeteer';
import { ASSESSMENT_DATA, MODEL, RELATIVE_PREFERENCE_RATIO, mainLogo } from 'src/constants/constants';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import { FCFEAndFCFFService } from 'src/valuationProcess/fcfeAndFCFF.service';
import hbs = require('handlebars');
import { isNotEmpty } from 'class-validator';
import { getYearsList, calculateDaysFromDate,getCellValue,getDiscountingPeriod,searchDate, parseDate, getFormattedProvisionalDate } from '../excelFileServices/common.methods';
import { columnsList, sheet2_BSObj } from './excelSheetConfig';
import { ChangeInNCA } from './fcfeAndFCFF.method';

@Injectable()
export class ExcelSheetService {
  constructor( private valuationService:ValuationsService,private fcfeService:FCFEAndFCFFService){}
    getSheetData(fileName: string, sheetName: string): Observable<any> {
        const uploadDir = path.join(__dirname, '../../uploads');
        const filePath = path.join(uploadDir, fileName);
    
        return from(this.readFile(filePath)).pipe(
            switchMap((workbook) => {
                if(sheetName !== 'Assessment of Working Capital'){
                  if (!workbook.SheetNames.includes(sheetName)) {
                  return throwError( {
                    message: `${sheetName} Sheet not found`,
                    status: false
                });
                  }
                  const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
                  sheetData.forEach((row:any) => {
                     for (let columns in row) {
                       if (typeof row[columns] === 'string') {
                         row[columns] = row[columns].replace(/\r\n/g, '').toLowerCase();;
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
                   return from(this.transformData(sheetData)).pipe(
                    switchMap((excelData)=>{

                     return of(excelData)
                   }),
                   catchError((error)=>{
                    return throwError(error)
                   })
                   )
                }
                else{

                  // add assessment calculations
                  // const workbook = new ExcelJS.Workbook();
                  // await workbook.xlsx.readFile(filepath);
                  // let alreadyExistAssessmentSheet = workbook.getWorksheet('Assessment of Working Capital');
                  // const alreadyExistAssessmentSheet = workbook.Sheets[sheetName]
                  // console.log(alreadyExistAssessmentSheet,sheetName,"sheet already exist")
                  if(!workbook.SheetNames.includes(sheetName)){
                     const workbookXLSX = xlsx.readFile(filePath);
                     const worksheet1 = workbookXLSX.Sheets['P&L'];

                     return from(getYearsList(worksheet1)).pipe(
                      switchMap((years) => {

                        const balanceSheet = workbookXLSX.Sheets['BS']
                        // const assessmentSheet = workbookXLSX.Sheets['Assessment of Working Capital']
                      return from(this.generatePayload(years,balanceSheet)).pipe(
                        switchMap((data)=>{
                          // console.log(data,"final opayload")
                          return from(this.appendSheetInExcel(filePath, data)).pipe( /// pass the above created payload from generatePayload method
                            switchMap((response) => {
                              if (response) {
                                return from(this.formatExcelResult(response)).pipe(
                                  switchMap((excelData)=>{
                                    return of({
                                      data:excelData,
                                      msg:"Assessment Sheet Fetched",
                                      status:true
                                    });
                                  }),catchError((error)=>{
                                    return throwError(error)
                                  })
                                )

                              } else {
                                return throwError('Error: Response not found');
                              }
                            }),
                            catchError((error) => {
                              return throwError(error);
                            })
                          );
                        }),catchError((error)=>{
                          return throwError(error)
                        })
                      )
                    
                      }),
                      catchError((error) => {
                        return throwError(error);
                      })
                    );
                  }
                  else{
                    return from(this.appendSheetInExcel(filePath,[])).pipe(
                      switchMap((response)=>{
                        if(response){
                          if (response) {
                            return from(this.formatExcelResult(response)).pipe(
                              switchMap((excelData)=>{
                                return of({
                                  data:excelData,
                                  msg:"Assessment Sheet Fetched",
                                  status:true
                                });
                              }),catchError((error)=>{
                                return throwError(error)
                              })
                            )

                          } else {
                            return throwError('Error: Response not found');
                          }
                        }
                      }),catchError((error)=>{
                          return throwError(error)
                      })
                    )
                  }
                }
              }),
            catchError((error) => {
              console.log(error,"error")
                return of({
                  msg:'Something went wrong',
                  error:error.message,
                  status:false
                });
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

      async generatePdfFromHtml(id,model,specificity,res) {
        try {
          const valuationResult = await this.valuationService.getValuationById(id);
          const transposedData = [];
          const modifiedDataSet = [];
          let htmlFilePath,pdfFilePath;
          let dateStamp = `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}-${new Date().getHours()}${new Date().getMinutes()}` 
          if (specificity === 'true' && model) {
             htmlFilePath = path.join(process.cwd(), 'html-template', `${model === MODEL[4] ? MODEL[2] : model}.html`);
             pdfFilePath = path.join(process.cwd(), 'pdf', `${model === MODEL[4] ? 'Comparable Industries' : model === MODEL[2] ? 'Relative Valuation': model }-${dateStamp}.pdf`);
            for await (let data of valuationResult.modelResults) {
              if (data.model === model) {
                modifiedDataSet.push(data);
                if(data.model !== MODEL[2] && data.model !== MODEL[4] && data.model !== MODEL[5]){
                  transposedData.push({ model: data.model, data: await this.fcfeService.transformData(data.valuationData) });
                }
              }
            }
            valuationResult.modelResults = modifiedDataSet;
          } 
          else {
             htmlFilePath = path.join(process.cwd(), 'html-template', 'main-pdf.html');
             pdfFilePath = path.join(process.cwd(), 'pdf', `Ifinworth Valuation-${dateStamp}.pdf`);
            for await (let data of valuationResult.modelResults) {
              if(data.model !== MODEL[2] && data.model !== MODEL[4] && data.model !== MODEL[5]){
                transposedData.push({ model: data.model, data: await this.fcfeService.transformData(data.valuationData) });
              }  
            }
          }

          this.loadHelpers(transposedData, valuationResult);
        
          if (valuationResult.modelResults.length > 0) {
            const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
            const template = hbs.compile(htmlContent);
            const html = template(valuationResult);
      
            const pdf = await this.generatePdf(html, pdfFilePath);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${model !== 'null' ? model === MODEL[4] ? 'Comparable Industries' : model === MODEL[2] ? 'Comparable Companies': model : 'Ifinworth Valuation' }-${dateStamp}.pdf"`);
            res.send(pdf);
      
            return {
              msg: "PDF download Success",
              status: true,
            };
          } 
          else {
            console.log("Data not found");
            return {
              msg: "No data found for PDF generation",
              status: false
            };
          }
        } catch (error) {
          console.error("Error:", error);
        
          return {
            msg: "Download Failed. An error occurred during processing.",
            status: false,
            error:error.message
          };
        }
      }
    
      async generatePdf(htmlContent: any, pdfFilePath: string) {
        const browser = await puppeteer.launch({
          headless:"new"
        });
        const page = await browser.newPage();

        try {
          const contenread = await page.setContent(htmlContent);
          const pdf = await page.pdf({
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

          return pdf;
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          await browser.close();
         
        }
      }
      async transformData(data: any[]) { //only for data table showcase on ui
        try{
        let maxKeys = Object.keys(data[0]).length;
        let maxKeysObject = data[0];

        for (let i = 1; i < data.length; i++) {
          const numKeys = Object.keys(data[i]).length;
          if (numKeys > maxKeys) {
            maxKeys = numKeys;
            maxKeysObject = data[i];
          }
        }
        const atLeastOneArray = data.some(item => Array.isArray(item));
        const keysArray = Object.keys(maxKeysObject);
        data.forEach(obj => {
          keysArray.forEach(key => {
            if (!(key in obj)) {
              obj[key] = null;
            }
          });
        });
        let splicedEle;
        keysArray.map((value:any,index:number)=>{
          if(value === 'Particulars'){
            splicedEle = keysArray.splice(index,1);
          }
        })
        if(!atLeastOneArray){
          keysArray.unshift(splicedEle[0])
        }
        data.unshift(keysArray)
        return data;
      }
        catch(error){
          console.log(error);
          throw error;
        }
      
      }

      async loadHelpers(transposedData,valuationResult){
        hbs.registerHelper('modelCheck',(txt,options)=>{
          if (!valuationResult || !valuationResult.modelResults || valuationResult.modelResults.length === 0) {
            return ''; // Return an empty string if there are no results to check
          }
        const found = valuationResult.modelResults.some((response) => {
          if(txt === 'isRelativeOrCTM')
            return response.model === MODEL[4] || response.model === MODEL[2];
          return response.model === txt;
        });
        
          if (found) {
            return options.fn(this); // Render the block content
          } else {
            return ''; // Return an empty string if the condition is not met
          }
        })
        hbs.registerHelper('fcfeColumnHeader', () => {
          let fcfeHeader = [];
          transposedData.forEach((result) => {
            if (result.model === 'FCFE' || result.model === 'FCFF') {
              fcfeHeader = result.data.columnHeader.map((headers)=>{
                return {headers};
              }); 
            }
            else if (result.model === 'Excess_Earnings') {
              fcfeHeader = result.data.columnHeader.map((headers)=>{
                return {headers};
              }); 
            }
          });
          return fcfeHeader;
        });

        hbs.registerHelper('PAT', () => {
          let arrayPAT = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayPAT.push({fcfePat:response.pat ? parseFloat(response?.pat).toFixed(2) : ''})
              })
              arrayPAT.unshift({fcfePat:"PAT"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayPAT.push({fcffPat:response.pat ? parseFloat(response?.pat).toFixed(2) : ''})
              })
              arrayPAT.unshift({fcffPat:"PAT"});
            }
            else if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayPAT.push({excessEarningPat:response.pat ? parseFloat(response?.pat).toFixed(2) : ''})
              })
              arrayPAT.unshift({excessEarningPat:"PAT"});
            }
          })
          return arrayPAT;
        });

        hbs.registerHelper('depAndAmortisation', () => {
          let arraydepAndAmortisation = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arraydepAndAmortisation.push({fcfeDepAmortisation:response.depAndAmortisation ? parseFloat(response?.depAndAmortisation).toFixed(2) : ''})
              })
              arraydepAndAmortisation.unshift({fcfeDepAmortisation:"Dept And Amortisation"});
            }
            else if (result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arraydepAndAmortisation.push({fcffDepAmortisation:response.depAndAmortisation ? parseFloat(response?.depAndAmortisation).toFixed(2) : ''})
              })
              arraydepAndAmortisation.unshift({fcffDepAmortisation:"Dept And Amortisation"});
              
            }
          })
          return arraydepAndAmortisation;
        });

        hbs.registerHelper('InterestAdjTaxes', () => {
          let arrayaddInterestAdjTaxes = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayaddInterestAdjTaxes.push({fcfeAddInterestAdjTaxes:response.addInterestAdjTaxes ? parseFloat(response?.addInterestAdjTaxes).toFixed(2)  : response?.addInterestAdjTaxes === 0 ? 0 : ''})
              })
              arrayaddInterestAdjTaxes.unshift({fcfeAddInterestAdjTaxes:"Add: Interest Adjusted Taxes"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayaddInterestAdjTaxes.push({fcffAddInterestAdjTaxes:response.addInterestAdjTaxes ? parseFloat(response?.addInterestAdjTaxes).toFixed(2)  : response?.addInterestAdjTaxes === 0 ? 0 : ''})
              })
              arrayaddInterestAdjTaxes.unshift({fcffAddInterestAdjTaxes:"Add: Interest Adjusted Taxes"});
              
            }
          })
          return arrayaddInterestAdjTaxes;
        });

        hbs.registerHelper('nonCashItem', () => {
          let arrayonCashItems = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayonCashItems.push({fcfeOnCashItems:response.onCashItems ? parseFloat(response?.onCashItems).toFixed(2) : response.onCashItems === 0 ? 0 : ''})
              })
              arrayonCashItems.unshift({fcfeOnCashItems:"Other Non Cash items"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayonCashItems.push({fcffOnCashItems:response.onCashItems ? parseFloat(response?.onCashItems).toFixed(2) : response.onCashItems === 0 ? 0 : ''})
              })
              arrayonCashItems.unshift({fcffOnCashItems:"Other Non Cash items"});
            }
          })
          return arrayonCashItems;
        });

        hbs.registerHelper('NCA', () => {
          let arrayNca = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayNca.push({fcfeNca:response.nca ? parseFloat(response?.nca).toFixed(2) : response.nca === 0 ? 0 : ''})
              })
              arrayNca.unshift({fcfeNca:"Change in NCA"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayNca.push({fcffNca:response.nca ? parseFloat(response?.nca).toFixed(2) : response.nca === 0 ? 0 : ''})
              })
              arrayNca.unshift({fcffNca:"Change in NCA"});
            }
          })
          return arrayNca;
        });

        hbs.registerHelper('defferTaxAssets', () => {
          let arraydefferedTaxAssets = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arraydefferedTaxAssets.push({fcfeDefferedTaxAssets:response?.defferedTaxAssets ? parseFloat(response?.defferedTaxAssets).toFixed(2) : response.defferedTaxAssets === 0 ? 0 : ''})
              })
              arraydefferedTaxAssets.unshift({fcfeDefferedTaxAssets:"Add/Less: Deferred Tax Assets(Net)"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arraydefferedTaxAssets.push({fcffDefferedTaxAssets:response?.defferedTaxAssets ? parseFloat(response?.defferedTaxAssets).toFixed(2) : response.defferedTaxAssets === 0 ? 0 : ''})
              })
              arraydefferedTaxAssets.unshift({fcffDefferedTaxAssets:"Add/Less: Deferred Tax Assets(Net)"});
            }
          })
          return arraydefferedTaxAssets;
        });

        hbs.registerHelper('netCshFlow', () => {
          let arrayNetCashFlow = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayNetCashFlow.push({fcfeNetCashFlow:response?.netCashFlow ? parseFloat(response?.netCashFlow).toFixed(2) : response.netCashFlow === 0 ? 0 : ''})
              })
              arrayNetCashFlow.unshift({fcfeNetCashFlow:"Net Cash Flow"});
            }
            if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayNetCashFlow.push({fcffNetCashFlow:response?.netCashFlow ? parseFloat(response?.netCashFlow).toFixed(2) : response.netCashFlow === 0 ? 0 : ''})
              })
              arrayNetCashFlow.unshift({fcffNetCashFlow:"Net Cash Flow"});
            }
          })
          return arrayNetCashFlow;
        });


        hbs.registerHelper('fxdCshFlow', () => {
          let arrayFixedAssets = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayFixedAssets.push({fcfeFixedAssets:response?.fixedAssets ? parseFloat(response?.fixedAssets).toFixed(2) : response.fixedAssets === 0 ? 0 : ''})
              })
              arrayFixedAssets.unshift({fcfeFixedAssets:"Change in fixed assets"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayFixedAssets.push({fcffFixedAssets:response?.fixedAssets ? parseFloat(response?.fixedAssets).toFixed(2) : response.fixedAssets === 0 ? 0 : ''})
              })
              arrayFixedAssets.unshift({fcffFixedAssets:"Change in fixed assets"});
            }
          })
          return arrayFixedAssets;
        });

        hbs.registerHelper('FCFF', () => {
          let arrayfcff = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayfcff.push({fcff:response?.fcff ? parseFloat(response?.fcff).toFixed(2) : response.fcff === 0 ? 0 : ''})
              })
              arrayfcff.unshift({fcff:"FCFF"});
            }
          })
          return arrayfcff;
        });

        hbs.registerHelper('discPeriod', () => {
          let arrayDiscountingPeriod = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayDiscountingPeriod.push({fcfeDiscountingPeriod:response?.discountingPeriod ? parseFloat(response?.discountingPeriod).toFixed(2) : response.discountingPeriod === 0 ? 0 : ''})
              })
              arrayDiscountingPeriod.unshift({fcfeDiscountingPeriod:"Discounting Period"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayDiscountingPeriod.push({fcffDiscountingPeriod:response?.discountingPeriod ? parseFloat(response?.discountingPeriod).toFixed(2) : response.discountingPeriod === 0 ? 0 : ''})
              })
              arrayDiscountingPeriod.unshift({fcffDiscountingPeriod:"Discounting Period"});
            }
            else if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayDiscountingPeriod.push({excessEarningDiscountingPeriod:response?.discountingPeriod ? parseFloat(response?.discountingPeriod).toFixed(2) : response.discountingPeriod === 0 ? 0 : ''})
              })
              arrayDiscountingPeriod.unshift({excessEarningDiscountingPeriod:"Discounting Period"});
            }
          })
          return arrayDiscountingPeriod;
        });

        hbs.registerHelper('discFactor', () => {
          let arrayDiscountingFactor = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayDiscountingFactor.push({fcfeDiscountingFactor:response?.discountingFactor ? parseFloat(response?.discountingFactor).toFixed(2) : response.discountingFactor === 0 ? 0 : ''})
              })
              arrayDiscountingFactor.unshift({fcfeDiscountingFactor:"Discounting Factor"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayDiscountingFactor.push({fcffDiscountingFactor:response?.discountingFactor ? parseFloat(response?.discountingFactor).toFixed(2) : response.discountingFactor === 0 ? 0 : ''})
              })
              arrayDiscountingFactor.unshift({fcffDiscountingFactor:"Discounting Factor"});
            }
            else if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayDiscountingFactor.push({excessEarningDiscountingFactor:response?.discountingFactor ? parseFloat(response?.discountingFactor).toFixed(2) : response.discountingFactor === 0 ? 0 : ''})
              })
              arrayDiscountingFactor.unshift({excessEarningDiscountingFactor:"Discounting Factor"});
            }
          })
          return arrayDiscountingFactor;
        });

        hbs.registerHelper('prsntFCFF', () => {
          let arrayPresentFCFF = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayPresentFCFF.push({fcfePresentFCFF:response?.presentFCFF ? parseFloat(response?.presentFCFF).toFixed(2) : response.presentFCFF === 0 ? 0 : ''})
              })
              arrayPresentFCFF.unshift({fcfePresentFCFF:result?.model === 'FCFF' ? "Present Value of FCFF" : "Present Value of FCFE"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayPresentFCFF.push({fcffPresentFCFF:response?.presentFCFF ? parseFloat(response?.presentFCFF).toFixed(2) : response.presentFCFF === 0 ? 0 : ''})
              })
              arrayPresentFCFF.unshift({fcffPresentFCFF:result?.model === 'FCFF' ? "Present Value of FCFF" : "Present Value of FCFE"});
            }
          })
          return arrayPresentFCFF;
        });

        hbs.registerHelper('sumCashFlow', () => {
          let arraySumOfCashFlows = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arraySumOfCashFlows.push({fcfeSumOfCashFlows:response?.sumOfCashFlows ? parseFloat(response?.sumOfCashFlows).toFixed(2) : response.sumOfCashFlows === 0 ? 0 : ''})
              })
              arraySumOfCashFlows.unshift({fcfeSumOfCashFlows:"Sum of Cash Flows"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arraySumOfCashFlows.push({fcffSumOfCashFlows:response?.sumOfCashFlows ? parseFloat(response?.sumOfCashFlows).toFixed(2) : response.sumOfCashFlows === 0 ? 0 : ''})
              })
              arraySumOfCashFlows.unshift({fcffSumOfCashFlows:"Sum of Cash Flows"});
            }
            else if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arraySumOfCashFlows.push({excessEarningSumOfCashFlows:response?.sumOfCashFlows ? parseFloat(response?.sumOfCashFlows).toFixed(2) : response.sumOfCashFlows === 0 ? 0 : ''})
              })
              arraySumOfCashFlows.unshift({excessEarningSumOfCashFlows:"Sum of Cash Flows"});
            }
          })
          return arraySumOfCashFlows;
        });

        hbs.registerHelper('debtDate', () => {
          let arrayDebtOnDate = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayDebtOnDate.push({fcfeDebtOnDate:response?.debtOnDate ? parseFloat(response?.debtOnDate).toFixed(2) : response.debtOnDate === 0 ? 0 : ''})
              })
              arrayDebtOnDate.unshift({fcfeDebtOnDate:"Less: Debt as on Date"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayDebtOnDate.push({fcffDebtOnDate:response?.debtOnDate ? parseFloat(response?.debtOnDate).toFixed(2) : response.debtOnDate === 0 ? 0 : ''})
              })
              arrayDebtOnDate.unshift({fcffDebtOnDate:"Less: Debt as on Date"});
            }
          })
          return arrayDebtOnDate;
        });

        hbs.registerHelper('cashEquvlnt', () => {
          let arrayCashEquivalents = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayCashEquivalents.push({fcfeCashEquivalents:response?.cashEquivalents ? parseFloat(response?.cashEquivalents).toFixed(2) : response.cashEquivalents === 0 ? 0 : ''})
              })
              arrayCashEquivalents.unshift({fcfeCashEquivalents:"Add: Cash & Cash Equivalents"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayCashEquivalents.push({fcffCashEquivalents:response?.cashEquivalents ? parseFloat(response?.cashEquivalents).toFixed(2) : response.cashEquivalents === 0 ? 0 : ''})
              })
              arrayCashEquivalents.unshift({fcffCashEquivalents:"Add: Cash & Cash Equivalents"});
            }
          })
          return arrayCashEquivalents;
        });

        hbs.registerHelper('surplusAsset', () => {
          let arraySurplusAssets = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arraySurplusAssets.push({fcfeSurplusAssets:response?.surplusAssets ? parseFloat(response?.surplusAssets).toFixed(2) : response.surplusAssets === 0 ? 0 : ''})
              })
              arraySurplusAssets.unshift({fcfeSurplusAssets:"Add: Surplus Assets/Investments"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arraySurplusAssets.push({fcffSurplusAssets:response?.surplusAssets ? parseFloat(response?.surplusAssets).toFixed(2) : response.surplusAssets === 0 ? 0 : ''})
              })
              arraySurplusAssets.unshift({fcffSurplusAssets:"Add: Surplus Assets/Investments"});
            }
          })
          return arraySurplusAssets;
        });

        hbs.registerHelper('otherAdjustment', () => {
          let arrayOtherAdj = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayOtherAdj.push({fcfeOtherAdj:response?.otherAdj ? parseFloat(response?.otherAdj).toFixed(2) : response.otherAdj === 0 ? 0 : ''})
              })
              arrayOtherAdj.unshift({fcfeOtherAdj:"Add/Less: Other Adjustments(if any)"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayOtherAdj.push({fcffOtherAdj:response?.otherAdj ? parseFloat(response?.otherAdj).toFixed(2) : response.otherAdj === 0 ? 0 : ''})
              })
              arrayOtherAdj.unshift({fcffOtherAdj:"Add/Less: Other Adjustments(if any)"});
            }
          })
          return arrayOtherAdj;
        });

        hbs.registerHelper('eqtValue', () => {
          let checkiIfStub = false;
          
          let arrayEquityValue = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.valuationData.some(obj => obj.hasOwnProperty('stubAdjValue'))){
              checkiIfStub=true;
            }
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayEquityValue.push({fcfeEquityValue:response?.equityValue ? parseFloat(response?.equityValue).toFixed(2) : response.equityValue === 0 ? 0 : ''})
              })
              if(checkiIfStub){
                // arrayEquityValue.unshift({fcfeEquityValue:`Equity Value as on ${result.valuationData[0].particulars}`});
                arrayEquityValue.unshift({fcfeEquityValue:`Equity Value as on ${this.formatDate(new Date(valuationResult.provisionalDate))}`});
              }
              else{
                arrayEquityValue.unshift({fcfeEquityValue:`Equity Value as on${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
              }
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayEquityValue.push({fcffEquityValue:response?.equityValue ? parseFloat(response?.equityValue).toFixed(2) : response.equityValue === 0 ? 0 : ''})
              })
              if(checkiIfStub){
                // arrayEquityValue.unshift({fcffEquityValue:`Equity Value as on ${result.valuationData[0].particulars}`});
                arrayEquityValue.unshift({fcffEquityValue:`Equity Value as on ${this.formatDate(new Date(valuationResult.provisionalDate))}`});
              }
              else{
                arrayEquityValue.unshift({fcffEquityValue:`Equity Value as on${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
              }
            }
            else if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayEquityValue.push({excessEarningEquityValue:response?.equityValue ? parseFloat(response?.equityValue).toFixed(2) : response.equityValue === 0 ? 0 : ''})
              })
              if(checkiIfStub){
                // arrayEquityValue.unshift({excessEarningEquityValue:`Equity Value as on ${result.valuationData[0].particulars}`});
                arrayEquityValue.unshift({excessEarningEquityValue:`Equity Value as on ${this.formatDate(new Date(valuationResult.provisionalDate))}`});
              }
              else{
                arrayEquityValue.unshift({excessEarningEquityValue:`Equity Value as on ${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
              }
            }
          })
          return arrayEquityValue;
        });

        hbs.registerHelper('stubValue',()=>{
          let arrayStubValue = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === MODEL[0]){
              result.valuationData.map((response:any)=>{
                arrayStubValue.push({fcfeStubAdjValue:response?.stubAdjValue ? parseFloat(response?.stubAdjValue).toFixed(2) : response.stubAdjValue === 0 ? 0 : ''})
              })
              arrayStubValue.unshift({fcfeStubAdjValue:"Add:Stub Period Adjustment"});
            }
            else if (result.model === MODEL[1]){
              result.valuationData.map((response:any)=>{
                arrayStubValue.push({fcffStubAdjValue:response?.stubAdjValue ? parseFloat(response?.stubAdjValue).toFixed(2) : response.stubAdjValue === 0 ? 0 : ''})
              })
              arrayStubValue.unshift({fcffStubAdjValue:"Add:Stub Period Adjustment"});
            }
            else if (result.model ===MODEL[3]){
              result.valuationData.map((response:any)=>{
                arrayStubValue.push({excessEarnStubAdjValue:response?.stubAdjValue ? parseFloat(response?.stubAdjValue).toFixed(2) : response.stubAdjValue === 0 ? 0 : ''})
              })
              arrayStubValue.unshift({excessEarnStubAdjValue:"Add:Stub Period Adjustment"});
            }
          })
          return arrayStubValue;
        })
        hbs.registerHelper('provisionalEquityValue',()=>{
          let arrayProvisionalVal = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === MODEL[0]){
              result.valuationData.map((response:any)=>{
                arrayProvisionalVal.push({fcfeequityValueNew:response?.equityValueNew ? parseFloat(response?.equityValueNew).toFixed(2) : response.equityValueNew === 0 ? 0 : ''})
              })
              arrayProvisionalVal.unshift({fcfeequityValueNew:`Equity Value as on ${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
            }
            else if (result.model === MODEL[1]){
              result.valuationData.map((response:any)=>{
                arrayProvisionalVal.push({fcffequityValueNew:response?.equityValueNew ? parseFloat(response?.equityValueNew).toFixed(2) : response.equityValueNew === 0 ? 0 : ''})
              })
              arrayProvisionalVal.unshift({fcffequityValueNew:`Equity Value as on ${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
            }
            else if (result.model ===MODEL[3]){
              result.valuationData.map((response:any)=>{
                arrayProvisionalVal.push({excessEarnequityValueNew:response?.equityValueNew ? parseFloat(response?.equityValueNew).toFixed(2) : response.equityValueNew === 0 ? 0 : ''})
              })
              arrayProvisionalVal.unshift({excessEarnequityValueNew:`Equity Value as on ${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
            }
          })
          return arrayProvisionalVal;
        })

        hbs.registerHelper('shares', () => {
          let arrayNoOfShares = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayNoOfShares.push({fcfeNoOfShares:response?.noOfShares ? parseFloat(response?.noOfShares).toFixed(2) : response.noOfShares === 0 ? 0 : ''})
              })
              arrayNoOfShares.unshift({fcfeNoOfShares:"No. of Shares"});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayNoOfShares.push({fcffNoOfShares:response?.noOfShares ? parseFloat(response?.noOfShares).toFixed(2) : response.noOfShares === 0 ? 0 : ''})
              })
              arrayNoOfShares.unshift({fcffNoOfShares:"No. of Shares"});
            }
            else if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayNoOfShares.push({excessEarningNoOfShares:response?.noOfShares ? parseFloat(response?.noOfShares).toFixed(2) : response.noOfShares === 0 ? 0 : ''})
              })
              arrayNoOfShares.unshift({excessEarningNoOfShares:"No. of Shares"});
            }
          })
          return arrayNoOfShares;
        });

        hbs.registerHelper('valuePrShare', () => {
          let arrayValuePerShare = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayValuePerShare.push({fcfeValuePerShare:response?.valuePerShare ? parseFloat(response?.valuePerShare).toFixed(2) : response.valuePerShare === 0 ? 0 : ''})
              })
              arrayValuePerShare.unshift({fcfeValuePerShare:`Value per Share (${valuationResult.inputData[0].currencyUnit})`});
            }
            else if(result.model === 'FCFF'){
              result.valuationData.map((response:any)=>{
                arrayValuePerShare.push({fcffValuePerShare:response?.valuePerShare ? parseFloat(response?.valuePerShare).toFixed(2) : response.valuePerShare === 0 ? 0 : ''})
              })
              arrayValuePerShare.unshift({fcffValuePerShare:`Value per Share (${valuationResult.inputData[0].currencyUnit})`});
            }
            else if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayValuePerShare.push({excessEarningValuePerShare:response?.valuePerShare ? parseFloat(response?.valuePerShare).toFixed(2) : response.valuePerShare === 0 ? 0 : ''})
              })
              arrayValuePerShare.unshift({excessEarningValuePerShare:`Value per Share (${valuationResult.inputData[0].currencyUnit})`});
            }
          })
          return arrayValuePerShare;
        });

        hbs.registerHelper('changeInBorrowing', () => {
          let arrayChangeInBorrowings = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayChangeInBorrowings.push({changeInBorrowings:response?.changeInBorrowings ? parseFloat(response?.changeInBorrowings).toFixed(2) : response.changeInBorrowings === 0 ? 0 : ''})
              })
              arrayChangeInBorrowings.unshift({changeInBorrowings:"Change in Borrowings"});
            }
          })
          return arrayChangeInBorrowings;
        });

        hbs.registerHelper('FCFE', () => {
          let arrayfcff = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'FCFE'){
              result.valuationData.map((response:any)=>{
                arrayfcff.push({fcff:response?.fcff ? parseFloat(response?.fcff).toFixed(2) : response.fcff === 0 ? 0 : ''})
              })
              arrayfcff.unshift({fcff:"FCFE"});
            }
          })
          return arrayfcff;
        });

        // excess earning model
        hbs.registerHelper('NetWorth', () => {
          let arrayNetWorth = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayNetWorth.push({netWorth:response?.netWorth ? parseFloat(response?.netWorth).toFixed(2) : response.netWorth === 0 ? 0 : ''})
              })
              arrayNetWorth.unshift({netWorth:"Networth"});
            }
          })
          return arrayNetWorth;
        });

        hbs.registerHelper('expctProfitCOE', () => {
          let arrayExpectedProfitCOE = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayExpectedProfitCOE.push({expectedProfitCOE:response?.expectedProfitCOE ? parseFloat(response?.expectedProfitCOE).toFixed(2) : response.expectedProfitCOE === 0 ? 0 : ''})
              })
              arrayExpectedProfitCOE.unshift({expectedProfitCOE:"Expected Profit COE"});
            }
          })
          return arrayExpectedProfitCOE;
        });

        hbs.registerHelper('excessRtrn', () => {
          let arrayExcessReturn = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayExcessReturn.push({excessReturn:response?.excessReturn ? parseFloat(response?.excessReturn).toFixed(2) : response.excessReturn === 0 ? 0 : ''})
              })
              arrayExcessReturn.unshift({excessReturn:"Excess Return"});
            }
          })
          return arrayExcessReturn;
        });

        hbs.registerHelper('presentValOfExcessReturn', () => {
          let arrayPresentValueOfExcessReturn = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayPresentValueOfExcessReturn.push({presentValueOfExcessReturn:response?.presentValueOfExcessReturn ? parseFloat(response?.presentValueOfExcessReturn).toFixed(2) : response.presentValueOfExcessReturn === 0 ? 0 : ''})
              })
              arrayPresentValueOfExcessReturn.unshift({presentValueOfExcessReturn:"Present Value Of Excess Return"});
            }
          })
          return arrayPresentValueOfExcessReturn;
        });

        hbs.registerHelper('bkValue', () => {
          let arrayBookValue = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === 'Excess_Earnings'){
              result.valuationData.map((response:any)=>{
                arrayBookValue.push({bookValue:response?.bookValue ? parseFloat(response?.bookValue).toFixed(2) : response.bookValue === 0 ? 0 : ''})
              })
              arrayBookValue.unshift({bookValue:"Book Value"});
            }
          })
          return arrayBookValue;
        });

        // relative valuation helpers
        hbs.registerHelper('companies', () => {
          let arrayCompany = [];
          let isCompany = false;
          if( valuationResult.inputData[0].preferenceRatioSelect === RELATIVE_PREFERENCE_RATIO[1]){
            isCompany=true;
          }
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === MODEL[2] || result.model === MODEL[4]){
              arrayCompany = this.createPrfnceRtio(isCompany ? result.valuationData?.companies : result.valuationData.industries,isCompany);
            }
          })
          return arrayCompany;
        });

        hbs.registerHelper('relativeVal', () => {
          let arrayPbRatio = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === MODEL[2] || result.model === MODEL[4]){
              result.valuationData?.valuation.map((response)=>{
                if(response?.particular === 'pbRatio'){
                  const pbRatioHead = {
                    srNo:1,
                    particular:'P/B Ratio',
                    avg:'',
                    med:''
                  }
                  const netWorthObj = {
                    srNo:'',
                    particular:'Net Worth Of Company',
                    avg:response.netWorthAvg?.toFixed(2),
                    med:response.netWorthMed?.toFixed(2)
                  }
                  const industryObj = {
                    srNo:'',
                    particular:'P/B Ratio of Industry',
                    avg:response.pbRatioAvg?.toFixed(2),
                    med:response.pbRatioMed?.toFixed(2)
                  }
                  const fairValEquity = {
                    srNo:'',
                    particular:'PFair Value of Equity',
                    avg:response.pbMarketPriceAvg?.toFixed(2),
                    med:response.pbMarketPriceMed?.toFixed(2)
                  }
                  arrayPbRatio.push(pbRatioHead,netWorthObj,industryObj,fairValEquity)
                }
                else if(response?.particular === 'peRatio'){
                  arrayPbRatio.push({ //make sure to push empty object to have empty space between rows
                    srNo:'',
                    particular:'',
                    avg:'',
                    med:''
                  })
                  const peRatioHead = {
                    srNo:2,
                    particular:'P/E Ratio',
                    avg:'',
                    med:''
                  }
                  const patObj={
                    srNo:'',
                    particular:'Profit after Taxes',
                    avg:response.pat?.toFixed(2),
                    med:response.pat?.toFixed(2)
                  }
                  const peRatioIndObj={
                    srNo:'',
                    particular:'P/E Ratio of Industry',
                    avg:response.peRatioAvg?.toFixed(2),
                    med:response.peRatioMed?.toFixed(2)
                  }
                  const peRatioMrktPrceObj={
                    srNo:'',
                    particular:'Market Price',
                    avg:response.peMarketPriceAvg?.toFixed(2),
                    med:response.peMarketPriceMed?.toFixed(2)
                  }
                  arrayPbRatio.push(peRatioHead,patObj,peRatioIndObj,peRatioMrktPrceObj)
                }
                else if(response?.particular === 'ebitda'){
                  arrayPbRatio.push({ //make sure to push empty object to have empty space between rows
                    srNo:'',
                    particular:'',
                    avg:'',
                    med:''
                  })
                  const ebitDatHead = {
                    srNo:3,
                    particular:'EV/EBITDA',
                    avg:'',
                    med:''
                  }
                  const ebitDaObj={
                    srNo:'',
                    particular:'EBITDA',
                    avg:response.ebitda?.toFixed(2),
                    med:response.ebitda?.toFixed(2)
                  }
                  const evEbitDaObj={
                    srNo:'',
                    particular:'EV/EBITDA',
                    avg:response.evAvg?.toFixed(2),
                    med:response.evMed?.toFixed(2)
                  }
                  const entprseObj={
                    srNo:'',
                    particular:'Enterprise Value',
                    avg:response.enterpriseAvg?.toFixed(2),
                    med:response.enterpriseMed?.toFixed(2)
                  }
                  const valDebtObj={
                    srNo:'',
                    particular:'Less : Value of Debt',
                    avg:response.debtAvg?.toFixed(2),
                    med:response.debtMed?.toFixed(2)
                  }
                  const valEquityObj={
                    srNo:'',
                    particular:'Value of Equity',
                    avg:response.ebitdaEquityAvg?.toFixed(2),
                    med:response.ebitdaEquityMed?.toFixed(2)
                  }
                  arrayPbRatio.push(ebitDatHead,ebitDaObj,evEbitDaObj,entprseObj,valDebtObj,valEquityObj)
                }
                else if(response?.particular === 'sales'){
                  arrayPbRatio.push({ //make sure to push empty object to have empty space between rows
                    srNo:'',
                    particular:'',
                    avg:'',
                    med:''
                  })
                  const salesHead = {
                    srNo:4,
                    particular:'Price to Sales',
                    avg:'',
                    med:''
                  }
                  const companySalesObj = {
                    srNo:'',
                    particular:'Sales of company',
                    avg:response.salesAvg?.toFixed(2),
                    med:response.salesMed?.toFixed(2)
                  }
                  const salesRatioObj = {
                    srNo:'',
                    particular:'P/S Ratio',
                    avg:response.salesRatioAvg?.toFixed(2),
                    med:response.salesRatioMed?.toFixed(2)
                  }
                  const salesEquityObj = {
                    srNo:'',
                    particular:'Value of Equity',
                    avg:response.salesEquityAvg?.toFixed(2),
                    med:response.salesEquityMed?.toFixed(2)
                  }
                  arrayPbRatio.push(salesHead,companySalesObj,salesRatioObj,salesEquityObj)
                }
                else if(response?.particular === 'result'){
                  arrayPbRatio.push({ //make sure to push empty object to have empty space between rows
                    srNo:'',
                    particular:'',
                    avg:'',
                    med:''
                  })
                  const resultHead = {
                    srNo:'',
                    particular:'Average value of Equity',
                    avg:response.avgPricePerShareAvg?.toFixed(2),
                    med:response.avgPricePerShareMed?.toFixed(2)
                  }
                  const illiquidityObj = {
                    srNo:'',
                    particular:'Less: Illiquidity',
                    avg:response.locAvg?.toFixed(2),
                    med:response.locMed?.toFixed(2)
                  }
                  const finalPriceObj = {
                    srNo:'',
                    particular:'Final Price',
                    avg:response.finalPriceAvg?.toFixed(2),
                    med:response.finalPriceMed?.toFixed(2)
                  }
                  const sharesObj = {
                    srNo:'',
                    particular:'No. of Shares',
                    avg:response.outstandingShares,
                    med:response.outstandingShares
                  }
                  const valPrShareObj = {
                    srNo:'',
                    particular:`Fair Value per Share  (${valuationResult.inputData[0].currencyUnit})`,
                    avg:response.fairValuePerShareAvg?.toFixed(2),
                    med:response.fairValuePerShareMed?.toFixed(2)
                  }
                  arrayPbRatio.push(resultHead,illiquidityObj,finalPriceObj,sharesObj,valPrShareObj)
                }
              })
            }
          
          })
          if(valuationResult.inputData[0].preferenceRatioSelect === RELATIVE_PREFERENCE_RATIO[0]){
            arrayPbRatio.forEach(item => delete item.med);   
          }
          return arrayPbRatio;
        });

        hbs.registerHelper('companyName',()=>{
          if(valuationResult.inputData[0].company)
            return valuationResult.inputData[0].company;
          return '';
        })

        hbs.registerHelper('strdate',()=>{
          if(valuationResult.inputData[0].valuationDate)
            return this.formatDate(new Date(valuationResult.inputData[0].valuationDate));
          return '';
        })

        hbs.registerHelper('checkPreferenceRatio',()=>{
          if( valuationResult.inputData[0].preferenceRatioSelect === RELATIVE_PREFERENCE_RATIO[1])
            return true;
          return false;
        })

        hbs.registerHelper('checkHead',(txt,val)=>{
          if(typeof txt === 'number' && val === 'srNo'){
            return true;
          }
          if(txt === '' && val === 'particular'){
            return true;
          }
          if(txt === 'Value per share' || txt === 'Equity Value' || txt === 'Firm Value'|| txt === 'Net Current Assets' || txt === 'Non Current Assets')
          {
            return true;
          }
          return false
        })

        hbs.registerHelper('generatedOn',(txt,val)=>{
          if(valuationResult?.createdAt)
            return new Date(valuationResult?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
          return '';
        })

        hbs.registerHelper('ifZero', function (value, options) {
          if(value === 0 ){
            return options.fn(this);
          }
          else if(typeof value === 'string'){
            if(value ===''){
              return options.inverse(this);
            }
            else{
              return options.fn(this);
            }
          }
        });

        hbs.registerHelper('checkPeriod',()=>{
          if(valuationResult.inputData[0].discountingPeriod)
            return valuationResult.inputData[0].discountingPeriod;
          return '';
        })

        hbs.registerHelper('isRelativeOrCTM',()=>{
          let method = '';
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === MODEL[2]) return method = 'Comparable Companies';
            if(result.model === MODEL[4]) return method = 'Comparable Industries';
          })
          return method;
        })

        hbs.registerHelper('ifStub',(options)=>{
          let checkiIfStub = false;
          valuationResult.modelResults.forEach((result)=>{
            if(result.valuationData.some(obj => obj.hasOwnProperty('stubAdjValue'))){
              checkiIfStub = true;
            }
          })
              if(checkiIfStub){
                return options.fn(this)
              }
              else{
                return options.inverse(this);
              }
            
          })
        hbs.registerHelper('ifEquityValProvisional',(options)=>{
          let checkiIfprovisional = false;
          valuationResult.modelResults.forEach((result)=>{
            if(result.valuationData.some(obj => obj.hasOwnProperty('equityValueNew'))){
              checkiIfprovisional = true;
            }
          })
              if(checkiIfprovisional){
                return options.fn(this)
              }
              else{
                return options.inverse(this);
              }
            
          })
     

        // Nav helpers
        hbs.registerHelper('netAssetValue',()=>{
          let navData = [];
          valuationResult.modelResults.forEach((result)=>{
            if(result.model === MODEL[5]){
              navData = Object.values(result.valuationData);
             const firmValueInd = navData.findIndex((item:any)=>item.fieldName === 'Firm Value');
             const netCurrentAssetInd = navData.findIndex((item:any)=>item.fieldName === 'Net Current Assets');
             const emptyObj={ //push this empty object to have empty td between two td tags
                fieldName:'',
                // type:'',
                bookValue:'',
                fairValue:''
              }
             navData.splice(firmValueInd,0,emptyObj);
             navData.splice(netCurrentAssetInd,0,emptyObj);

             navData = navData.map((indNav)=>{
              return {
                fieldName:indNav.fieldName,
                // type:indNav.type === 'book_value' ? 'Book Value' : indNav.type === 'market_value' ? 'Market Value' : indNav.type,
                bookValue:indNav?.bookValue ? parseFloat(indNav.bookValue)?.toFixed(3) : indNav?.bookValue,
                fairValue:indNav?.fairValue ? parseFloat(indNav.fairValue)?.toFixed(3) : indNav.value ? parseFloat(indNav.value)?.toFixed(3) : indNav.fairValue
              }
             })
            }
          })
          console.log(navData,"nav data")
          return navData;
        })
      }  

      createPrfnceRtio(data,isCompany){
        const arrayCompany = [];
          data.map((response:any)=>{
            const obj={
              company:isCompany ? response?.company : response.industry,
              peRatio:isCompany && response.peRatio  ? parseFloat(response.peRatio).toFixed(2) : !isCompany && response.currentPE ?  parseFloat(response.currentPE).toFixed(2) : response.peRatio === 0 ? 0 : response.currentPE === 0 ? 0 :  '',
              pbRatio:isCompany && response.pbRatio ? parseFloat(response.pbRatio).toFixed(2) : !isCompany &&  response.pbv ? parseFloat(response.pbv).toFixed(2) : response.pbRatio === 0 ? 0 : response.pbv === 0 ? 0 : '',
              ebitda:isCompany && response.ebitda ? parseFloat(response.ebitda).toFixed(2) : !isCompany && response.evEBITDA_PV ? parseFloat(response.evEBITDA_PV).toFixed(2) :  response.ebitda === 0 ? 0 : response.evEBITDA_PV === 0 ? 0 :  '',
              sales:isCompany && response.sales ? parseFloat(response.sales).toFixed(2) : !isCompany && response.priceSales ? parseFloat(response.priceSales).toFixed(2) : response.sales === 0 ? 0 : response.priceSales === 0 ? 0 : '',
            }
            arrayCompany.push(obj)
          })
          if(isCompany){
            const avgObj = {
              'company':'Average',
              'peRatio':this.findAverage(isCompany ? 'peRatio' : 'currentPE' ,data).toFixed(2),
              'pbRatio':this.findAverage(isCompany ? 'pbRatio' : 'pbv',data).toFixed(2),
              'ebitda':this.findAverage(isCompany ? 'ebitda' : 'evEBITDA_PV',data).toFixed(2),
              'sales': this.findAverage(isCompany ? 'sales' : 'priceSales',data).toFixed(2)
            }
            const medObj = {
              'company':'Median',
              'peRatio':this.findMedian(isCompany ? 'peRatio' : 'currentPE',data).toFixed(2),
              'pbRatio':this.findMedian(isCompany ? 'pbRatio' : 'pbv',data).toFixed(2),
              'ebitda':this.findMedian(isCompany ? 'ebitda' : 'evEBITDA_PV',data).toFixed(2),
              'sales': this.findMedian(isCompany ? 'sales' : 'priceSales',data).toFixed(2)
            }
            arrayCompany.push(avgObj,medObj);
          }
          
        return arrayCompany;
      }

      formatDate(date: Date): string {
        const months = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
    
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
    
        return `${month} ${day}, ${year}`;
      }
    
      findAverage(type:any,company:any){
        const numbers = company.map((c: any) => {
          if (c.company !== 'Median') {
            return c[type];
          } else {
            return null; 
          }
        }).filter((value: any) => value !== null);
        const sum = numbers.reduce(
          (accumulator:any, currentValue:any) => accumulator + currentValue,
          0
        );
        const average = sum / numbers.length;
        return average
      }
    
      findMedian(type: string,company:any) {
        const numbers = company.map((c: any) => {
          if (c.company !== 'Average') {
            return c[type];
          } else {
            return null; 
          }
        }).filter((value: any) => value !== null);
      
        numbers.sort((a: any, b: any) => a - b);
        const middleIndex = Math.floor(numbers.length / 2);
        const isEvenLength = numbers.length % 2 === 0;
      
        if (isEvenLength) {
          return (numbers[middleIndex - 1] + numbers[middleIndex]) / 2;
        } else {
          return numbers[middleIndex];
        }
      }

  async modifyExcelSheet(data) {
    try {
      let originalWorkbook;
      if(fs.existsSync(`./uploads/edited-${data?.excelSheetId}`)){
        originalWorkbook = xlsx.readFile(`./uploads/edited-${data.excelSheetId}`);
      }
      else{
        originalWorkbook = xlsx.readFile(`./uploads/${data.excelSheetId}`)
      }
      if(data.excelSheet !== 'Assessment of Working Capital'){
        let jsonData: any[] = [];
        const worksheet = originalWorkbook.Sheets[data.excelSheet];
        jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
        const transformedData = await this.transformData(jsonData);
        transformedData.map((workBookData)=>{
          data.editedValues.map((dataToModify)=>{
          if(workBookData[0]?.toLowerCase()?.trim() === dataToModify.subHeader.toLowerCase().trim()){
            const colIndex = transformedData[1].findIndex(column => column.toLowerCase().trim() === dataToModify.columnName.toLowerCase().trim());
            workBookData[colIndex] = +dataToModify.newValue;
          }
          })
        })
        transformedData.shift();
  
        const modifiedWorksheet = xlsx.utils.aoa_to_sheet(transformedData);
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, modifiedWorksheet, `${data.excelSheet}`);
  
        for (const sheetName in originalWorkbook.Sheets) {
          if (sheetName !== `${data.excelSheet}`) {
            xlsx.utils.book_append_sheet(newWorkbook, originalWorkbook.Sheets[sheetName], sheetName);
          }
        }
  
        await xlsx.writeFile(newWorkbook, `./uploads/edited-${data?.excelSheetId}`);
  
        return of({
          originalFileName: `${data?.excelSheetId}`,
          modifiedFileName: `edited-${data?.excelSheetId}`,
          msg: 'Excel sheet updated successfully',
          status: true,
        });
      }
      else{
        const uploadDir = path.join(__dirname, '../../uploads');
        const filePath = path.join(uploadDir, data.excelSheetId);
        // console.log(data,"data from modify excel")
        const updatedExcel = await this.appendSheetInExcel(filePath,data);

        if(updatedExcel.status){
          const formatExcel = await this.formatExcelResult(updatedExcel);
          return (
            {
              data:formatExcel,
              status:true,
              msg:'Excel Updated Successfully',
              originalFileName:updatedExcel.originalFileName,
              modifiedFileName:updatedExcel.modifiedFileName
            }
          );
        }
        else{
          return of(
            {
              msg:'Excel update failed',
              updatedExcel
            }
          )
        }
        
      }
     
    } catch (error) {
      return of({
        msg: "Something went wrong",
        error: error.message,
        status: false,
      });
    }
  }

    async formatExcelResult(excelData){
      let arrayExcel = [];
      let index = 0;
      const emptyLineIndex = excelData.data.findIndex(item=>item?.Particulars ==="  ");
    if(emptyLineIndex !== -1){
      excelData.data.splice(emptyLineIndex,1)
    }
      for await(let item of excelData.data){
        const { Particulars, ...rest } = item;
        arrayExcel.push({lineEntry:ASSESSMENT_DATA[index]?.lineEntry,...rest});
        index++;
      }
     return arrayExcel;  
    }

  async appendSheetInExcel(filepath,data){
    try{
      let sheet;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filepath);
      let alreadyExistAssessmentSheet = workbook.getWorksheet('Assessment of Working Capital');
      if(!alreadyExistAssessmentSheet){
        sheet = workbook.addWorksheet('Assessment of Working Capital');

        const headers = Object.keys(data[0]);
        sheet.addRow(headers);

        const headerRow = sheet.getRow(1);

        headerRow.eachCell((cell) => {
          cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'D3D3D3' },
          };
          cell.font = {
              size: 14,
              bold: true,
              color: { argb: '000000' },
          };
          cell.alignment = {
              vertical: 'middle',
              horizontal: 'center',
              wrapText: true,
          };
        });

        sheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: 1, column: headers.length },
        };

        data.forEach((row, index) => {
          const dataRow = sheet.addRow(Object.values(row));

          dataRow.eachCell((cell, cellNumber) => {
              cell.font = {
                  size: 12,
                  color: { argb: '333333' },
              };
              cell.alignment = {
                  vertical: 'middle',
                  horizontal: 'center',
                  wrapText: true,
              };

              if (cellNumber === 1 && (index === 0 || index === 11)) {
                  cell.fill = {
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: { argb: 'ADD8E6' },
                  };
                  cell.font = {
                      size: 14,
                      color: { argb: '000080' },
                      bold: true,
                  };
              }
          });
        });

        const a2 = sheet.getRow(2);
        const a13 = sheet.getRow(13);

        a2.protection = { locked: true };
        a13.protection = { locked: true };
        sheet.getRow(1).protection = { locked: true };

        sheet.columns.forEach((column) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
              const length = cell.value ? cell.value.toString().length : 0;
              maxLength = Math.max(length, maxLength);
          });

          column.width = maxLength < 20 ? 20 : maxLength + 2; // Minimum width set to 20 for readability
        });

        await workbook.xlsx.writeFile(filepath);
        const evaluatedValues = await this.readAndEvaluateExcel(filepath)
      
        return {
          msg:'Excel Appended Successfully',
          status:true,
          data:evaluatedValues
        };
      }
      else {
        // console.log(data,"new data that needs to be appended/updated")
        if(data.length === 0){
          const evaluatedValues = await this.readAndEvaluateExcel(filepath);
          // console.log(formattedData,"if length === 0")
          return {
            msg:'Excel Fetched Successfully',
            status:true,
            data:evaluatedValues
          }
        }
        else{
          let  editedFilePath='';
          const uploadDir = path.join(__dirname, '../../uploads');
          if(data?.excelSheetId.includes('edited')){
             editedFilePath = path.join(uploadDir, `${data?.excelSheetId}`);
          }
          else{
            editedFilePath = path.join(uploadDir, `edited-${data?.excelSheetId}`);
          }
          const workbook= new ExcelJS.Workbook();
          console.log(filepath,"filepath")
          await workbook.xlsx.readFile(filepath);
          let worksheet:any = workbook.getWorksheet('Assessment of Working Capital');

          // manage dynamic formulas
          let startingCalcuationIndex,maxCalculationIndex, summationVlaue=0;
          data.cellData.map((cells:any)=>{
            worksheet.getCell(`${cells.cellAddress}`).value = data.newValue;
            if(cells.sysCode === 3009){
              startingCalcuationIndex = 3;
              maxCalculationIndex = 10;
            }
            else{
              startingCalcuationIndex = 14;
              maxCalculationIndex = 20;
            }
            for(let i = startingCalcuationIndex;i<=maxCalculationIndex;i++){
              const checkIfValue = isNotEmpty(worksheet.getCell(`${cells.columnCell}${i}`)?.value)
               summationVlaue =summationVlaue + (checkIfValue ?  parseFloat(worksheet.getCell(`${cells.columnCell}${i}`).value) : 0);
            }

            ASSESSMENT_DATA.map( async (mainData: any) => {
            const dependentArray = mainData.lineEntry?.dependent;
            const sysCode = mainData.lineEntry?.sysCode;
            if (dependentArray && sysCode && dependentArray.includes(cells.sysCode)) {
              // let formulae = mainData.lineEntry?.formula.replace(/currentOne/g, cells.columnCell);
              // console.log(summationVlaue,"formulae")
              
                // const cell:any = worksheet.getCell(`${cells.columnCell}${mainData.lineEntry?.rowNumber}`).value;
                worksheet.getCell(`${cells.columnCell}${mainData.lineEntry?.rowNumber}`).value = summationVlaue?.toFixed(2);
                
             }
            if (dependentArray && sysCode && dependentArray.includes(cells.sysCode) && mainData.lineEntry.sysCode === 3020) { // update net operating assets
              
                worksheet.getCell(`${cells.columnCell}${mainData.lineEntry?.rowNumber}`).value = (worksheet.getCell(`${cells.columnCell}11`)?.value - worksheet.getCell(`${cells.columnCell}21`)?.value).toFixed(2);
                
             }
            if (dependentArray && sysCode && dependentArray.includes(cells.sysCode) && mainData.lineEntry.sysCode === 3021) { // update change in nca
            await this.updateChangeInNCA(worksheet,mainData)
              
              
              // const firstColumnIndex = xlsx.utils.letterToNumber(firstColumnLetter);
              // const lastColumnIndex = ExcelJS.letterToNumber(lastColumnLetter);
                // worksheet.getCell(`${cells.columnCell}${mainData.lineEntry?.rowNumber}`).value = (worksheet.getCell(`${String.fromCharCode(cells.columnCell.toUpperCase().charCodeAt(0)-1)}23`)?.value - worksheet.getCell(`${cells.columnCell}23`)?.value).toFixed(2);      
              // console.log(String.fromCharCode(cells.columnCell.toUpperCase().charCodeAt(0)+1),"values",mainData.lineEntry?.rowNumber) 
              // await this.updateChangeInNCA(worksheet);
              // console.log(firstColumnLetter,"first column letter")
              // console.log(lastColumnLetter,"last column letter")
              //   console.log("inside for loop")
              // for(let ind = parseInt(String.fromCharCode(firstColumnLetter)); ind <= parseInt(String.fromCharCode(lastColumnLetter)); ind++) {
              //   const currentColumn = String.fromCharCode(ind);
              //   const previousColumn = String.fromCharCode(ind - 1);
                
              //   const currentCellValue = worksheet.getCell(`${currentColumn}23`)?.value;
              //   const previousCellValue = worksheet.getCell(`${previousColumn}23`)?.value;
              //   console.log(currentCellValue,"current cell value",previousCellValue,"previous cell value")
              //   if (!isNaN(currentCellValue) && !isNaN(previousCellValue)) {
              //     const updatedValue = (previousCellValue - currentCellValue).toFixed(2);
              //     worksheet.getCell(`${currentColumn}${mainData.lineEntry?.rowNumber}`).value = updatedValue;
              //   } else {
              //     console.error(`Invalid values found in columns ${previousColumn} and ${currentColumn}`);
              //   }
              // }
            }
          });
        })
          await workbook.xlsx.writeFile(editedFilePath);

          const evaluatedValues = await this.readAndEvaluateExcel(editedFilePath);
          return {
            msg:'Excel Updated Successfully',
            status:true,
            data:evaluatedValues,
            originalFileName: `${data?.excelSheetId}`,
            modifiedFileName: data?.excelSheetId.includes('edited') ? `${data?.excelSheetId}` : `edited-${data?.excelSheetId}`,
          }
        }
      }
    }
    catch(error){
      throw  error
    }
  }

  async updateChangeInNCA(worksheet,mainData){
    let  firstRowName=[]
    let letterIndex = 0; //starting capital letter in ascii format
    let letter;
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (rowNumber === 1 && cell.text) {
          // letter = String.fromCharCode(letterIndex);
          firstRowName.push(letterIndex);
        }
        letterIndex++;
      });
  });
    for await (let columns of firstRowName){
      const currentColumn =  String.fromCharCode(65 + columns);
      const startcurrentColumn =  String.fromCharCode(65 + columns+1);
      const previousColumn = String.fromCharCode(65 + columns - 1);
      if(columns > 0){

        const currentCellValue = await worksheet.getCell(`${currentColumn}23`)?.value;
        const previousCellValue =await worksheet.getCell(`${previousColumn}23`)?.value;
        // console.log(currentCellValue,"curr",previousCellValue,"prev")
        // if () {
          console.log(currentCellValue,"current cell value",previousCellValue,"previous cell value")
          const updatedValue = (previousCellValue - currentCellValue).toFixed(2);
          worksheet.getCell(`${startcurrentColumn}${mainData.lineEntry?.rowNumber}`).value = updatedValue;
          // console.log(worksheet.getCell(`${currentColumn}${mainData.lineEntry?.rowNumber}`).value)
        // }
        console.log(updatedValue,"updated value",`${startcurrentColumn}${mainData.lineEntry?.rowNumber}`)
        //  else {
        //   console.error(`Invalid values found in columns ${previousColumn} and ${currentColumn}`);
        // }
      }
    }
                 
  }


  async  readAndEvaluateExcel(filepath): Promise<any[]> {
 
    let jsonData = xlsx.utils.sheet_to_json((await this.readFile(filepath)).Sheets['Assessment of Working Capital'], { header: 1 });
          
    const head:any = jsonData[0];
    const formattedData = [];

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const obj = {};

      for (let j = 0; j < head.length; j++) {
          obj[head[j]] = row[j] || row[j] === '' ? row[j] : null;
      }

      formattedData.push(obj);
    }
    const emptyLineIndex = formattedData.findIndex(item=>item.Particulars ==="  ");
    if(emptyLineIndex !== -1){
      formattedData.splice(emptyLineIndex,1)
    }
  
  return formattedData;
}

async generatePayload(years,balanceSheet){
    let transformedObject = years.reduce((acc, year, index, array) => {
      if (index < array.length - 1) {
          const nextYear = array[index + 1];
          acc[`${year}-${nextYear}`] = '';
      }
      return acc;
  }, {});
  let provisionalDate = balanceSheet['B1'].v
  transformedObject = {
    [provisionalDate]: '',
    ...transformedObject
};
  // console.log(transformedObject,"transformed object")
  const payload = ASSESSMENT_DATA.map((data,index)=>{
    if(data.lineEntry.sysCode===3001 || data.lineEntry.sysCode === 3011){
      const transformedEntry = { Particulars: data.lineEntry?.particulars };
      for (const key in transformedObject) {
          transformedEntry[key] = null;
      }
      return transformedEntry;
    }

    return {
    Particulars:data.lineEntry?.particulars,
    ...transformedObject
    }
    
  })

  const calculatedPayload = await this.assessmentCalculations(payload,balanceSheet);
// console.log(calculatedPayload,"payload")
  const emptySpaceOne = calculatedPayload.findIndex(item=>item.Particulars === 'Operating Liabilities');
  if(emptySpaceOne !== -1){
    calculatedPayload.splice(emptySpaceOne,0,{Particulars: '  '})
  }
  const emptySpaceTwo = calculatedPayload.findIndex(item=>item.Particulars === 'Net Operating Assets');
  if(emptySpaceTwo !== -1){
    calculatedPayload.splice(emptySpaceTwo,0,{Particulars: '  '})
  }
 
  return calculatedPayload;
}

async assessmentCalculations(payload,balanceSheet){
  await Promise.all(payload.map(async (data,i) => {
    let keysToProcess = Object.keys(data).filter(key => key !== 'Particulars');
        if (i === 1) {

            for (const key of keysToProcess) {
                data[key] = (await getCellValue(
                    balanceSheet,
                    `${columnsList[keysToProcess.indexOf(key) ] + sheet2_BSObj.tradeReceivablesRow}`
                ))?.toFixed(2);
            }
        }
        if(i === 2){

          for (const key of keysToProcess) {
              data[key] = (await getCellValue(
                  balanceSheet,
                  `${columnsList[keysToProcess.indexOf(key) ] + sheet2_BSObj.unbilledRevenuesRow}`
              ))?.toFixed(2);
          }
        }
        if(i === 3){

          for (const key of keysToProcess) {
              data[key] = (await getCellValue(
                  balanceSheet,
                  `${columnsList[keysToProcess.indexOf(key) ] + sheet2_BSObj.inventoriesRow}`
              ))?.toFixed(2);
          }
        }
        if(i === 4){

          for (const key of keysToProcess) {
              data[key] = (await getCellValue(
                  balanceSheet,
                  `${columnsList[keysToProcess.indexOf(key)] + sheet2_BSObj.advancesRow}`
              )).toFixed(2);
          }
        }
        if(i === 5){

          for (const key of keysToProcess) {
              data[key] = (await getCellValue(
                  balanceSheet,
                  `${columnsList[keysToProcess.indexOf(key) ] + sheet2_BSObj.shortTermInvestmentsRow}`
              ))?.toFixed(2);
          }
        }
        if(i === 6){

          for (const key of keysToProcess) {
              data[key] = (await getCellValue(
                  balanceSheet,
                  `${columnsList[keysToProcess.indexOf(key) ] + sheet2_BSObj.otherCurrentAssetsRow}`
              ))?.toFixed(2);
          }
        }
        if(i === 7){

          for (const key of keysToProcess) {
              data[key] = (await getCellValue(
                  balanceSheet,
                  `${columnsList[keysToProcess.indexOf(key) ] + sheet2_BSObj.otherNonCurrentAssetsRow}`
              ))?.toFixed(2);
          }

        }
       
        if(i === 9){

          for await (const key of keysToProcess) {
              data[key] = (parseFloat(payload[1][key]) + parseFloat(payload[2][key]) + parseFloat(payload[3][key]) + parseFloat(payload[4][key]) + parseFloat(payload[5][key]) + parseFloat(payload[6][key]) + parseFloat(payload[7][key])).toFixed(2) 
          }
        }
        if(i===11){

          for (const key of keysToProcess) {
            data[key] = (await getCellValue(
                balanceSheet,
                `${columnsList[keysToProcess.indexOf(key)] + sheet2_BSObj.tradePayablesRow}`
            ))?.toFixed(2);
        }
        }
        if(i===12){

          for (const key of keysToProcess) {
            data[key] = (await getCellValue(
                balanceSheet,
                `${columnsList[keysToProcess.indexOf(key)] + sheet2_BSObj.employeePayablesRow}`
            ))?.toFixed(2);
          }
        }
        if(i === 13){

          for (const key of keysToProcess) {
            data[key] = (await getCellValue(
                balanceSheet,
                `${columnsList[keysToProcess.indexOf(key) ] + sheet2_BSObj.lcPayablesRow}`
            ))?.toFixed(2);
          }
        }
        if(i === 14){

          for (const key of keysToProcess) {
            data[key] = (await getCellValue(
                balanceSheet,
                `${columnsList[keysToProcess.indexOf(key) ] + sheet2_BSObj.otherCurrentLiabilitiesRow}`
            ))?.toFixed(2);
          }
        }
        if(i === 15){

          for (const key of keysToProcess) {
            data[key] = (await getCellValue(
                balanceSheet,
                `${columnsList[keysToProcess.indexOf(key) ] + sheet2_BSObj.shortTermProvisionsRow}`
            ))?.toFixed(2);
          }
        }
        if(i === 16){

          for (const key of keysToProcess) {
            data[key] = (await getCellValue(
                balanceSheet,
                `${columnsList[keysToProcess.indexOf(key) ] + sheet2_BSObj.longTermProvisionRow}`
            ))?.toFixed(2);
          }
        }
        if(i === 18){
          for await(const key of keysToProcess) {
            data[key] = (parseFloat(payload[11][key]) + parseFloat(payload[12][key]) + parseFloat(payload[13][key]) + parseFloat(payload[14][key]) + parseFloat(payload[15][key]) + parseFloat(payload[16][key])).toFixed(2); 
        }
      }
      if(i ===19){ // add net operating liablities in excel
        for await(const key of keysToProcess) {
          data[key] = (parseFloat(payload[9][key]) - parseFloat(payload[18][key])).toFixed(2); 
        }
      }
      if(i ===20){
        for await(const key of keysToProcess) { // add change in nca in excel
          if(keysToProcess.indexOf(key) < keysToProcess.length-1){
                data[ keysToProcess[  keysToProcess.indexOf(key)+1]] = (parseFloat(payload[19][key]) - parseFloat(payload[19][`${await keysToProcess[await keysToProcess.indexOf(key)+1]}`])).toFixed(2); 
           }
      }
      }
}));
return payload
}

async getTotalValue(worksheet,startRow,endRow,cellName){
  let summationVlaue=0;
  for(let i = startRow;i<=endRow;i++){
    if(worksheet[`${cellName}${i}`]){
      summationVlaue =summationVlaue +  parseFloat(worksheet[`${cellName}${i}`]?.v) ;
    }
  }
  return summationVlaue;
}
}