import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import hbs = require('handlebars');
import { InjectModel } from '@nestjs/mongoose';
import { Model, model } from 'mongoose';
import { ReportDocument } from './schema/report.schema';
import { MODEL } from 'src/constants/constants';
import { FCFEAndFCFFService } from 'src/valuationProcess/fcfeAndFCFF.service';

@Injectable()
export class ReportService {
    constructor( private valuationService:ValuationsService,
      @InjectModel('report')
    private readonly reportModel: Model<ReportDocument>,
    private fcfeService:FCFEAndFCFFService){}

     async getReport(id,res){
          const transposedData = [];
          const getReportData = await this.reportModel.findById(id);
            const valuationResult = await this.valuationService.getValuationById(getReportData.reportId);
            let htmlFilePath,pdfFilePath;
            let dateStamp = `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}-${new Date().getHours()}${new Date().getMinutes()}` 
            htmlFilePath = path.join(process.cwd(), 'html-template', 'basic-report.html');
               pdfFilePath = path.join(process.cwd(), 'pdf', `Ifinworth Valuation-${dateStamp}.pdf`);

              for await (let data of valuationResult.modelResults) {
                if(data.model !== MODEL[2] && data.model !== MODEL[4] && data.model !== MODEL[5]){
                  transposedData.push({ model: data.model, data: await this.fcfeService.transformData(data.valuationData) });
                }  
              }
            this.loadHelpers(transposedData, valuationResult,getReportData);
          
            if (valuationResult.modelResults.length > 0) {
              const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
              const template = hbs.compile(htmlContent);
              const html = template(valuationResult);
        
              const pdf = await this.generatePdf(html, pdfFilePath);
  
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', `attachment; filename="='Ifinworth Valuation Report' }-${dateStamp}.pdf"`);
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
            printBackground: true,
            footerTemplate: `<div style="width:100%">
            <hr style="border:1px solid #bbccbb">
        <h1 style="padding-left: 5%;text-indent: 0pt;text-align: center;font-size:11px;color:#5F978E;"><span style="font-weight:400 !important;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></span> <span style="float: right;padding-right: 3%;font-size:12px"> Private &amp; confidential </span></h1>
        </div>`,
        //   headerTemplate: `
        //   <table width="100%" border="0" cellspacing="0" cellpadding="0">
        //   <tr>
        //   <td style="width:86.2%;">
          
        //     <table border="0" cellspacing="0" cellpadding="0" style="height: 20px;width:100% !important;padding-left:2%;">
        //       <tr>
        //         <td style="border-bottom: solid 2px #03002f !important; font-size: 13px; height: 5px;width:100% !important;">Ifinworth Advisors Private Ltd.</td>
        //       </tr>

        //       <tr>
        //         <td style="font-size: 11px">&nbsp;</td>
        //       </tr>
        //     </table>
        //   </td>
        // <td  align="right" style="padding-right:1%;" height="10px"><img src="${mainLogo}" width="100" height="" /></td>
        // </tr></table>`
          });

