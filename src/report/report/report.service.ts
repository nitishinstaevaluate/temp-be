import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import hbs = require('handlebars');

@Injectable()
export class ReportService {
    constructor( private valuationService:ValuationsService){}
     async createReport(id,res){
        
            const valuationResult = await this.valuationService.getValuationById(id);
            let htmlFilePath,pdfFilePath;
            let dateStamp = `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}-${new Date().getHours()}${new Date().getMinutes()}` 
            htmlFilePath = path.join(process.cwd(), 'html-template', 'basic-report.html');
               pdfFilePath = path.join(process.cwd(), 'pdf', `Ifinworth Valuation-${dateStamp}.pdf`);
  
            // this.loadHelpers(transposedData, valuationResult);
          
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
}
