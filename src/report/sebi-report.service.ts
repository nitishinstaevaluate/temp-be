import { Injectable } from "@nestjs/common";
import { formatDateHyphenToDDMMYYYY, convertToNumberOrZero } from "src/excelFileServices/common.methods";
import { CIQ_ELASTIC_SEARCH_PRICE_EQUITY } from "src/interfaces/api-endpoints.local";
import { axiosInstance, axiosRejectUnauthorisedAgent } from "src/middleware/axiosConfig";
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import hbs = require('handlebars');
import { AuthenticationService } from "src/authentication/authentication.service";
import { convertEpochToPlusOneDate, formatDate, formatPositiveAndNegativeValues } from "./report-common-functions";
import { GET_MULTIPLIER_UNITS, MODEL, NATURE_OF_INSTRUMENT, REPORT_PURPOSE } from "src/constants/constants";
import { thirdPartyReportService } from "./third-party-report.service";
require('dotenv').config()



@Injectable()
export class sebiReportService {

    constructor(private authenticationService:AuthenticationService,
      private thirdPartyService:thirdPartyReportService){}

    async computeSEBIReport(htmlPath, pdfFilePath, request, valuationResult, reportDetails){
        try{
          const companyName = valuationResult.inputData[0].company;
          const valuationDate = valuationResult.inputData[0].valuationDate;
          const sharePriceDetails:any = await this.fetchPriceEquityShare(request, companyName, valuationDate);
    
           this.loadSebiHelpers(valuationResult, reportDetails, sharePriceDetails.data.data);
    
          const htmlContent = fs.readFileSync(htmlPath, 'utf8');
          const template = hbs.compile(htmlContent);
          const html = template(valuationResult);
    
          return await this.generateSebiReport(html, pdfFilePath);
        }
        catch(error){
          console.log(error)
          return {
            error:error,
            status:false,
            msg:"Sebi report generation failed"
          }
        }
      }

      async computeSEBIpreviewReport(reportDetails, valuationResult, response, request, docFilePath, htmlFilePath, pdfFilePath){
        try{
          let pdf
          const companyName = valuationResult.inputData[0].company;
          const valuationDate = valuationResult.inputData[0].valuationDate;
          const sharePriceDetails:any = await this.fetchPriceEquityShare(request, companyName, valuationDate);

          if(reportDetails.fileName){
            const convertDocxToSfdt = await this.thirdPartyService.convertDocxToSyncfusionDocumentFormat(docFilePath,true)
      
            response.send(convertDocxToSfdt);
      
            return {
              msg: "Preview Success",
              status: true,
            };
          }
         
      
          
          this.loadSebiHelpers(valuationResult, reportDetails, sharePriceDetails.data.data);
      
          if (valuationResult.modelResults.length > 0) {
              const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
              const template = hbs.compile(htmlContent);
              const html = template(valuationResult);
      
              
              pdf = await this.generateSebiReport(html, pdfFilePath);
              await this.thirdPartyService.convertPdfToDocx(pdfFilePath,docFilePath)
              
              const convertDocxToSfdt = await this.thirdPartyService.convertDocxToSyncfusionDocumentFormat(docFilePath)
      
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
          return{
            error:error,
            status:false,
            msg:"Sebi report preview failed"
          }
        }
      }

      async fetchPriceEquityShare(request, companyName, valuationDate){
        try{
          const payload = {
            companyDetails:{
              date:"2023-03-29T00:00:00.000000",
              companyId:874487
            }
          }
          const bearerToken = await this.authenticationService.extractBearer(request);
      
          if(!bearerToken.status)
            return bearerToken;
      
          const headers = { 
            'Authorization':`${bearerToken.token}`,
            'Content-Type': 'application/json'
          }
          
          const financialSegmentDetails = await axiosInstance.post(`${CIQ_ELASTIC_SEARCH_PRICE_EQUITY}`, payload, { httpsAgent: axiosRejectUnauthorisedAgent, headers });
          return financialSegmentDetails
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:"equity"
          }
        }
      }