          return pdf;
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          await browser.close();
         
        }
      }

    async createReport(data){
      let registerValuerPayload;
      if(!data.useExistingValuer){
       registerValuerPayload={
          registeredValuerName: 'Nitish Chaturvedi',
          registeredValuerEmailId: 'nitish@ifinworth.com',
          registeredValuerIbbiId: 'IBBI/LAD/35/2020',
          registeredValuerMobileNumber: '9878678776',
          registeredValuerGeneralAddress: 'Sterling Enterprises,Andheri (West)',
          registeredvaluerDOIorConflict: 'No',
          registeredValuerQualifications: 'Government Valuation License Holder'
        }
      }
      else{
        registerValuerPayload={
          registeredValuerName: data?.registeredValuerName,
          registeredValuerEmailId: data?.registeredValuerEmailId,
          registeredValuerIbbiId: data?.registeredValuerIbbiId,
          registeredValuerMobileNumber: data?.registeredValuerMobileNumber,
          registeredValuerGeneralAddress: data?.registeredValuerGeneralAddress,
          registeredvaluerDOIorConflict: data?.registeredvaluerDOIorConflict,
          registeredValuerQualifications: data?.registeredValuerQualifications
        }
      }
      let appointeeDetailsPayload:{};
      if(!data.appointeeDetails){
        appointeeDetailsPayload={
            appointingAuthorityName: data?.appointingAuthorityName,
            dateOfAppointment: data?.dateOfAppointment
        }
      } 
      const payload= {
        clientName:data.clientName,
        registeredValuerDetails:registerValuerPayload,
        appointeeDetails:appointeeDetailsPayload,
        reportId:data?.reportId,
        useExistingValuer:data?.useExistingValuer,
        reportDate:data?.reportDate
      }
      try {
        const createdFoo = await this.reportModel.create(payload);
        return createdFoo._id;
      } catch (e) {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      }
    }

   loadHelpers(transposedData,valuationResult,getReportData){
      hbs.registerHelper('companyName',()=>{
        if(valuationResult.inputData[0].company)
          return valuationResult.inputData[0].company;
        return '';
      })

      hbs.registerHelper('reportDate',()=>{
        if(getReportData.registeredValuerDetails[0]) 
            return  this.formatDate(new Date(getReportData.reportDate));
        return '';
      })

      hbs.registerHelper('strdate',()=>{
        if(valuationResult.inputData[0].valuationDate)
          return this.formatDate(new Date(valuationResult.inputData[0].valuationDate));
        return '';
      })

      hbs.registerHelper('registeredValuerName',()=>{
        if(getReportData.registeredValuerDetails[0]) 
            return  getReportData.registeredValuerDetails[0].registeredValuerName
        return '';
      })

      hbs.registerHelper('registeredValuerAddress',()=>{
        if(getReportData.registeredValuerDetails[0]) 
            return  getReportData.registeredValuerDetails[0].registeredValuerCorporateAddress ? getReportData.registeredValuerDetails[0].registeredValuerCorporateAddress : getReportData.registeredValuerDetails[0].registeredValuerGeneralAddress
        return '';
      })

      hbs.registerHelper('registeredValuerEmailId',()=>{
        if(getReportData.registeredValuerDetails[0]) 
            return  getReportData.registeredValuerDetails[0].registeredValuerEmailId; 
        return '';
      })

      hbs.registerHelper('registeredValuerMobileNumber',()=>{
        if(getReportData.registeredValuerDetails[0]) 
            return  getReportData.registeredValuerDetails[0].registeredValuerMobileNumber; 
        return '';
      })
      hbs.registerHelper('registeredValuerIbbiId',()=>{
        if(getReportData.registeredValuerDetails[0]) 
            return  getReportData.registeredValuerDetails[0].registeredValuerIbbiId; 
        return '';
      })
      hbs.registerHelper('registeredValuerQualifications',()=>{
        if(getReportData.registeredValuerDetails[0]) 
            return  getReportData.registeredValuerDetails[0].registeredValuerQualifications; 
        return '';
      })
      hbs.registerHelper('appointingAuthorityName',()=>{
        if(getReportData.appointeeDetails[0]) 
            return  getReportData.appointeeDetails[0].appointingAuthorityName; 
        return '';
      })
      hbs.registerHelper('dateOfAppointment',()=>{
        if(getReportData.appointeeDetails[0]) 
            // return  getReportData.appointeeDetails[0].dateOfAppointment; 
            // let apptDate = await getReportData.appointeeDetails[0].dateOfAppointment; 
            return this.formatDate(new Date(getReportData.appointeeDetails[0].dateOfAppointment));
        return '';
      })
      hbs.registerHelper('clientName',()=>{
        if(getReportData.registeredValuerDetails[0]) 
            return  getReportData.clientName; 
        return '';
      })
      hbs.registerHelper('location',()=>{
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0].location; 
        return '';
      })
      hbs.registerHelper('riskFreeRate',()=>{
        // console.log(valuationResult.inputData[0],"data")
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0].riskFreeRate;
        return '';
      })
      hbs.registerHelper('expMarketReturn',()=>{
        // console.log(valuationResult.inputData[0],"data")
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0]?.expMarketReturn.toFixed(3);
        return '';
      })
      hbs.registerHelper('beta',()=>{
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0]?.beta;
        return '';
      })
      hbs.registerHelper('companyRiskPremium',()=>{
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0]?.riskPremium;
        return '';
      })
      hbs.registerHelper('costOfEquity',()=>{
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0].costOfEquity?.toFixed(3);
        return '';
      })
      hbs.registerHelper('adjustedCostOfEquity',()=>{
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0]?.adjustedCostOfEquity?.toFixed(3);
        return '';
      })
      hbs.registerHelper('wacc',()=>{
        if(valuationResult.inputData[0] && valuationResult.inputData[0].model.includes(MODEL[1])) 
            return valuationResult.inputData[0]?.wacc?.toFixed(3);
        return '0';
      })
      hbs.registerHelper('costOfDebt',()=>{
        if(valuationResult.inputData[0] && valuationResult.inputData[0].model.includes(MODEL[1])) 
            return parseFloat(valuationResult.inputData[0]?.costOfDebt)?.toFixed(3);
        return '0';
      })
      hbs.registerHelper('taxRate',()=>{
        if(valuationResult.inputData[0] ) 
            return valuationResult.inputData[0]?.taxRate;
        return '0';
      })
      hbs.registerHelper('terminalGrowthRate',()=>{
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0]?.terminalGrowthRate;
        return '0';
      })
      hbs.registerHelper('valuePerShare',()=>{
        if(transposedData[0].data.transposedResult[1])
          return valuationResult.modelResults.map((response)=>{
            if(response.model===MODEL[0] || response.model === MODEL[1])
              return response?.valuationData[0]?.valuePerShare.toFixed(2);
          });
          return '';
      })
      hbs.registerHelper('equityPerShare',()=>{
        if(transposedData[0].data.transposedResult[1])
        return valuationResult.modelResults.map((response)=>{
          if(response.model===MODEL[0] || response.model === MODEL[1]){
            const formattedNumber = Math.floor(response?.valuationData[0]?.equityValue * 100000).toLocaleString('en-IN');
            return formattedNumber.replace(/,/g, ',');
          }
        });
        return '';
      })
      hbs.registerHelper('auditedYear',()=>{
        if(transposedData)
          return '2023';
        return '';
      })
      hbs.registerHelper('projectedYear',()=>{
        const projYear = transposedData[0].data.transposedResult[transposedData[0].data.transposedResult?.length - 2][0];
        if(transposedData)
          return `20${projYear.split('-')[1]}`;
        return '2028';
      })
      hbs.registerHelper('bse500Value',()=>{
        if(valuationResult.inputData[0])
          return parseFloat(valuationResult.inputData[0]?.bse500Value).toFixed(2);
        return '0';
      })
      hbs.registerHelper('freeCashFlow',()=>{
        if(transposedData[0].data.transposedResult[1])
          return valuationResult.modelResults.map((response)=>{
            if(response.model===MODEL[0] || response.model === MODEL[1])
              return response?.valuationData[0].presentFCFF.toFixed(2);
          });
          return '';
      })
      hbs.registerHelper('terminalValue',()=>{
        let terminalVal='';
        if(valuationResult.modelResults){
          valuationResult.modelResults.map((response)=>{
            if(response.model===MODEL[0] || response.model === MODEL[1])
               response?.valuationData.map((perYearData)=>{
                if(perYearData.particulars === 'Terminal Value'){
                  terminalVal = perYearData?.fcff.toFixed(2);
                }
              });
          });
          return terminalVal;
        }
        return terminalVal
      })
      hbs.registerHelper('currencyUnit',()=>{
        console.log(valuationResult.inputData[0].currencyUnit,"currency")
        if(valuationResult.inputData[0].currencyUnit)
          return valuationResult.inputData[0].currencyUnit;
        return 'INR';
      })
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
}
