import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import hbs = require('handlebars');
import { InjectModel } from '@nestjs/mongoose';
import { Model, model } from 'mongoose';
import { ReportDocument } from './schema/report.schema';
import { ALPHA, AWS_STAGING, CAPITAL_STRUCTURE_TYPE, DOCUMENT_UPLOAD_TYPE, GET_MULTIPLIER_UNITS, INCOME_APPROACH, MARKET_PRICE_APPROACH, METHODS_AND_APPROACHES, MODEL, NATURE_OF_INSTRUMENT, NET_ASSET_VALUE_APPROACH, RELATIVE_PREFERENCE_RATIO, REPORT_LINE_ITEM, REPORT_PURPOSE } from 'src/constants/constants';
import { FCFEAndFCFFService } from 'src/valuationProcess/fcfeAndFCFF.service';
import { CalculationService } from 'src/calculation/calculation.service';
const FormData = require('form-data');
import ConvertAPI from 'convertapi';
import { IFIN_REPORT, SYNC_FUSION_DOC_CONVERT } from 'src/interfaces/api-endpoints.prod';
import { axiosInstance } from 'src/middleware/axiosConfig';
require('dotenv').config();
import * as converter from 'number-to-words'

@Injectable()
export class ReportService {
    constructor( private valuationService:ValuationsService,
      @InjectModel('report')
    private readonly reportModel: Model<ReportDocument>,
    private fcfeService:FCFEAndFCFFService,
    private calculationService:CalculationService){}