      async generateSebiReport(htmlContent: any, pdfFilePath: string) {
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

      

      async loadSebiHelpers(valuationResult, reportDetails, sharePriceDetails){
        try{
          hbs.registerHelper('reportDate',()=>{
            if(reportDetails.registeredValuerDetails[0]) 
                return  formatDate(new Date(reportDetails.reportDate));
            return '';
          })
    
          hbs.registerHelper('companyName',()=>{
            if(valuationResult.inputData[0].company)
              return valuationResult.inputData[0].company;
            return '';
          })
    
          hbs.registerHelper('sharePriceData', ()=>{
            return sharePriceDetails
          })

          hbs.registerHelper('strdate',()=>{
            if(valuationResult.inputData[0].valuationDate)
              return formatDate(new Date(valuationResult.inputData[0].valuationDate));
            return '';
          })
          
          hbs.registerHelper('relevantDate',()=>{
            if(valuationResult.inputData[0].valuationDate)
              return convertEpochToPlusOneDate(new Date(valuationResult.inputData[0].valuationDate));
            return '';
          })

          hbs.registerHelper('riskFreeRateYears',()=>{
            if(valuationResult.inputData[0].riskFreeRateYears){
              return valuationResult.inputData[0].riskFreeRateYears;
            }
            return '';
          })
    
          hbs.registerHelper('updateDateFormat',(val)=>{
            return formatDateHyphenToDDMMYYYY(val);
          })
    
          hbs.registerHelper('totalRevenue',(vwap,volume)=>{
            return (convertToNumberOrZero(vwap) * convertToNumberOrZero(volume)).toFixed(2);
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

          hbs.registerHelper('natureOfInstrument',()=>{
            if(reportDetails)
              return NATURE_OF_INSTRUMENT[`${reportDetails.natureOfInstrument}`];
            return '';
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

          hbs.registerHelper('isSection165',()=>{
            if(reportDetails.reportSection.includes(`165 - SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018`) && reportDetails.reportSection.length === 1){
              return true;
            }
            return false;
          })

          hbs.registerHelper('bse500Value',()=>{
            if(valuationResult.inputData[0])
              return formatPositiveAndNegativeValues(valuationResult.inputData[0]?.bse500Value);
            return '-';
          })

          hbs.registerHelper('displayValuationHeader',()=>{
            let modelArray = [];
            let string;
          if(valuationResult.modelResults){
              valuationResult.modelResults.map((result)=>{
                modelArray.push(result.model);
              })
            }
          return this.generateString(modelArray, reportDetails);
          })

          hbs.registerHelper('projectedYear',()=>{
            const finalYearColumn = valuationResult.modelResults;
            let finalProjYear;
            finalYearColumn.map((elements)=>{
              if(elements.model === MODEL[0] || elements.model === MODEL[1]){
                finalProjYear = elements.valuationData[elements.valuationData.length - 2].particulars;
              }
            })
            if(finalProjYear)
              return `20${finalProjYear.split('-')[1]}`;
            return '2028';
          })

          hbs.registerHelper('terminalGrowthRate',()=>{
            if(valuationResult.inputData[0]) 
                return valuationResult.inputData[0]?.terminalGrowthRate;
            return '0';
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

          hbs.registerHelper('combinedValuePerShare',()=>{
            if(valuationResult.inputData[0].model.length === 1){
              let formattedValues;
              formattedValues = valuationResult.inputData[0].model.flatMap((models) => {
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
              return formattedValues[0]
            }
            else {
              if(reportDetails?.modelWeightageValue){
                const equityValue = reportDetails.modelWeightageValue.weightedVal;
                const outstandingShares = valuationResult.inputData[0].outstandingShares;
                const finalValue =  Math.floor(equityValue*GET_MULTIPLIER_UNITS[`${valuationResult?.inputData[0]?.reportingUnit}`]/outstandingShares).toLocaleString('en-IN'); // use muliplier
                return `${finalValue.replace(/,/g, ',')}/-`
              }
            }
          })
        }
        catch(error){
          return {
            error:error,
            status:false,
            msg:"Sebi helpers failure"
          }
        }
      }


      generateString(modelArray, reportDetails) {
        const methods = {
          DCF: "Discounted Cash Flow Method (‘DCF’)",
          CCM: "Comparable Company Multiple Method (‘CCM’)",
          NAV: "Net Asset Value Method (‘NAV’)",
          MarketPrice: "Market Price Method",
        };
      
        let selectedMethods = [];
      
        if (!reportDetails.reportSection.includes("165 - SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018")) {
          selectedMethods = [
            modelArray.includes(MODEL[0]) || modelArray.includes(MODEL[1]) ? methods.DCF : null,
            modelArray.includes(MODEL[5]) ? methods.NAV : null,
            (modelArray.includes(MODEL[2]) || modelArray.includes(MODEL[4])) ? methods.CCM : null,
          ];
        } else if (reportDetails.reportSection.includes("165 - SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018") && reportDetails.reportSection.length === 1) {
          selectedMethods = [
            modelArray.includes(MODEL[0]) || modelArray.includes(MODEL[1]) ? methods.DCF : null,
            modelArray.includes(MODEL[5]) ? methods.NAV : null,
            (modelArray.includes(MODEL[2]) || modelArray.includes(MODEL[4])) ? methods.CCM : null,
            methods.MarketPrice,
          ];
        }
      
        const filteredMethods = selectedMethods.filter(method => method !== null);
      
        const lastElementIndex = filteredMethods.length - 1;
        if (lastElementIndex >= 1) {
          filteredMethods[lastElementIndex] = `and ${filteredMethods[lastElementIndex]}`;
        }
      
        const string = filteredMethods.join(', ');
      
        return string;
      }
}