import { HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { utilsService } from "src/utils/utils.service";
import hbs = require('handlebars');
import * as converter from 'number-to-words'
import { NATURE_OF_INSTRUMENT, PURPOSE_OF_REPORT_AND_SECTION, REPORT_PURPOSE } from "src/constants/constants";
import { formatDate, transformData } from "./report-common-functions";
import { ProcessStatusManagerService } from "src/processStatusManager/process-status-manager.service";
import * as xlsx from 'xlsx';
import { thirdpartyApiAggregateService } from "src/library/thirdparty-api/thirdparty-api-aggregate.service";

@Injectable()
export class mrlReportService {
    constructor(private utilService: utilsService,
      private processStateManagerService: ProcessStatusManagerService,
      private thirdPartyApiAggregateService: thirdpartyApiAggregateService){}
    async generateMrlReport(id, res){
        try{
            const applicationData:any = await this.processStateManagerService.fetchProcess(id);
            if(!applicationData.status) 
              throw new NotFoundException({
                  statusCode: HttpStatus.NOT_FOUND,
                  message: 'Application data not found, check processId',
                  error: 'Not Found',
                }).getResponse();

            const stageOneData = applicationData.stateInfo.firstStageInput;
            const computeExcelSheet = await this.excelSheetComputation(stageOneData);
              

            let htmlFilePath = path.join(process.cwd(), 'html-template', `management-representation-letter.html`);
            let pdfFilePath = path.join(process.cwd(), 'pdf', `mrl.pdf`);

        
           await this.loadMrlHelpers(applicationData.stateInfo, computeExcelSheet);
        
            const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
            const template = hbs.compile(htmlContent);
            const html = template(applicationData.stateInfo);
        
            let pdf =  await this.createpdf(html, pdfFilePath);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="='Mrl'.pdf"`);
            res.send(pdf);
    
            return {
                msg: "PDF download Success",
                status: true,
            };
        }
        catch(error){
            return {
                error:error,
                status:false,
                msg:"Mrl service report generation failed"
            }
        }
    }

    async loadMrlHelpers(processStateInfo, excelSheetData){
        try{
            hbs.registerHelper('companyName',()=>{
                if(processStateInfo.firstStageInput.company)
                    return processStateInfo.firstStageInput?.company;
                return '';
            })

            hbs.registerHelper('natureOfInstrument',()=>{
                if(processStateInfo.sixthStageInput.natureOfInstrument)
                    return NATURE_OF_INSTRUMENT[`${processStateInfo.sixthStageInput?.natureOfInstrument}`];
                return '';
            })

            hbs.registerHelper('dateOfAppointment',()=>{
                if(processStateInfo.sixthStageInput.dateOfAppointment){
                  return formatDate(new Date(processStateInfo.sixthStageInput?.dateOfAppointment));
                }
                return '';
            })

            hbs.registerHelper('conditionalWidth', function(index, options) {
              return index === 0 ? '25%' : 'auto';
             })

            hbs.registerHelper('columnAlignment', function(index: number) {
              return index === 0 ? 'left' : 'right';
            });

            hbs.registerHelper('dateOfIncorporation',()=>{
                if(processStateInfo.sixthStageInput.dateOfIncorporation)
                    return formatDate(new Date(processStateInfo.sixthStageInput?.dateOfIncorporation));
                return '';
            })

            hbs.registerHelper('valuationDate',()=>{
                if(processStateInfo.firstStageInput.valuationDate)
                    return formatDate(new Date(processStateInfo.firstStageInput?.valuationDate));
                return '';
            })

            hbs.registerHelper('cinNumber',()=>{
                if(processStateInfo.sixthStageInput?.cinNumber)
                    return processStateInfo.sixthStageInput?.cinNumber;
                return '';
            })

            hbs.registerHelper('companyAddress',()=>{
                if(processStateInfo.sixthStageInput?.companyAddress)
                    return processStateInfo.sixthStageInput?.companyAddress;
                return '';
            })

            hbs.registerHelper('sectionAndPurposeOfReport', ()=>{
              let outputObject = {};
              let outputString = [];
              let letterIndex = 97; // this is the ASCII code start
              for (const indPurpose of processStateInfo.sixthStageInput.reportPurpose ){
                if(PURPOSE_OF_REPORT_AND_SECTION[indPurpose].length){
                  let keys = Object.keys(processStateInfo.sixthStageInput.reportSection);
                  for (let i = 0; i < keys.length; i++){
                    if(PURPOSE_OF_REPORT_AND_SECTION[indPurpose].includes(processStateInfo.sixthStageInput.reportSection[i])){
                      const key = keys[i];
                      let element;
                      if (letterIndex > 97) {
                          element = ` ${processStateInfo.sixthStageInput.reportSection[key]}`;
                      } else {
                          element = `${processStateInfo.sixthStageInput.reportSection[key]}`;
                      }
                      outputObject[element] = key;
                      letterIndex++;
                    }
                  }
                  let outputArray = Object.keys(outputObject);
                  if (outputArray.length > 1) {
                      let lastElement = outputArray.pop();
                      outputArray.push(`and ${lastElement}`);
                  }
                  if(outputString.length){
                    outputString.push(" and " + outputArray.join(', ').replace(/,([^,]*)$/, ' $1') + ' of ' + REPORT_PURPOSE[`${indPurpose}`]);
                  }
                  else{
                    outputString.push(outputArray.join(', ').replace(/,([^,]*)$/, ' $1') +' of ' + REPORT_PURPOSE[`${indPurpose}`]);
                  }
                }
              }
              return outputString;
          });

          hbs.registerHelper('profitAndLossExcel',()=>{
            if(excelSheetData['P&L'])
                return excelSheetData['P&L'];
            return '';
        })
          hbs.registerHelper('balanceSheetExcel',()=>{
            if(excelSheetData['BS'])
                return excelSheetData['BS'];
            return '';
        })
          hbs.registerHelper('profitAndLossExcelHeaders',()=>{
            if(excelSheetData['P&L']){
              const headers = excelSheetData['P&L'][0].map((excelResponse)=>{
                return {head:excelResponse};
              })
              return headers
            }
            return '';
        })
          hbs.registerHelper('balanceSheetExcelHeaders',()=>{
            if(excelSheetData['BS']){
              const headers = excelSheetData['BS'][0].map((excelResponse)=>{
                return {head:excelResponse};
              })
              return headers
            }
            return '';
        })
        hbs.registerHelper('natureOfInstrument',()=>{
          if(processStateInfo.sixthStageInput.natureOfInstrument)
            return NATURE_OF_INSTRUMENT[`${processStateInfo.sixthStageInput.natureOfInstrument}`];
          return '';
        })
        }
        catch(error){
          console.log(error,"error")
            return{
                error:error,
                msg:"mandate helpers failed"
            }
        }
    }

    async createpdf(htmlContent: any, pdfFilePath: string) {
        const browser = await puppeteer.launch({
          headless:"new",
          executablePath: process.env.PUPPETEERPATH
        });
        const page = await browser.newPage();

        try {
          const contenread = await page.setContent(htmlContent);
          const pdf = await page.pdf({
            path: pdfFilePath,
            format: 'A4' as puppeteer.PaperFormat,
            displayHeaderFooter: false,
            printBackground: true,
            margin: {
              top: "35px",
              right: "0px",
              bottom: "50px",
              left: "0px"
          },
          

          headerTemplate: `
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding-left:7%;padding-right:0%;">
              <tr>
                <td style="width:50%;">
                  <table border="0" cellspacing="0" cellpadding="0" style="height: auto; width:100% !important; padding-left:3%; padding-right:3%">
                    <tr>
                      <td style="font-size: 13px; height: 5px; width:100% !important; text-align:left; font-size:12px; font-family:Calibri, sans-serif;line-height:160%">
                        <b></b> <span style="font-size:14px;color:#4f4f4f;">Nitish Chaturvedi</span><br>
                        <b></b> <span style="font-size:14px;color:#4f4f4f;">REGISTERED VALUER - Securities or Financial Assets</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px">&nbsp;</td>
                    </tr>
                  </table>
                </td>
                <td style="width:50%;">
                  <table border="0" cellspacing="0" cellpadding="0" style="height: auto; width:100% !important; padding-left:14%;">
                    <tr>
                      <td style="font-size: 14px; height: 5px; width:100% !important; text-align:left; font-size:12px; font-family:Calibri, sans-serif;line-height:160%;padding-left:9%">
                        <b>Corporate Address:</b><br>
                        Unit No. 8, 2nd Floor,<br>
                        Senior Estate, 7/C, Parsi Panchayat Road,<br>
                        Andheri (East), Mumbai - 400069<br>
                        <b>Email:</b> <a href="#">chaturvedinitish@gmail.com</a><br>
                        <b>Mobile:</b> 9997354674
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 11px">&nbsp;</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>`,

            footerTemplate: `<div style="width:100%;padding-left:3%;padding-right:3%">
            <hr style="border: 1px solid rgba(187, 204, 187, 0.5);width:80%">
            <h1 style="text-indent: 0pt;text-align: center;font-size:11px;color:#5F978E;"><span style="float: left;padding-right: 3%;font-size:12px;font-family:'Carlito', sans-serif;"> <i></i> </span><span style="font-weight:400 !important;float:right;font-size:13px;font-family:'Carlito', sans-serif;color:#cceecc;padding-right:10%;padding-top:1%;font-weight:bold !important;"> <span class="pageNumber" style="color:#6F2F9F;font-weight:400;"></span> &nbsp;&nbsp; | &nbsp;&nbsp; Page  </span></span></h1>
            </div>`,
          });

          return pdf;
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          await browser.close();
         
        }
      }

      async readFile(fileName: string): Promise<xlsx.WorkBook> {
        return new Promise(async (resolve, reject) => {
          const uploadDir = path.join(process.cwd(),'uploads');

          const filePath = path.join(uploadDir, fileName);
          if (!fs.existsSync(filePath)) {
            await this.thirdPartyApiAggregateService.fetchFinancialSheetFromS3(fileName);       //If excel is not found in uploads folder, download it from S3
            return;
          }
          const  workbook = xlsx.readFile(filePath);
          resolve(workbook);
        });
      }

      async excelSheetComputation(data){
        try{
          const excelSheetId = data.isExcelModified ? data.modifiedExcelSheetId : data.excelSheetId;
          const workbook = await this.readFile(excelSheetId); 

          let excelSheetDataObject = {};
          let excelSheet = ['P&L','BS']
          for(let i =0; i<excelSheet.length;i++){   //Running this loop twice cause we need only P&L and BS in mandate pdf (if more than two sheets data is required increment the counter)
            const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[excelSheet[i]]);
            sheetData.forEach((row:any) => {
                for (let columns in row) {
                  if (typeof row[columns] === 'string') {
                    row[columns] = row[columns].replace(/\r\n/g, '');
                  }

                  if (typeof row[columns] === 'number') {
                    row[columns] = parseFloat(row[columns].toFixed(2));
                  }

                  if (typeof columns === 'string') {
                    const cleanedColumn = columns.trim().replace(/^\s+/g, '').replace(/\r\n/g, '');
                    if (columns !== cleanedColumn) {
                      row[cleanedColumn] = row[columns];
                      delete row[columns];
                    }
                  }
                }
            });
            excelSheetDataObject[excelSheet[i]] = await transformData(sheetData);
          }
          return excelSheetDataObject;
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:"Excel sheet computation failed"
          }
        }
      }
}