    async getReport(id,res,approach){
      try {
          const transposedData = [];
          let  getCapitalStructure;
          let htmlFilePath, pdfFilePath,docFilePath,pdf;
          const reportDetails = await this.reportModel.findById(id);
          const valuationResult:any = await this.valuationService.getValuationById(reportDetails.reportId);


          if(reportDetails.reportPurpose === Object.keys(REPORT_PURPOSE)[0]){
            htmlFilePath = path.join(process.cwd(), 'html-template', `${approach === METHODS_AND_APPROACHES[0] ? 'basic-report' : approach === METHODS_AND_APPROACHES[1] ? 'nav-report' :  (approach === METHODS_AND_APPROACHES[3] || approach === METHODS_AND_APPROACHES[4]) ? 'comparable-companies-report' : approach === METHODS_AND_APPROACHES[2]? 'multi-model-report':''}.html`);
            // htmlFilePath = path.join(process.cwd(), 'html-template', `transfer-of-shares-report.html`);
          }
          else if(reportDetails.reportPurpose === Object.keys(REPORT_PURPOSE)[3]){
            htmlFilePath = path.join(process.cwd(), 'html-template', `sebi-report.html`);
          }
          pdfFilePath = path.join(process.cwd(), 'pdf', `${valuationResult.inputData[0].company}-${reportDetails.id}.pdf`);
          docFilePath = path.join(process.cwd(), 'pdf', `${valuationResult.inputData[0].company}-${reportDetails.id}.docx`);
          
          if(reportDetails?.fileName){
            const convertDocxToPdf = await this.convertDocxToPdf(docFilePath,pdfFilePath);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="='${valuationResult.inputData[0].company}-${reportDetails.id}'.pdf"`);
            res.send(convertDocxToPdf);

             return {
                  msg: "PDF download Success",
                  status: true,
              };
          }


          if(valuationResult.inputData[0].model.includes(MODEL[1])){
            const taxRate = valuationResult.inputData[0].taxRate.includes('%') ? parseFloat(valuationResult.inputData[0].taxRate.replace("%", "")) : valuationResult.inputData[0].taxRate;
             getCapitalStructure = await this.calculationService.getWaccExcptTargetCapStrc(
              +valuationResult.inputData[0].adjustedCostOfEquity,
              valuationResult.inputData[0].excelSheetId,+valuationResult.inputData[0].costOfDebt,
              +valuationResult.inputData[0].copShareCapital,+valuationResult.inputData[0].capitalStructure.deRatio,
              valuationResult.inputData[0].capitalStructureType,taxRate,valuationResult.inputData[0].capitalStructure
              );
          }
  
          for await (let data of valuationResult.modelResults) {
              if (data.model !== MODEL[2] && data.model !== MODEL[4] && data.model !== MODEL[5]) {
                  transposedData.push({ model: data.model, data: await this.fcfeService.transformData(data.valuationData) });
              }
          }
          this.loadHelpers(transposedData, valuationResult, reportDetails,getCapitalStructure);
  
          if (valuationResult.modelResults.length > 0) {
              const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
              const template = hbs.compile(htmlContent);
              const html = template(valuationResult);
            
              if(reportDetails.reportPurpose === Object.keys(REPORT_PURPOSE)[0]){
                pdf = await this.generatePdf(html, pdfFilePath);
                // pdf = await this.generateTransferOfSharesReport(html, pdfFilePath);
              }
              else if(reportDetails.reportPurpose === Object.keys(REPORT_PURPOSE)[3]){
                pdf = await this.generateSebiReport(html, pdfFilePath);
              }
  
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', `attachment; filename="='${valuationResult.inputData[0].company}-${reportDetails.id}'.pdf"`);
              res.send(pdf);
  
              return {
                  msg: "PDF download Success",
                  status: true,
              };
          } else {
              console.log("Data not found");
              return {
                  msg: "No data found for PDF generation",
                  status: false
              };
          }
      } catch (error) {
        console.error("Error generating PDF:", error);
        return {
            msg: "Error generating PDF",
            status: false,
            error: error.message
        };
      }
  }

 async previewReport(id,res,approach){
  try {
    const transposedData = [];
    let  getCapitalStructure;
    const reportDetails = await this.reportModel.findById(id);

    let htmlFilePath, pdfFilePath,docFilePath,pdf;
    const valuationResult:any = await this.valuationService.getValuationById(reportDetails.reportId);

    if(reportDetails.reportPurpose === Object.keys(REPORT_PURPOSE)[0]){
      htmlFilePath = path.join(process.cwd(), 'html-template', `${approach === METHODS_AND_APPROACHES[0] ? 'basic-report' : approach === METHODS_AND_APPROACHES[1] ? 'nav-report' :  (approach === METHODS_AND_APPROACHES[3] || approach === METHODS_AND_APPROACHES[4]) ? 'comparable-companies-report' : approach === METHODS_AND_APPROACHES[2]? 'multi-model-report':''}.html`);
    }
    else if(reportDetails.reportPurpose === Object.keys(REPORT_PURPOSE)[3]){
      htmlFilePath = path.join(process.cwd(), 'html-template', `sebi-report.html`);
    }

    pdfFilePath = path.join(process.cwd(), 'pdf', `${valuationResult.inputData[0].company}-${reportDetails.id}.pdf`);
    docFilePath = path.join(process.cwd(), 'pdf', `${valuationResult.inputData[0].company}-${reportDetails.id}.docx`);

    if(reportDetails.fileName){
      const convertDocxToSfdt = await this.convertDocxToSyncfusionDocumentFormat(docFilePath,true)

      res.send(convertDocxToSfdt);

      return {
        msg: "Preview Success",
        status: true,
      };
    }


    if(valuationResult.inputData[0].model.includes(MODEL[1])){
      const taxRate = valuationResult.inputData[0].taxRate.includes('%') ? parseFloat(valuationResult.inputData[0].taxRate.replace("%", "")) : valuationResult.inputData[0].taxRate;
       getCapitalStructure = await this.calculationService.getWaccExcptTargetCapStrc(
        +valuationResult.inputData[0].adjustedCostOfEquity,
        valuationResult.inputData[0].excelSheetId,+valuationResult.inputData[0].costOfDebt,
        +valuationResult.inputData[0].copShareCapital,+valuationResult.inputData[0].capitalStructure.deRatio,
        valuationResult.inputData[0].capitalStructureType,taxRate,valuationResult.inputData[0].capitalStructure
        );
    }

    for await (let data of valuationResult.modelResults) {
        if (data.model !== MODEL[2] && data.model !== MODEL[4] && data.model !== MODEL[5]) {
            transposedData.push({ model: data.model, data: await this.fcfeService.transformData(data.valuationData) });
        }
    }
    this.loadHelpers(transposedData, valuationResult, reportDetails,getCapitalStructure);

    if (valuationResult.modelResults.length > 0) {
        const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
        const template = hbs.compile(htmlContent);
        const html = template(valuationResult);

        if(reportDetails.reportPurpose === Object.keys(REPORT_PURPOSE)[0]){
          pdf = await this.generatePdf(html, pdfFilePath);
        }
        else if(reportDetails.reportPurpose === Object.keys(REPORT_PURPOSE)[3]){
          pdf = await this.generateSebiReport(html, pdfFilePath);
        }

        await this.convertPdfToDocx(pdfFilePath,docFilePath)
        
        const convertDocxToSfdt = await this.convertDocxToSyncfusionDocumentFormat(docFilePath)

        res.send(convertDocxToSfdt);

        return {
            msg: "Preview Success",
            status: true,
        };
    } else {
        console.log("Data not found");
        return {
            msg: "No data found for report preview",
            status: false
        };
    }
} catch (error) {
  console.error("Error previewing Report:", error);
  return {
      msg: "Error Previewing Report",
      status: false,
      error: error.message
  };
}
 }

 async convertDocxToSyncfusionDocumentFormat(docxpath,fileExist?){
  try{
    if(fileExist){
      const { dir: directory, base: filename } = path.parse(docxpath);
      await this.fetchReportFromS3(filename);
    }
    const htmlContent = fs.readFileSync(docxpath);
    const formData = new FormData();
    formData.append('file', htmlContent, {
      filename: docxpath,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  
    const response = await axiosInstance.post(SYNC_FUSION_DOC_CONVERT, formData);
    return response.data;
   }
   catch(error){
    console.log(error)
  return {
    msg:'something went wrong',
    status:false,
    error:error.message
  }
   }
 }

 async convertPdfToDocx(filePath,savePath){
  try{
    const convertapi = new ConvertAPI(process.env.CONVERTAPISECRET);
    const conversion = await  convertapi.convert('docx', { File: `${filePath}`},'pdf');
    return conversion.file.save(savePath);
  }
  catch(error){
    return{
      msg:'conversion from pdf to docx failed',
      status:false,
      error:error.message
    }
  }
 }

 async updateReportDocxBuffer(reportId:any,file){
  try{
    const report = await this.reportModel.findOneAndUpdate(
      { _id: reportId },
      { $set: { fileName: file.filename } },
      { new: true }
    );

    if(report.id)
      await this.pushUpdatedReportIntoS3(file);
    
    return {
      reportId:report.id,
      msg:'Successfully updated doc',
      status:true
    };
  }
  catch(error){
    return {
      error:error.message,
      msg:'Doc update failed',
      status:false
    }
  }
 }

 async convertDocxToPdf(docxFileName,pdfFilePath){
  try{
    const { dir: directory, base: filename } = path.parse(docxFileName);
    await this.fetchReportFromS3(filename);
    const convertapi = new ConvertAPI(process.env.CONVERTAPISECRET);
    const conversion = await  convertapi.convert('pdf', { File: `${docxFileName}`},'docx');
    await conversion.file.save(pdfFilePath);
    return (await fs.readFileSync(pdfFilePath));
  }
  catch(error){
    return{
      msg:'conversion from docx to pdf failed',
      status:false,
      error:error.message
    }
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
            format: 'A4' as puppeteer.PaperFormat,
            displayHeaderFooter: true,
            printBackground: true,
            footerTemplate:`<div style="width:100%;margin-top:5%">
            <hr style="border:1px solid #bbccbb">
            <h1 style="padding-left: 5%;text-indent: 0pt;text-align: center;font-size:11px;color:#5F978E;"><span style="font-weight:400 !important;">Page <span class="pageNumber"></span></span></span> <span style="float: right;padding-right: 3%;font-size:12px"> Private &amp; confidential </span></h1>
            </div>` ,
            margin: {
              right: "20px",
          },          
          });
          return pdf;
        } catch (error) {
          console.error('Error generating PDF:', error);
        } finally {
          await browser.close();
        }
      }
      
    async generateSebiReport(htmlContent: any, pdfFilePath: string) {
        const browser = await puppeteer.launch({
          headless:"new"
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
                <td style=" border-bottom: 1px solid #bbccbb !important;font-size: 13px; height: 5px;width:100% !important;text-align:right;font-size:12px;font-family:Georgia, 'Times New Roman', Times, serif;"><i>Valuation of equity shares of ABC Limited</i></td>
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
    async generateTransferOfSharesReport(htmlContent: any, pdfFilePath: string) {
        const browser = await puppeteer.launch({
          headless:"new"
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
              top: "30px",
              right: "0px",
              bottom: "50px",
              left: "0px"
          },
          headerTemplate:`<table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
          <td style="width:100%;">
            <table border="0" cellspacing="0" cellpadding="0" style="height: 20px;width:100% !important;padding-left:3%;padding-right:3%">
              <tr>
                <td style=" border-bottom: 1px solid #bbccbb !important;font-size: 13px; height: 5px;width:100% !important;text-align:right;font-size:12px;font-family:Georgia, 'Times New Roman', Times, serif;"><i>Valuation of equity shares of ABC Limited</i></td>
              </tr>
              <tr>
                <td style="font-size: 11px">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr></table>`,
            footerTemplate: `<div style="width:100%;padding-left:3%;padding-right:3%">
            <hr style="border:1px solid #bbccbb">
            <h1 style="text-indent: 0pt;text-align: center;font-size:11px;color:#5F978E;"><span style="float: left;padding-right: 3%;font-size:12px;font-family:Georgia, 'Times New Roman', Times, serif;"> <i>Privileged &amp; confidential</i> </span><span style="font-weight:400 !important;float:right;font-size:12px;font-family:Georgia, 'Times New Roman', Times, serif;">Page <span class="pageNumber"></span></span></span></span></h1>
            </div>`,
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
          registeredValuerEmailId: 'chaturvedinitish@gmail.com',
          registeredValuerIbbiId: 'IBBI/RV/03/2020/12916',
          registeredValuerMobileNumber: '9997354674',
          registeredValuerGeneralAddress: '94, Bheesm Kunj, Gaja Paisa, Mathura 281001',
          registeredValuerCorporateAddress: 'Unit No. 8, 2nd Floor,Senior Estate, 7/C,Parsi Panchayat Road,Sterling Enterprises,Andheri (E), Mumbai - 400069',
          registeredvaluerDOIorConflict: 'No',
          registeredValuerQualifications: 'MBA & Registered Valuer - Securities or Financial Assets'
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
        reportDate:data?.reportDate,
        natureOfInstrument:data?.natureOfInstrument,
        reportPurpose:data?.reportPurpose,
        reportSection:data?.reportSection,
        dateOfIncorporation:data?.dateOfIncorporation,
        cinNumber:data?.cinNumber,
        companyAddress:data?.companyAddress,
        modelWeightageValue:data.finalWeightedAverage
      }
      try {
        const filter = { reportId: data?.reportId };
        const update = { $set: payload };
        
        const options = {
          upsert: true,
          new: true,
          runValidators: true
        };
      
        const upsertReportDetails = await this.reportModel.findOneAndUpdate(filter, update, options);
        return upsertReportDetails._id;
      } catch (e) {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      }
    }

   loadHelpers(transposedData,valuationResult,reportDetails,getCapitalStructure){
     try{
      hbs.registerHelper('companyName',()=>{
        if(valuationResult.inputData[0].company)
          return valuationResult.inputData[0].company;
        return '';
      })

      hbs.registerHelper('reportDate',()=>{
        if(reportDetails.registeredValuerDetails[0]) 
            return  this.formatDate(new Date(reportDetails.reportDate));
        return '';
      })

      hbs.registerHelper('strdate',()=>{
        if(valuationResult.inputData[0].valuationDate)
          return this.formatDate(new Date(valuationResult.inputData[0].valuationDate));
        return '';
      })

      hbs.registerHelper('registeredValuerName',()=>{
        if(reportDetails.registeredValuerDetails[0]) 
            return  reportDetails.registeredValuerDetails[0].registeredValuerName
        return '';
      })

      hbs.registerHelper('registeredValuerAddress',()=>{
        if(reportDetails.registeredValuerDetails[0]) 
            return reportDetails.registeredValuerDetails[0].registeredValuerGeneralAddress
        return '';
      })
      hbs.registerHelper('registeredValuerCorporateAddress',()=>{
        if(reportDetails.registeredValuerDetails[0]) 
            return  reportDetails.registeredValuerDetails[0].registeredValuerCorporateAddress ? reportDetails.registeredValuerDetails[0].registeredValuerCorporateAddress : reportDetails.registeredValuerDetails[0].registeredValuerGeneralAddress;
        return '';
      })

      hbs.registerHelper('registeredValuerEmailId',()=>{
        if(reportDetails.registeredValuerDetails[0]) 
            return  reportDetails.registeredValuerDetails[0].registeredValuerEmailId; 
        return '';
      })

      hbs.registerHelper('registeredValuerMobileNumber',()=>{
        if(reportDetails.registeredValuerDetails[0]) 
            return  reportDetails.registeredValuerDetails[0].registeredValuerMobileNumber; 
        return '';
      })
      hbs.registerHelper('registeredValuerIbbiId',()=>{
        if(reportDetails.registeredValuerDetails[0]) 
            return  reportDetails.registeredValuerDetails[0].registeredValuerIbbiId; 
        return '';
      })
      hbs.registerHelper('registeredValuerQualifications',()=>{
        if(reportDetails.registeredValuerDetails[0]) 
            return  reportDetails.registeredValuerDetails[0].registeredValuerQualifications; 
        return '';
      })
      hbs.registerHelper('appointingAuthorityName',()=>{
        if(reportDetails.appointeeDetails[0]) 
            return  reportDetails.appointeeDetails[0].appointingAuthorityName; 
        return '';
      })
      hbs.registerHelper('dateOfAppointment',()=>{
        if(reportDetails)
            return this.formatDate(new Date(reportDetails.appointeeDetails[0].dateOfAppointment));
        return '';
      })
      hbs.registerHelper('dateOfIncorporation',()=>{
        if(reportDetails.appointeeDetails[0])
            return this.formatDate(new Date(reportDetails.dateOfIncorporation));
        return '';
      })
      hbs.registerHelper('cinNumber',()=>{
        if(reportDetails)
            return reportDetails.cinNumber
        return '';
      })
      hbs.registerHelper('companyAddress',()=>{
        if(reportDetails)
            return reportDetails.companyAddress;
        return '';
      })
      hbs.registerHelper('clientName',()=>{
        if(reportDetails.registeredValuerDetails[0]) 
            return  reportDetails.clientName; 
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
            return valuationResult.inputData[0]?.expMarketReturn.toFixed(2);
        return '';
      })
      hbs.registerHelper('beta',()=>{
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0]?.beta?.toFixed(2);
        return '';
      })
      hbs.registerHelper('companyRiskPremium',()=>{
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0]?.riskPremium;
        return '';
      })
      hbs.registerHelper('costOfEquity',()=>{
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0].costOfEquity?.toFixed(2);
        return '';
      })
      hbs.registerHelper('adjustedCostOfEquity',()=>{
        if(valuationResult.inputData[0]) 
            return valuationResult.inputData[0]?.adjustedCostOfEquity?.toFixed(2);
        return '';
      })
      hbs.registerHelper('wacc',()=>{
        if(valuationResult.inputData[0] && valuationResult.inputData[0].model.includes(MODEL[1])) 
            return valuationResult.inputData[0]?.wacc?.toFixed(2);
        return '0';
      })
      hbs.registerHelper('costOfDebt',()=>{
        if(valuationResult.inputData[0] && valuationResult.inputData[0].model.includes(MODEL[1])) 
            return parseFloat(valuationResult.inputData[0]?.costOfDebt)?.toFixed(2);
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
            if(response.model===MODEL[0] || response.model === MODEL[1]){
              const formattedNumber = Math.floor(response?.valuationData[0]?.valuePerShare).toLocaleString('en-IN');
              return `${formattedNumber.replace(/,/g, ',')}/-`;
            }
          });
          return '';
      })
      hbs.registerHelper('modelValuePerShare',(modelName)=>{
        modelName = modelName.split(',');
        if(modelName.length <= 2 ){
          let formattedValues;
            formattedValues = modelName.flatMap((models) => {
              return valuationResult.modelResults.flatMap((response) => {
                if (
                  response.model === models &&
                  (models === MODEL[2] || models === MODEL[4])
                ) {
                  const innerFormatted = response?.valuationData.valuation
                    .filter((innerValuationData) => innerValuationData.particular === 'result')
                    .map((innerValuationData) => {
                      const formattedNumber = Math.floor(innerValuationData.fairValuePerShareAvg).toLocaleString('en-IN');
                      return `${formattedNumber.replace(/,/g, ',')}/-`;
                    });
                  return innerFormatted || [];
                }
                if (response.model === models && models !== 'NAV') {
                  const formattedNumber = Math.floor(response?.valuationData[0]?.valuePerShare).toLocaleString('en-IN');
                  return `${formattedNumber.replace(/,/g, ',')}/-`;
                }
                if (response.model === models && models === 'NAV') {
                  const formattedNumber = Math.floor(response?.valuationData?.valuePerShare?.bookValue).toLocaleString('en-IN');
                  return `${formattedNumber.replace(/,/g, ',')}/-`;
                }
                return [];
              });
            });
            // console.log(formattedValues, "value per share");
            return formattedValues[0];
          }
          else{
            if(reportDetails?.modelWeightageValue){
              const equityValue = reportDetails.modelWeightageValue.weightedVal;
              const outstandingShares = valuationResult.inputData[0].outstandingShares;
              const finalValue =  Math.floor(equityValue*GET_MULTIPLIER_UNITS[`${valuationResult?.inputData[0]?.reportingUnit}`]/outstandingShares).toLocaleString('en-IN'); // use muliplier
              return `${finalValue.replace(/,/g, ',')}/-`
            }
          }
       
        return '';
      })
      hbs.registerHelper('modelValuePerShareNumbersToWords',(modelName)=>{
        modelName = modelName.split(',');
        if(modelName.length <= 2 ){
          let formattedValues;
            formattedValues = modelName.flatMap((models) => {
              return valuationResult.modelResults.flatMap((response) => {
                if (
                  response.model === models &&
                  (models === MODEL[2] || models === MODEL[4])
                ) {
                  const innerFormatted = response?.valuationData.valuation
                    .filter((innerValuationData) => innerValuationData.particular === 'result')
                    .map((innerValuationData) => {
                      const formattedNumber = Math.floor(innerValuationData.fairValuePerShareAvg).toLocaleString('en-IN');
                      return `Rupees${converter.toWords(formattedNumber)} Only`;
                    });
                  return innerFormatted || [];
                }
                if (response.model === models && models !== 'NAV') {
                  const formattedNumber = Math.floor(response?.valuationData[0]?.valuePerShare).toLocaleString('en-IN');
                  return `Rupees ${converter.toWords(formattedNumber)} Only`;
                }
                if (response.model === models && models === 'NAV') {
                  const formattedNumber = Math.floor(response?.valuationData?.valuePerShare?.bookValue).toLocaleString('en-IN');
                  return `Rupees ${converter.toWords(formattedNumber)} Only`;
                }
                return [];
              });
            });
            console.log(formattedValues, "converted value");
            return formattedValues[0];
          }
          else{
            if(reportDetails?.modelWeightageValue){
              const equityValue = reportDetails.modelWeightageValue.weightedVal;
              const outstandingShares = valuationResult.inputData[0].outstandingShares;
              const finalValue =  Math.floor(equityValue*GET_MULTIPLIER_UNITS[`${valuationResult?.inputData[0]?.reportingUnit}`]/outstandingShares).toLocaleString('en-IN'); // use muliplier
              return `${finalValue.replace(/,/g, ',')}/-`
            }
          }
       
        return '';
      })
      hbs.registerHelper('equityPerShare',()=>{
        let equityPerShare = [];
        if(reportDetails?.modelWeightageValue){
          const number = Math.floor(reportDetails.modelWeightageValue.weightedVal).toLocaleString('en-IN');
          return `${number.replace(/,/g, ',')}/-`
        }
        if(transposedData[0]?.data.transposedResult[1])
          valuationResult.modelResults.map((response)=>{
          if(response.model===MODEL[0] || response.model === MODEL[1]){
            const number = Math.floor(response?.valuationData[0]?.equityValue).toLocaleString('en-IN') || 0;
            if(number){
              equityPerShare.push( `${number.replace(/,/g, ',')}/-`);
            }
          }
        });
        return equityPerShare;
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
        let freeCashFlow = []
        if(transposedData[0].data.transposedResult[1])
           valuationResult.modelResults.map((response)=>{
            if(response.model===MODEL[0] || response.model === MODEL[1]){
              freeCashFlow.push(response?.valuationData[response.valuationData.length -2].presentFCFF.toFixed(2)); // subtract (- 2) to get last year fcfe/fcff data 
            }
          });
          return freeCashFlow;
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
        if(valuationResult.inputData[0].currencyUnit)
          return valuationResult.inputData[0].currencyUnit;
        return 'INR';
      })
      hbs.registerHelper('reportingUnit',()=>{
        if(valuationResult.inputData[0].reportingUnit)
          return valuationResult.inputData[0].reportingUnit;
        return 'Lakhs';
      })
      hbs.registerHelper('alpha',()=>{
        let outputObject = {};
        let letterIndex = 97; // this is the ascii code start
        for (const key in valuationResult.inputData[0].alpha) {
          if (valuationResult.inputData[0].alpha[key] !== '' && valuationResult.inputData[0].alpha[key] !== '0') {
            let element;
            let letter = String.fromCharCode(letterIndex);
            if (letterIndex > 97) {
              element = `<br/><span style="text-align: center;text-transform:capitalize">${letter}. ${ALPHA[`${key}`]}</span>`;
            } else {
              element = `<span style="text-align: center;text-transform:capitalize">${letter}. ${ALPHA[`${key}`]}</span>`;
            }
            outputObject[element] = valuationResult.inputData[0].alpha[key];
            letterIndex++;
          }
        }
        return `<p style="text-align:center">${Object.keys(outputObject)}</p>`;
      })

      hbs.registerHelper('betaName',()=>{
        if(valuationResult.inputData[0].betaType)
          return valuationResult.inputData[0].betaType;
        return '';
      })
      hbs.registerHelper('postCostOfDebt',()=>{
        let costOfDebt,taxRate;
        if(valuationResult.inputData[0].model.includes(MODEL[1])){
          costOfDebt =  parseFloat(valuationResult.inputData[0]?.costOfDebt)?.toFixed(2);
          taxRate = valuationResult.inputData[0]?.taxRate.split('%')[0];
          return (((costOfDebt/100)*(1-parseFloat(taxRate)/100))*100).toFixed(2);
        } 
        return '0';
      })


      // projection result table
      hbs.registerHelper('projectionResultTableHeader',()=>{
        let headers=[];
        valuationResult.modelResults.map((response)=>{
          if(response.model === MODEL[0] || response.model === MODEL[1]){
            
            // map all the column headers for pdf
             headers = response?.valuationData.map((columnHeader)=>{
              if(columnHeader?.particulars){
                return {columnHeader:columnHeader.particulars}
              }
            })
            headers.unshift({columnHeader:'Particulars'})
          }
        })
        return headers;
      })

      hbs.registerHelper('capitalStructureRatio', ()=>{
        const debtRate = getCapitalStructure.result.capitalStructure.debtProp.toFixed(2)
        const equityProp = getCapitalStructure.result.capitalStructure.equityProp.toFixed(2)
        if(debtRate && equityProp){
          return `${debtRate}:${equityProp}`;
        }
        return '';
      })

      hbs.registerHelper('capitalStructureType', ()=>{
        const capitalStructureType = getCapitalStructure.result.capitalStructure.capitalStructureType;
        if(capitalStructureType){
          return CAPITAL_STRUCTURE_TYPE[`${capitalStructureType}`];
        }
        return '';
      })

      hbs.registerHelper('explicitYear',()=>{
        let explicitYear='';
        let index;
        if(valuationResult?.modelResults){
          valuationResult.modelResults.map((result)=>{

            if( result?.model === MODEL[0] ||  result?.model === MODEL[1]){
              result?.valuationData.map((response,i)=>{
                if(response.particulars === 'Terminal Value'){
                  index = i
                }
              })
              explicitYear = result.valuationData[index-1]['particulars'];
            }
          })
          explicitYear = `20${explicitYear.split('-')[1]}`
        }
        return explicitYear
      })

      hbs.registerHelper('PAT', () => {
        let arrayPAT = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{              
              const patValue = this.formatPositiveAndNegativeValues(response?.pat);
              arrayPAT.push({fcfePat:patValue})
            })
            arrayPAT.unshift({fcfePat:"PAT"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const patValue = this.formatPositiveAndNegativeValues(response?.pat);
              arrayPAT.push({fcffPat:patValue})
            })
            arrayPAT.unshift({fcffPat:"PAT"});
          }
          else if(result.model === 'Excess_Earnings'){
            result.valuationData.map((response:any)=>{
              const patValue = this.formatPositiveAndNegativeValues(response?.pat);
              arrayPAT.push({excessEarningPat:patValue})
            })
            arrayPAT.unshift({excessEarningPat:"PAT"});
          }
        })
        return arrayPAT;
      });

      hbs.registerHelper('FCFF', () => {
        let arrayfcff = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const fcffValue = this.formatPositiveAndNegativeValues(response.fcff);
              arrayfcff.push({fcff:fcffValue})
            })
            arrayfcff.unshift({fcff:"FCFF"});
          }
        })
        return arrayfcff;
      });

      hbs.registerHelper('depAndAmortisation', () => {
        let arraydepAndAmortisation = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              const depAndAmortisationValue = response?.depAndAmortisation;
              let depAndAmortisation = depAndAmortisationValue ? (Math.abs(depAndAmortisationValue) < 0.005 ? '0.00' : `${Math.abs(depAndAmortisationValue).toFixed(2)}`) : '';
              depAndAmortisation = depAndAmortisationValue && `${depAndAmortisation}`.includes('-') ? `(${depAndAmortisation})` : depAndAmortisation;
              arraydepAndAmortisation.push({fcfeDepAmortisation:depAndAmortisation})
            })
            arraydepAndAmortisation.unshift({fcfeDepAmortisation:"Depn. and Amortn."});
          }
          else if (result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
             const depAndAmortisation = this.formatPositiveAndNegativeValues(response.depAndAmortisation)
              arraydepAndAmortisation.push({fcffDepAmortisation:depAndAmortisation})
            })
            arraydepAndAmortisation.unshift({fcffDepAmortisation:"Depn. and Amortn."});
            
          }
        })
        return arraydepAndAmortisation;
      });

      hbs.registerHelper('InterestAdjTaxes', () => {
        let arrayaddInterestAdjTaxes = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              const addInterestAdjTaxesValue = this.formatPositiveAndNegativeValues(response?.addInterestAdjTaxes);
              arrayaddInterestAdjTaxes.push({fcfeAddInterestAdjTaxes:addInterestAdjTaxesValue})
            })
            arrayaddInterestAdjTaxes.unshift({fcfeAddInterestAdjTaxes:"Add: Interest Adjusted Taxes"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const addInterestAdjTaxesValue = this.formatPositiveAndNegativeValues(response?.addInterestAdjTaxes);
              arrayaddInterestAdjTaxes.push({fcffAddInterestAdjTaxes:addInterestAdjTaxesValue})
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
             const nonCashItem = this.formatPositiveAndNegativeValues(response?.onCashItems)
              arrayonCashItems.push({fcfeOnCashItems:nonCashItem})
            })
            arrayonCashItems.unshift({fcfeOnCashItems:"Other Non Cash items"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const nonCashItem = this.formatPositiveAndNegativeValues(response?.onCashItems)

              arrayonCashItems.push({fcffOnCashItems:nonCashItem})
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
              const ncaValue = this.formatPositiveAndNegativeValues(response?.nca);
              arrayNca.push({fcfeNca:ncaValue})
            })
            arrayNca.unshift({fcfeNca:"Change in NCA"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const ncaValue = this.formatPositiveAndNegativeValues(response?.nca);
              arrayNca.push({fcffNca:ncaValue})
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
              const deferredTaxValue = this.formatPositiveAndNegativeValues(response?.defferedTaxAssets);
              arraydefferedTaxAssets.push({fcfeDefferedTaxAssets:deferredTaxValue})
            })
            arraydefferedTaxAssets.unshift({fcfeDefferedTaxAssets:"Add/Less: Deferred Tax Assets(Net)"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const deferredTaxValue = this.formatPositiveAndNegativeValues(response?.defferedTaxAssets);
              arraydefferedTaxAssets.push({fcffDefferedTaxAssets:deferredTaxValue})
            })
            arraydefferedTaxAssets.unshift({fcffDefferedTaxAssets:"Add/Less: Deferred Tax Assets(Net)"});
          }
        })
        return arraydefferedTaxAssets;
      });

      hbs.registerHelper('changeInBorrowing', () => {
        let arrayChangeInBorrowings = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              const changeInBorrowingValue = this.formatPositiveAndNegativeValues(response?.changeInBorrowings);
              arrayChangeInBorrowings.push({changeInBorrowings:changeInBorrowingValue})
            })
            arrayChangeInBorrowings.unshift({changeInBorrowings:"Change in Borrowings"});
          }
        })
        return arrayChangeInBorrowings;
      });

      hbs.registerHelper('netCshFlow', () => {
        let arrayNetCashFlow = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              const netCashFlowValue = this.formatPositiveAndNegativeValues(response?.netCashFlow);
              arrayNetCashFlow.push({fcfeNetCashFlow:netCashFlowValue})
            })
            arrayNetCashFlow.unshift({fcfeNetCashFlow:"Net Cash Flow"});
          }
          if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const netCashFlowValue = this.formatPositiveAndNegativeValues(response?.netCashFlow);
              arrayNetCashFlow.push({fcffNetCashFlow:netCashFlowValue})
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
              const fixedAssetsValue = this.formatPositiveAndNegativeValues(response?.fixedAssets);
              arrayFixedAssets.push({fcfeFixedAssets:fixedAssetsValue})
            })
            arrayFixedAssets.unshift({fcfeFixedAssets:"Change in fixed assets"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const fixedAssetsValue = this.formatPositiveAndNegativeValues(response?.fixedAssets);
              arrayFixedAssets.push({fcffFixedAssets:fixedAssetsValue})
            })
            arrayFixedAssets.unshift({fcffFixedAssets:"Change in fixed assets"});
          }
        })
        return arrayFixedAssets;
      });
      
      hbs.registerHelper('FCFE', () => {
        let arrayfcff = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              const fcffValue = this.formatPositiveAndNegativeValues(response?.fcff);
              arrayfcff.push({fcff:fcffValue})
            })
            arrayfcff.unshift({fcff:"FCFE"});
          }
        })
        return arrayfcff;
      });
      
      hbs.registerHelper('discPeriod', () => {
        let arrayDiscountingPeriod = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              const discountingPeriodValue = this.formatPositiveAndNegativeValues(response?.discountingPeriod);
              arrayDiscountingPeriod.push({fcfeDiscountingPeriod:discountingPeriodValue})
            })
            arrayDiscountingPeriod.unshift({fcfeDiscountingPeriod:"Discounting Period"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const discountingPeriodValue = this.formatPositiveAndNegativeValues(response?.discountingPeriod);
              arrayDiscountingPeriod.push({fcffDiscountingPeriod:discountingPeriodValue})
            })
            arrayDiscountingPeriod.unshift({fcffDiscountingPeriod:"Discounting Period"});
          }
          else if(result.model === 'Excess_Earnings'){
            result.valuationData.map((response:any)=>{
              const discountingPeriodValue = this.formatPositiveAndNegativeValues(response?.discountingPeriod);
              arrayDiscountingPeriod.push({excessEarningDiscountingPeriod:discountingPeriodValue})
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
              const discountingFactorValue = this.formatPositiveAndNegativeValues(response?.discountingFactor);
              arrayDiscountingFactor.push({fcfeDiscountingFactor:discountingFactorValue})
            })
            arrayDiscountingFactor.unshift({fcfeDiscountingFactor:"Discounting Factor"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const discountingFactorValue = this.formatPositiveAndNegativeValues(response?.discountingFactor);
              arrayDiscountingFactor.push({fcffDiscountingFactor:discountingFactorValue})
            })
            arrayDiscountingFactor.unshift({fcffDiscountingFactor:"Discounting Factor"});
          }
          else if(result.model === 'Excess_Earnings'){
            result.valuationData.map((response:any)=>{
              const discountingFactorValue = this.formatPositiveAndNegativeValues(response?.discountingFactor);
              arrayDiscountingFactor.push({excessEarningDiscountingFactor:discountingFactorValue})
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
              const presentFCFFValue = this.formatPositiveAndNegativeValues(response?.presentFCFF);
              arrayPresentFCFF.push({fcfePresentFCFF:presentFCFFValue})
            })
            arrayPresentFCFF.unshift({fcfePresentFCFF:result?.model === 'FCFF' ? "Present Value of FCFF" : "Present Value of FCFE"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const presentFCFFValue = this.formatPositiveAndNegativeValues(response?.presentFCFF);
              arrayPresentFCFF.push({fcffPresentFCFF:presentFCFFValue})
            })
            arrayPresentFCFF.unshift({fcffPresentFCFF:result?.model === 'FCFF' ? "Present Value of FCFF" : "Present Value of FCFE"});
          }
        })
        return arrayPresentFCFF;
      });
      
      hbs.registerHelper('debtDate', () => {
        let arrayDebtOnDate = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              const debtOnDateValue = this.formatPositiveAndNegativeValues(response?.debtOnDate);
              arrayDebtOnDate.push({fcfeDebtOnDate:debtOnDateValue})
            })
            arrayDebtOnDate.unshift({fcfeDebtOnDate:"Less: Debt as on Date"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const debtOnDateValue = this.formatPositiveAndNegativeValues(response?.debtOnDate);
              arrayDebtOnDate.push({fcffDebtOnDate:debtOnDateValue})
            })
            arrayDebtOnDate.unshift({fcffDebtOnDate:"Less: Debt as on Date"});
          }
        })
        return arrayDebtOnDate;
      });
      
      hbs.registerHelper('sumCashFlow', () => {
        let arraySumOfCashFlows = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              const sumOfCashFlowsValue = this.formatPositiveAndNegativeValues(response?.sumOfCashFlows);
              arraySumOfCashFlows.push({fcfeSumOfCashFlows:sumOfCashFlowsValue})
            })
            arraySumOfCashFlows.unshift({fcfeSumOfCashFlows:"Sum of Cash Flows"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const sumOfCashFlowsValue = this.formatPositiveAndNegativeValues(response?.sumOfCashFlows);
              arraySumOfCashFlows.push({fcffSumOfCashFlows:sumOfCashFlowsValue})
            })
            arraySumOfCashFlows.unshift({fcffSumOfCashFlows:"Sum of Cash Flows"});
          }
          else if(result.model === 'Excess_Earnings'){
            result.valuationData.map((response:any)=>{
              const sumOfCashFlowsValue = this.formatPositiveAndNegativeValues(response?.sumOfCashFlows);
              arraySumOfCashFlows.push({excessEarningSumOfCashFlows:sumOfCashFlowsValue})
            })
            arraySumOfCashFlows.unshift({excessEarningSumOfCashFlows:"Sum of Cash Flows"});
          }
        })
        return arraySumOfCashFlows;
      });
      
      hbs.registerHelper('cashEquvlnt', () => {
        let arrayCashEquivalents = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              const cashEquivalentsValue = this.formatPositiveAndNegativeValues(response?.cashEquivalents);
              arrayCashEquivalents.push({fcfeCashEquivalents:cashEquivalentsValue})
            })
            arrayCashEquivalents.unshift({fcfeCashEquivalents:"Add: Cash & Cash Equivalents"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const cashEquivalentsValue = this.formatPositiveAndNegativeValues(response?.cashEquivalents);
              arrayCashEquivalents.push({fcffCashEquivalents:cashEquivalentsValue})
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
              const surplusAssetsValue = this.formatPositiveAndNegativeValues(response?.surplusAssets);
              arraySurplusAssets.push({fcfeSurplusAssets:surplusAssetsValue})
            })
            arraySurplusAssets.unshift({fcfeSurplusAssets:"Add: Surplus Assets/Investments"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const surplusAssetsValue = this.formatPositiveAndNegativeValues(response?.surplusAssets);
              arraySurplusAssets.push({fcffSurplusAssets:surplusAssetsValue})
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
              const otherAdjValue = this.formatPositiveAndNegativeValues(response?.otherAdj);
              arrayOtherAdj.push({fcfeOtherAdj:otherAdjValue})
            })
            arrayOtherAdj.unshift({fcfeOtherAdj:"Add/Less: Other Adjustments(if any)"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const otherAdjValue = this.formatPositiveAndNegativeValues(response?.otherAdj);
              arrayOtherAdj.push({fcffOtherAdj:otherAdjValue})
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
          if(Array.isArray(result.valuationData) && result.valuationData?.some(obj => obj.hasOwnProperty('stubAdjValue'))){
            checkiIfStub=true;
          }
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              const equityValue = this.formatPositiveAndNegativeValues(response?.equityValue);
              arrayEquityValue.push({fcfeEquityValue:equityValue})
            })
            if(checkiIfStub){
              // arrayEquityValue.unshift({fcfeEquityValue:`Equity Value as on ${result.valuationData[0].particulars}`});
              arrayEquityValue.unshift({fcfeEquityValue:`Equity Value as on ${this.formatDate(new Date(valuationResult.provisionalDate))}`});
            }
            else{
              arrayEquityValue.unshift({fcfeEquityValue:`Equity Value as on ${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
            }
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const equityValue = this.formatPositiveAndNegativeValues(response?.equityValue);
              arrayEquityValue.push({fcffEquityValue:equityValue})
            })
            if(checkiIfStub){
              // arrayEquityValue.unshift({fcffEquityValue:`Equity Value as on ${result.valuationData[0].particulars}`});
              arrayEquityValue.unshift({fcffEquityValue:`Equity Value as on ${this.formatDate(new Date(valuationResult.provisionalDate))}`});
            }
            else{
              arrayEquityValue.unshift({fcffEquityValue:`Equity Value as on ${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
            }
          }
          else if(result.model === 'Excess_Earnings'){
            result.valuationData.map((response:any)=>{
              const equityValue = this.formatPositiveAndNegativeValues(response?.equityValue);
              arrayEquityValue.push({excessEarningEquityValue:equityValue})
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

      hbs.registerHelper('checkIfFcff',()=>{
        let isFcff = false;
        if(valuationResult.modelResults){
          valuationResult.modelResults.map((result)=>{

            if(result.model === MODEL[1]){
              isFcff = true;
            }
          })
        }
        return isFcff;
      })
      hbs.registerHelper('displayValuationHeader',()=>{
        let modelArray = [];
        let string;
      if(valuationResult.modelResults){
          valuationResult.modelResults.map((result)=>{
            modelArray.push(result.model);
          })
        }
        if((modelArray.includes(MODEL[0]) || modelArray.includes(MODEL[1])) && modelArray.includes(MODEL[5]) && (modelArray.includes(MODEL[2]) || modelArray.includes(MODEL[4]))){  
          string = `Discounted Cash Flow Method (‘DCF’),
          the Comparable Company Multiple Method (‘CCM’) and Net Asset Value Method (‘NAV’)`;
        }
        else if((modelArray.includes(MODEL[0]) || modelArray.includes(MODEL[1])) && modelArray.includes(MODEL[5])){
          string = `Discounted Cash Flow Method (‘DCF’) and Net Asset Value Method (‘NAV’)`;
        }
        else if((modelArray.includes(MODEL[0]) || modelArray.includes(MODEL[1])) && (modelArray.includes(MODEL[2]) || modelArray.includes(MODEL[4]))){
          string = `Discounted Cash Flow Method (‘DCF’) and Comparable Company Multiple Method (‘CCM’)`;
        }
        else{
          string = `Net Asset Value Method (‘NAV’) and Comparable Company Multiple Method (‘CCM’)`;
        }
        return string;
      })

      hbs.registerHelper('stubValue',()=>{
        let arrayStubValue = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === MODEL[0]){
            result.valuationData.map((response:any)=>{
              const stubAdjValue = this.formatPositiveAndNegativeValues(response?.stubAdjValue);
              arrayStubValue.push({fcfeStubAdjValue:stubAdjValue})
            })
            arrayStubValue.unshift({fcfeStubAdjValue:"Add:Stub Period Adjustment"});
          }
          else if (result.model === MODEL[1]){
            result.valuationData.map((response:any)=>{
              const stubAdjValue = this.formatPositiveAndNegativeValues(response?.stubAdjValue);
              arrayStubValue.push({fcffStubAdjValue:stubAdjValue})
            })
            arrayStubValue.unshift({fcffStubAdjValue:"Add:Stub Period Adjustment"});
          }
          else if (result.model ===MODEL[3]){
            result.valuationData.map((response:any)=>{
              const stubAdjValue = this.formatPositiveAndNegativeValues(response?.stubAdjValue);
              arrayStubValue.push({excessEarnStubAdjValue:stubAdjValue})
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
              const equityValueNew = this.formatPositiveAndNegativeValues(response?.equityValueNew);
              arrayProvisionalVal.push({fcfeequityValueNew:equityValueNew})
            })
            arrayProvisionalVal.unshift({fcfeequityValueNew:`Equity Value as on ${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
          }
          else if (result.model === MODEL[1]){
            result.valuationData.map((response:any)=>{
              const equityValueNew = this.formatPositiveAndNegativeValues(response?.equityValueNew);
              arrayProvisionalVal.push({fcffequityValueNew:equityValueNew})
            })
            arrayProvisionalVal.unshift({fcffequityValueNew:`Equity Value as on ${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
          }
          else if (result.model ===MODEL[3]){
            result.valuationData.map((response:any)=>{
              const equityValueNew = this.formatPositiveAndNegativeValues(response?.equityValueNew);
              arrayProvisionalVal.push({excessEarnequityValueNew:equityValueNew})
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
              const noOfSharesValue = this.formatPositiveAndNegativeValues(response?.noOfShares);
              arrayNoOfShares.push({fcfeNoOfShares:noOfSharesValue})
            })
            arrayNoOfShares.unshift({fcfeNoOfShares:"No. of Shares"});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const noOfSharesValue = this.formatPositiveAndNegativeValues(response?.noOfShares);
              arrayNoOfShares.push({fcffNoOfShares:noOfSharesValue})
            })
            arrayNoOfShares.unshift({fcffNoOfShares:"No. of Shares"});
          }
          else if(result.model === 'Excess_Earnings'){
            result.valuationData.map((response:any)=>{
              const noOfSharesValue = this.formatPositiveAndNegativeValues(response?.noOfShares);
              arrayNoOfShares.push({excessEarningNoOfShares:noOfSharesValue})
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
              const valuePerShare = this.formatPositiveAndNegativeValues(response?.valuePerShare);
              arrayValuePerShare.push({fcfeValuePerShare:valuePerShare})
            })
            arrayValuePerShare.unshift({fcfeValuePerShare:`Value per Share (${valuationResult.inputData[0].currencyUnit})`});
          }
          else if(result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              const valuePerShare = this.formatPositiveAndNegativeValues(response?.noOfShares);
              arrayValuePerShare.push({fcffValuePerShare:valuePerShare})
            })
            arrayValuePerShare.unshift({fcffValuePerShare:`Value per Share (${valuationResult.inputData[0].currencyUnit})`});
          }
          else if(result.model === 'Excess_Earnings'){
            result.valuationData.map((response:any)=>{
              const valuePerShare = this.formatPositiveAndNegativeValues(response?.noOfShares);
              arrayValuePerShare.push({excessEarningValuePerShare:valuePerShare})
            })
            arrayValuePerShare.unshift({excessEarningValuePerShare:`Value per Share (${valuationResult.inputData[0].currencyUnit})`});
          }
        })
        return arrayValuePerShare;
      });

      hbs.registerHelper('natureOfInstrument',()=>{
        if(reportDetails)
          return NATURE_OF_INSTRUMENT[`${reportDetails.natureOfInstrument}`];
        return '';
      })

      hbs.registerHelper('ifEquityValProvisional',(options)=>{
        let checkiIfprovisional = false;
        valuationResult.modelResults.forEach((result)=>{
          if(Array.isArray(result.valuationData) && result.valuationData?.some(obj => obj.hasOwnProperty('equityValueNew'))){
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
                bookValue:indNav?.bookValue ? (Math.floor(parseFloat(indNav.bookValue) * 100) / 100).toLocaleString('en-IN') : indNav?.bookValue,
                fairValue:indNav?.fairValue ? (Math.floor(parseFloat(indNav.fairValue) * 100) / 100).toLocaleString('en-IN') : indNav.value ? (Math.floor(parseFloat(indNav.value) * 100) / 100).toLocaleString('en-IN'): indNav.fairValue
              }
             })
            }
          })
          // console.log(navData,"nav data")
          return navData;
        })

        hbs.registerHelper('reportSection',()=>{
          let outputObject = {};
          let letterIndex = 97; // this is the ascii code start
          for (const key in reportDetails.reportSection) {
              let element;
              if (letterIndex > 97) {
                element = ` ${reportDetails.reportSection[key]}`;
              } else {
                element = `${reportDetails.reportSection[key]}`;
              }
              outputObject[element] = key;
              letterIndex++;
          }
          return `${Object.keys(outputObject)}`;
        })

        hbs.registerHelper('reportPurpose',()=>{
          if(reportDetails?.reportPurpose)
            return `${REPORT_PURPOSE[`${reportDetails?.reportPurpose}`]}`;
          return '';
        })

        hbs.registerHelper('modelWeightageValue',()=>{
          let dcfApproachString:any = [],netAssetValueString:any = [],marketPriceString:any = [],totalWeightage:any=[];
          if(reportDetails?.modelWeightageValue){
            reportDetails?.modelWeightageValue?.modelValue.map((data)=>{
              if(data.model === MODEL[0] || data.model === MODEL[1]){
                dcfApproachString = {
                  particulars:'Value as DCF Method',
                  weights:(data.weight * 100)?.toFixed(1),
                  weightedValue: (Math.floor(data.weightedValue * 100) / 100).toLocaleString('en-IN')
                };
                totalWeightage.push(dcfApproachString);
              }
              if(data.model === MODEL[5]){
                netAssetValueString = {
                  particulars:'Value as NAV Method',
                  weights:(data.weight * 100)?.toFixed(1),
                  weightedValue: (Math.floor(data.weightedValue * 100) / 100).toLocaleString('en-IN')
                };
                totalWeightage.push(netAssetValueString);
              }
              if(data.model === MODEL[2] || data.model === MODEL[4]){
                marketPriceString = {
                  particulars:'Value as CCM Method',
                  weights:(data.weight * 100)?.toFixed(1),
                  weightedValue: (Math.floor(data.weightedValue * 100) / 100).toLocaleString('en-IN')
                };
                totalWeightage.push(marketPriceString);
              }
            })
          }
          return totalWeightage;
        })

        hbs.registerHelper('peRatioCalculation',()=>{
          let pat:any = [],eps:any=[],marketPrice:any=[],totalPeRatio:any=[];
          if(valuationResult?.modelResults){
            valuationResult.modelResults.map((data)=>{
              // console.log(data.valuationData)
              if(data.model === MODEL[2] || data.model === MODEL[4]){
              data.valuationData.valuation.map((valuationDetails)=>{
                  if(valuationDetails.particular === 'peRatio'){
                    pat = {
                      particular:'Profit after Taxes',
                      avg:(Math.floor(valuationDetails.pat * 100) / 100).toLocaleString('en-IN'),
                      med:(Math.floor(valuationDetails.pat * 100) / 100).toLocaleString('en-IN')
                    }

                    eps = {
                      particular:'P/E Ratio of Industry',
                      avg: (Math.floor(valuationDetails.peRatioAvg * 100) / 100).toLocaleString('en-IN'),
                      med: (Math.floor(valuationDetails.peRatioMed * 100) / 100).toLocaleString('en-IN')
                    }

                    marketPrice = {
                      particular:'Fair Value of Equity',
                      avg:(Math.floor(valuationDetails.peMarketPriceAvg * 100) / 100).toLocaleString('en-IN'),
                      med:(Math.floor(valuationDetails.peMarketPriceMed * 100) / 100).toLocaleString('en-IN')
                    }

                    totalPeRatio.push(pat,eps,marketPrice)

                  }
                })
              }
            })
          }
          return totalPeRatio;
        })

        hbs.registerHelper('pbRatioCalculation',()=>{
          let networth:any = [],pbShares:any=[],equityVal:any=[],totalPbRatio:any=[];
          if(valuationResult?.modelResults){
            valuationResult.modelResults.map((data)=>{
              if(data.model === MODEL[2] || data.model === MODEL[4]){
                data.valuationData.valuation.map((valuationDetails)=>{
                  if(valuationDetails.particular === 'pbRatio'){
                    networth = {
                      particular:'Net Worth of Company',
                      avg:(Math.floor(valuationDetails.netWorthAvg * 100) / 100).toLocaleString('en-IN'),
                      med:(Math.floor(valuationDetails.netWorthMed * 100) / 100).toLocaleString('en-IN')
                    }
                    pbShares = {
                      particular:'P/B Ratio of Industry',
                      avg: (Math.floor(valuationDetails.pbRatioAvg * 100) / 100).toLocaleString('en-IN'),
                      med: (Math.floor(valuationDetails.pbRatioMed * 100) / 100).toLocaleString('en-IN')
                    }

                    equityVal = {
                      particular:'Fair Value of Equity',
                      avg:(Math.floor(valuationDetails.pbMarketPriceAvg * 100) / 100).toLocaleString('en-IN'),
                      med:(Math.floor(valuationDetails.pbMarketPriceMed * 100) / 100).toLocaleString('en-IN')
                    }

                    totalPbRatio.push(networth,pbShares,equityVal);
                  }
                })
              }
            })
          }
          return totalPbRatio;
        })
        
        hbs.registerHelper('evEbitaRatioCalculation',()=>{
          let ebitda:any=[],evEbitda:any=[],enterpriseVal:any=[],debtVal:any=[],equityVal:any=[],totalEvEbitdaRatio:any=[];
          if(valuationResult?.modelResults){
            valuationResult.modelResults.map((data)=>{
              if(data.model === MODEL[2] || data.model === MODEL[4]){
                data.valuationData.valuation.map((valuationDetails)=>{
                  if(valuationDetails.particular === 'ebitda'){
                    ebitda = {
                      particular:'EBITDA',
                      avg:(Math.floor(valuationDetails.ebitda * 100) / 100).toLocaleString('en-IN'),
                      med:(Math.floor(valuationDetails.ebitda * 100) / 100).toLocaleString('en-IN')
                    }

                    evEbitda = {
                      particular:'EV/EBITDA',
                      avg: (Math.floor(valuationDetails.evAvg * 100) / 100).toLocaleString('en-IN'),
                      med: (Math.floor(valuationDetails.evMed * 100) / 100).toLocaleString('en-IN')
                    }

                    enterpriseVal = {
                      particular:'Enterprise Value',
                      avg:(Math.floor(valuationDetails.enterpriseAvg * 100) / 100).toLocaleString('en-IN'),
                      med:(Math.floor(valuationDetails.enterpriseMed * 100) / 100).toLocaleString('en-IN')
                    }

                    debtVal = {
                      particular:'Less : Value of Debt',
                      avg:(Math.floor(valuationDetails.debtAvg * 100) / 100).toLocaleString('en-IN'),
                      med:(Math.floor(valuationDetails.debtMed * 100) / 100).toLocaleString('en-IN')
                    }
                    equityVal = {
                      particular:'Value of Equity',
                      avg:(Math.floor(valuationDetails.ebitdaEquityAvg * 100) / 100).toLocaleString('en-IN'),
                      med:(Math.floor(valuationDetails.ebitdaEquityMed * 100) / 100).toLocaleString('en-IN')
                    }
                    totalEvEbitdaRatio.push(ebitda,evEbitda,enterpriseVal,debtVal,equityVal);
                  }
                })
              }
            })
          }
          return totalEvEbitdaRatio;
        })

        hbs.registerHelper('priceToSalesRatioCalculation',()=>{
          let sales:any=[],psRatio:any=[],equityVal:any=[],totalPriceToSalesRatio:any=[];
          if(valuationResult?.modelResults){
            valuationResult.modelResults.map((data)=>{
              if(data.model === MODEL[2] || data.model === MODEL[4]){
                data.valuationData.valuation.map((valuationDetails)=>{
                  if(valuationDetails.particular === 'sales'){
                    sales = {
                      particular:'Sales of company',
                      avg:(Math.floor(valuationDetails.salesAvg * 100) / 100).toLocaleString('en-IN'),
                      med:(Math.floor(valuationDetails.salesMed * 100) / 100).toLocaleString('en-IN')
                    }

                    psRatio = {
                      particular:'P/S Ratio',
                      avg: (Math.floor(valuationDetails.salesRatioAvg * 100) / 100).toLocaleString('en-IN'),
                      med: (Math.floor(valuationDetails.salesRatioMed * 100) / 100).toLocaleString('en-IN')
                    }

                    equityVal = {
                      particular:'Value of Equity',
                      avg:(Math.floor(valuationDetails.salesEquityAvg * 100) / 100).toLocaleString('en-IN'),
                      med:(Math.floor(valuationDetails.salesEquityMed * 100) / 100).toLocaleString('en-IN')
                    }

                    totalPriceToSalesRatio.push(sales,psRatio,equityVal);
                  }
                })
              }
            })
          }
          return totalPriceToSalesRatio;
        })

        hbs.registerHelper('weightedAvgValuePrShare',()=>{
          let evSales:any=[],evEbitda:any=[],priceToBookValue:any=[],priceToEarnings:any=[],avgValuePerShare:any=[],totalWeightedAvgValuePrShare:any=[];
          if(valuationResult?.modelResults){
            valuationResult.modelResults.map((data)=>{
              if(data.model === MODEL[2] || data.model === MODEL[4]){
                data.valuationData.valuation.map((valuationDetails)=>{
                  if(valuationDetails.particular === 'sales'){
                    evSales = {
                      particular:'Value as per P/Sales',
                      fairValOfEquity:(Math.floor(valuationDetails.salesEquityAvg * 100) / 100).toLocaleString('en-IN'), // only for calculating average
                      weights:'25%',
                      weightedVal:((25 * (Math.floor(valuationDetails.salesEquityAvg * 100) / 100))/100).toFixed(2),  //only for calculating average
                    }
                  }
                  if(valuationDetails.particular === 'ebitda'){
                    evEbitda = {
                      particular:'Value as per EV/EBITDA',
                      fairValOfEquity: (Math.floor(valuationDetails.ebitdaEquityAvg * 100) / 100).toLocaleString('en-IN'), //only for calculating average
                      weights:'25%',
                      weightedVal:((25 * (Math.floor(valuationDetails.ebitdaEquityAvg * 100) / 100))/100).toFixed(2) //only for calculating average
                    }
                  }

                  if(valuationDetails.particular === 'pbRatio'){
                    priceToBookValue = {
                      particular:'Value as per P/BV',
                      fairValOfEquity:(Math.floor(valuationDetails.pbMarketPriceAvg * 100) / 100).toLocaleString('en-IN'), //only for calculating average
                      weights:'25%',
                      weightedVal:((25 * (Math.floor(valuationDetails.pbMarketPriceAvg * 100) / 100))/100).toFixed(2) //only for calculating average
                    }
                  }

                  if(valuationDetails.particular === 'peRatio'){
                    priceToEarnings = {
                      particular:'Value as per P/E',
                      fairValOfEquity:(Math.floor(valuationDetails.peMarketPriceAvg * 100) / 100).toLocaleString('en-IN'), //only for calculating average
                      weights:'25%',
                      weightedVal:((25 * (Math.floor(valuationDetails.peMarketPriceAvg * 100) / 100))/100).toFixed(2) //only for calculating average
                    }
                  }
                  if(valuationDetails.particular === 'result'){
                    avgValuePerShare = {
                      particular:`Value per Share ${valuationResult.inputData[0].currencyUnit}`,
                      fairValOfEquity:'', //selected fair value of equity for average calculation
                      weights:'',
                      weightedVal: (Math.floor(valuationDetails.fairValuePerShareAvg * 100) / 100).toFixed(2) //selected fair value of equity for average calculation
                    }
                  }
                })
              }
            })
            totalWeightedAvgValuePrShare.push(evSales,evEbitda,priceToBookValue,priceToEarnings,avgValuePerShare);
          }
          return totalWeightedAvgValuePrShare;
        })

        hbs.registerHelper('checkPreferenceRatio',()=>{
          if( valuationResult.inputData[0].preferenceRatioSelect === RELATIVE_PREFERENCE_RATIO[1])
            return true;
          return false;
        })

        hbs.registerHelper('industryName',()=>{
          if(valuationResult.inputData[0].industry)
            return valuationResult.inputData[0].industry;
          return '';
        })

        hbs.registerHelper('numberOfSubindustry',()=>{
          if(valuationResult.inputData[0].companies)
            return valuationResult.inputData[0].companies?.length
          return 0
        })

        hbs.registerHelper('checkHead',(txt,val)=>{
          if(typeof txt === 'number' && val === 'srNo'){
            return true;
          }
          if(txt === '' && val === 'particular'){
            return true;
          }
          if(txt.includes('Value per share') && val === 'onlyValuePerShare'){
            return true
          }
          return false
        })
        
        hbs.registerHelper('checkSubHead',(txt,val)=>{
          if(typeof txt === 'number' && val === 'srNo'){
            return true;
          }
          if(txt === '' && val === 'particular'){
            return true;
          }

          if( txt === 'Equity Value' || txt === 'Firm Value'|| txt === 'Net Current Assets' || txt === 'Non Current Assets' || txt === 'Non Current Assets' || txt ===  'Total Non Current Assets'   )
          {
            return true;
          }
          return false
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

      hbs.registerHelper('isNumber',(value)=>{
        if(isNaN(value) === false)
          return true;
        return false;
      })

      hbs.registerHelper('modelIncludes', (value, options) => {
        const approaches = {
            'INCOME_APPROACH': INCOME_APPROACH,
            'NET_ASSET_VALUE_APPROACH': NET_ASSET_VALUE_APPROACH,
            'MARKET_PRICE_APPROACH': MARKET_PRICE_APPROACH
        };
    
        const approachModels = approaches[value];
        if (approachModels) {
          const found = valuationResult.modelResults.some(response => {
              return approachModels.includes(response.model);
          });
  
          if (found) {
              return options.fn(this);
          } else {
              return '';
          }
        }
    });

    hbs.registerHelper('checkIfValuePerShare',(particular,stringToCheck)=>{
      if(stringToCheck === 'Value per Share' && particular.includes('Value per Share')){
        return true;
      }
      return false;
    })

    hbs.registerHelper('isSection165',()=>{
      if(reportDetails.reportSection.includes(`165 - SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018`) && reportDetails.reportSection.length === 1){
        return true;
      }
      return false;
    })

    hbs.registerHelper('calculateColspan',()=>{
      let colspan;
      valuationResult.modelResults.map((response)=>{
        if(response.model === MODEL[0] || response.model === MODEL[1]){
          colspan = response?.valuationData.length;
        }
      })
      return colspan + 1;  //add one since column starts from particulars
    })

    hbs.registerHelper('isLineItemCheck',(value)=>{
      if(`${value}`.includes('Equity Value as on')){
        return false;
      }
      if(`${value}`.includes('Value per Share ')){
        return false
      }
        if(REPORT_LINE_ITEM.includes(`${value}`))
          return false;
        return true;
    })
    }
     
     catch(error){
      return {
        msg:'error in helper',
        error:error.message,
        status:false
      }
     }
    }

    formatDate(date: Date): string {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
  
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
  
      return `${month} ${day}, ${year}`;
    }

    async pushUpdatedReportIntoS3(formData){
      try{
        const uploadDir = path.join(__dirname, '../../../pdf');
        const filePath = path.join(uploadDir, formData.filename);
        let file = fs.readFileSync(filePath).toString('base64');
        return await this.upsertReportInS3(file,formData.filename);
      }
      catch(error){
        return {
          error:error,
          msg:'uploading report in s3 failed',
          status : false
        }
      }
    }

  async upsertReportInS3(data,filename){
    try{
      
      const headers = {
        'x-api-key': process.env.AWS_S3_API_KEY,
        "Content-Type": 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    
      const upsertReport = await axiosInstance.put(`${IFIN_REPORT}${AWS_STAGING.PROD}/${DOCUMENT_UPLOAD_TYPE.VALUATION_REPORT}/${filename}`,data,{headers});
      if(upsertReport.status === 200){
      return { filename } 
      }
      else{
      return {
        status:false,
        msg:'Report upload failed',
      }
      }
    }
    catch(error){
      throw error
    }
  }



  async fetchReportFromS3(fileName){
    try{
      if(fileName){

      const headers = {
        'x-api-key': process.env.AWS_S3_API_KEY,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      }

      const fetchReport = await axiosInstance.get(`${IFIN_REPORT}${AWS_STAGING.PROD}/${DOCUMENT_UPLOAD_TYPE.VALUATION_REPORT}/${fileName}`,{headers});

      if(fetchReport.status === 200){
        if (Buffer.from(fetchReport.data, 'base64').toString('base64') !== fetchReport.data.trim()) {
          throw new Error('The specified key does not exist');
        } else {

          const uploadDir = path.join(__dirname, '../../../pdf');
  
          const buffer = Buffer.from(fetchReport.data, 'base64')
  
          const filePath = path.join(uploadDir, fileName);
  
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          fs.writeFileSync(filePath, buffer);
          
          return filePath;
        }
      }
      else{
        throw new Error('Report fetching from S3 failed');
      }
    }
    }catch(error){
      return {
        error:error,
        status:false,
        msg:'Report fetch from S3 failed'
      }
    }
  }

  formatPositiveAndNegativeValues(value) {
    let formattedValue = '';
  
    if (value !== null && value !== undefined && value !== '') {
      formattedValue = Math.abs(value) < 0.005 ? '0.00' : `${Math.abs(value).toFixed(2)}`;
      formattedValue = Number(formattedValue).toLocaleString('en-IN');
    }
  
    return value < 0 ? `(${formattedValue})` : formattedValue;
  }
}
