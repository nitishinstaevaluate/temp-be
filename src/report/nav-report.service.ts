import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { REPORT_PURPOSE, MODEL, GET_MULTIPLIER_UNITS, REPORTING_UNIT, NATURE_OF_INSTRUMENT, PURPOSE_OF_REPORT_AND_SECTION } from "src/constants/constants";
import { thirdpartyApiAggregateService } from "src/library/thirdparty-api/thirdparty-api-aggregate.service";
import { formatDate, formatPositiveAndNegativeValues } from "./report-common-functions";
import * as converter from 'number-to-words';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import hbs = require('handlebars');
import { ReportDocument } from "./schema/report.schema";
import { Model } from "mongoose";
import { ValuationsService } from "src/valuationProcess/valuationProcess.service";
import { InjectModel } from "@nestjs/mongoose";
@Injectable()
export class navReportService {
    constructor(private thirdpartyApiAggregateService: thirdpartyApiAggregateService,
        @InjectModel('report') private readonly reportModel: Model<ReportDocument>,
        private valuationService:ValuationsService){
    }
    async generateNavReport(id, res){
        try{
            let htmlFilePath, pdfFilePath,docFilePath,pdf;
            const reportDetails = await this.reportModel.findById(id);
            const valuationResult:any = await this.valuationService.getValuationById(reportDetails.reportId);
      
            if(reportDetails.reportPurpose.includes(Object.keys(REPORT_PURPOSE)[0])){
              htmlFilePath = path.join(process.cwd(), 'html-template', 'nav-report.html');
            }

            pdfFilePath = path.join(process.cwd(), 'pdf', `${valuationResult.inputData[0].company}-${reportDetails.id}.pdf`);
            docFilePath = path.join(process.cwd(), 'pdf', `${valuationResult.inputData[0].company}-${reportDetails.id}.docx`);
            
            if(reportDetails?.fileName){
              const convertDocxToPdf = await this.thirdpartyApiAggregateService.convertDocxToPdf(docFilePath,pdfFilePath);
      
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', `attachment; filename="='${valuationResult.inputData[0].company}-${reportDetails.id}'.pdf"`);
              res.send(convertDocxToPdf);
      
               return {
                    msg: "Nav PDF download Success",
                    status: true,
                };
            }
            this.loadNavHelpers(valuationResult, reportDetails);
      
            if (valuationResult.modelResults.length > 0) {
                const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
                const template = hbs.compile(htmlContent);
                const html = template(valuationResult);
              
                if(reportDetails.reportPurpose.includes(Object.keys(REPORT_PURPOSE)[0])){
                  pdf = await this.generateNavPdf(html, pdfFilePath);
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
                    msg: "No data found for NAV PDF generation",
                    status: false
                };
            }
        }
        catch(error){
            throw new HttpException(
                {
                  error: error,
                  status: false,
                  msg: 'please check nav details, pdf generation failed',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }
    }

    loadNavHelpers(valuationResult,reportDetails){
        try{
            hbs.registerHelper('companyName',()=>{
            if(valuationResult.inputData[0].company)
                return valuationResult.inputData[0].company;
            return '';
            })
    
            hbs.registerHelper('reportDate',()=>{
            if(reportDetails.registeredValuerDetails[0]) 
                return  formatDate(new Date(reportDetails.reportDate));
            return '';
            })
    
            hbs.registerHelper('strdate',()=>{
            if(valuationResult.inputData[0].valuationDate)
                return formatDate(new Date(valuationResult.inputData[0].valuationDate));
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
                return formatDate(new Date(reportDetails.appointeeDetails[0].dateOfAppointment));
            return '';
            })

            hbs.registerHelper('dateOfIncorporation',()=>{
            if(reportDetails.appointeeDetails[0])
                return formatDate(new Date(reportDetails.dateOfIncorporation));
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

            hbs.registerHelper('location',()=>{
            if(valuationResult.inputData[0]) 
                return valuationResult.inputData[0].location; 
            return '';
            })
    
            hbs.registerHelper('companyInfo',()=>{
            if(reportDetails.companyInfo){
                return reportDetails.companyInfo;
            }
            return '';
            })
    
            hbs.registerHelper('modelValuePerShare',(modelName)=>{
            modelName = modelName.split(',');
            if(modelName.length <= 2 ){
                let formattedValues;
                formattedValues = modelName.flatMap((models) => {
                    return valuationResult.modelResults.flatMap((response) => {
                    if (response.model === models && models === 'NAV') {
                        // const formattedNumber = Math.floor(response?.valuationData?.valuePerShare?.bookValue).toLocaleString('en-IN');
                        const formattedNumber = formatPositiveAndNegativeValues(response?.valuationData?.valuePerShare?.bookValue);
                        if(`${response?.valuationData?.valuePerShare?.bookValue}`.includes('-')){
                            return `10/-`
                        }
                        return `${formattedNumber}/-`;
                    }
                    return [];
                    });
                });
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
                    
                    if (response.model === models && models === 'NAV') {
                        let formattedNumber = Math.floor(response?.valuationData?.valuePerShare?.bookValue).toLocaleString('en-IN');
                        if(`${formattedNumber}`.includes('-')){
                        formattedNumber = Math.floor(10).toLocaleString('en-IN');
                        }
                        return `Rupees ${converter.toWords(formattedNumber)} Only`;
                    }
                    return [];
                    });
                });
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

            hbs.registerHelper('currencyUnit',()=>{
            if(valuationResult.inputData[0].currencyUnit)
                return valuationResult.inputData[0].currencyUnit;
            return 'INR';
            })
            hbs.registerHelper('reportingUnit',()=>{
            if(valuationResult.inputData[0].reportingUnit)
                return valuationResult.inputData[0].reportingUnit === REPORTING_UNIT.ABSOLUTE ? '' : valuationResult.inputData[0].reportingUnit;
            return 'Lakhs';
            })

    
            hbs.registerHelper('natureOfInstrument',()=>{
            if(reportDetails)
                return NATURE_OF_INSTRUMENT[`${reportDetails.natureOfInstrument}`];
            return '';
            })
    
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
                bookValue:indNav?.bookValue === null ? null : indNav?.bookValue === 0 || indNav?.bookValue ? formatPositiveAndNegativeValues(indNav.bookValue) : indNav?.bookValue,
                fairValue:indNav?.fairValue === 0 || indNav?.fairValue ? formatPositiveAndNegativeValues(indNav.fairValue) : indNav.value  === 0 || indNav?.value ? formatPositiveAndNegativeValues(indNav.value): indNav?.value
                }
            })
            }
            })
            return navData;
        })
    

        hbs.registerHelper('sectionAndPurposeOfReport', ()=>{
            let storePurposeWiseSections = {}, overallSectionsWithPurposes = [];
                if(!reportDetails.reportPurpose?.length || !reportDetails.reportSection?.length){
                return ['Please provide data']
                }

                //Firstly create object structure with purpose of report and sections in key-value format;
                reportDetails.reportPurpose.forEach((indpurpose, purposeIndex)=>{
                reportDetails.reportSection.forEach((indSection, sectionIndex) => {
                    if(PURPOSE_OF_REPORT_AND_SECTION[indpurpose].length){
                    if(PURPOSE_OF_REPORT_AND_SECTION[indpurpose].includes(indSection)){
                        storePurposeWiseSections[indpurpose] = storePurposeWiseSections[indpurpose] || [];
                        storePurposeWiseSections[indpurpose].push(indSection);
                    }
                    }
                });
                })
                // Use that object structure created above for looping and adding sections followed by purposes
                reportDetails.reportPurpose.forEach((indPurposeOfReport,index)=>{
                let stockedPurposes = storePurposeWiseSections[indPurposeOfReport];
                if (stockedPurposes.length <= 1) {
                    overallSectionsWithPurposes.push(stockedPurposes.join(', ') + ' of ' + REPORT_PURPOSE[indPurposeOfReport]);
                } else {
                    const lastSection = stockedPurposes[stockedPurposes.length - 1];
                    const otherSections = stockedPurposes.slice(0, -1).join(', ');
                    overallSectionsWithPurposes.push(`${otherSections} and ${lastSection}` + ' of ' + REPORT_PURPOSE[indPurposeOfReport]);
                    }
                })
                return overallSectionsWithPurposes.join(' and ');
        });
    
    
        hbs.registerHelper('navCurrencyAndReportingUnit',()=>{
            if(valuationResult?.inputData[0]?.reportingUnit === 'absolute'){
            return `Amount (${valuationResult?.inputData[0]?.currencyUnit})`
            }
            else{
            return `(${valuationResult?.inputData[0]?.currencyUnit} in ${valuationResult?.inputData[0]?.reportingUnit})`
            }
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
        }  
        catch(error){
            return {
            msg:'error in helper',
            error:error.message,
            status:false
            }
        }
    }

    async generateNavPdf(htmlContent: any, pdfFilePath: string) {
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

    async navReportPreview(id, response){
        try{

            let htmlFilePath, pdfFilePath,docFilePath,pdf;
            const reportDetails = await this.reportModel.findById(id);
            const valuationResult:any = await this.valuationService.getValuationById(reportDetails.reportId);
      
            if(reportDetails.reportPurpose.includes(Object.keys(REPORT_PURPOSE)[0])){
              htmlFilePath = path.join(process.cwd(), 'html-template', 'nav-report.html');
            }

            pdfFilePath = path.join(process.cwd(), 'pdf', `${valuationResult.inputData[0].company}-${reportDetails.id}.pdf`);
            docFilePath = path.join(process.cwd(), 'pdf', `${valuationResult.inputData[0].company}-${reportDetails.id}.docx`);
            
            if(reportDetails?.fileName){
              const convertDocxToSfdt = await this.thirdpartyApiAggregateService.convertDocxToSyncfusionDocumentFormat(docFilePath, true);
      
              response.send(convertDocxToSfdt)
              return {
                  msg: "Nav PDF download Success",
                  status: true,
                };
            }
            
            this.loadNavHelpers(valuationResult, reportDetails);

            if (valuationResult.modelResults.length > 0) {
                const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
                const template = hbs.compile(htmlContent);
                const html = template(valuationResult);
                
                pdf = await this.generateNavPdf(html, pdfFilePath);
                await this.thirdpartyApiAggregateService.convertPdfToDocx(pdfFilePath,docFilePath);
                
                const convertDocxToSfdt = await this.thirdpartyApiAggregateService.convertDocxToSyncfusionDocumentFormat(docFilePath);
        
                response.send(convertDocxToSfdt);
        
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

        }
        catch(error){
            throw new HttpException(
                {
                  error: error,
                  status: false,
                  msg: 'please check nav details, nav report preview failed',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
        }
    }
}