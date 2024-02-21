import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { utilsService } from "src/utils/utils.service";
import hbs = require('handlebars');
import * as converter from 'number-to-words'

@Injectable()
export class mandateReportService {
    constructor(private utilService: utilsService){}
    async generateMandateReport(id, res){
        try{
            const mandateDetails:any = await this.utilService.fetchMandateByLinkId(id);

            let htmlFilePath = path.join(process.cwd(), 'html-template', `mandate.html`);
            let pdfFilePath = path.join(process.cwd(), 'pdf', `${mandateDetails.data.companyName}.pdf`);

        
            await this.loadMandateHelpers(mandateDetails.data);
        
            const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
            const template = hbs.compile(htmlContent);
            const html = template(mandateDetails);
        
            let pdf =  await this.createpdf(html, pdfFilePath, mandateDetails.data);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="='Mandate - ${mandateDetails.data.companyName}'.pdf"`);
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
                msg:"mandate pdf generation failed"
            }
        }
    }

    async loadMandateHelpers(mandateDetails){
        try{
            hbs.registerHelper('companyAddress',()=>{
                if(mandateDetails.companyAddress)
                    return mandateDetails.companyAddress;
                return '';
            })

            hbs.registerHelper('companyName',()=>{
                if(mandateDetails.companyName)
                    return mandateDetails.companyName;
                return '';
            })

            hbs.registerHelper('totalFees',()=>{
                if(mandateDetails.totalFees)
                    return mandateDetails.totalFees;
                return '';
            })

            hbs.registerHelper('totalFeesInWords',()=>{
                if(mandateDetails.totalFees)
                    return `Rupees ${converter.toWords(+mandateDetails.totalFees)} Only`;;
                return '';
            })
        }
        catch(error){
            return{
                error:error,
                msg:"mandate helpers failed"
            }
        }
    }

    async createpdf(htmlContent: any, pdfFilePath: string, mandateDetails) {
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
            displayHeaderFooter: true,
            printBackground: true,
            margin: {
              top: "35px",
              right: "0px",
              bottom: "50px",
              left: "0px"
          },
          headerTemplate:`<table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
          <td style="width:100%;">
            <table border="0" cellspacing="0" cellpadding="0" style="height: 20px;width:100% !important;padding-left:3%;padding-right:3%">
              <tr>
                <td style=" border-bottom: 1px solid #bbccbb !important;font-size: 13px; height: 5px;width:100% !important;text-align:right;font-size:12px;font-family:Georgia, 'Times New Roman', Times, serif;"><i>Valuation of equity shares of <span style="text-transform:capitalize">${mandateDetails.companyName}</span></i></td>
              </tr>
              <tr>
                <td style="font-size: 11px">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr></table>`,
            footerTemplate: `<div style="width:100%;padding-left:3%;padding-right:3%">
            <hr style="border:1px solid #bbccbb">
            <h1 style="text-indent: 0pt;text-align: center;font-size:11px;color:#5F978E;"><span style="float: left;padding-right: 3%;font-size:12px;font-family:Georgia, 'Times New Roman', Times, serif;"> <i>Privileged &amp; confidential</i> </span><span style="font-weight:400 !important;float:right;font-size:12px;font-family:Georgia, 'Times New Roman', Times, serif;">Page <span class="pageNumber"></span> </span></span></h1>
            </div>`,
          });

          return pdf;
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          await browser.close();
         
        }
      }
}