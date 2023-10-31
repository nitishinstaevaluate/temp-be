import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { ValuationsService } from 'src/valuationProcess/valuationProcess.service';
import hbs = require('handlebars');
import { InjectModel } from '@nestjs/mongoose';
import { Model, model } from 'mongoose';
import { ReportDocument } from './schema/report.schema';
import { CAPITAL_STRUCTURE_TYPE, METHODS_AND_APPROACHES, MODEL, NATURE_OF_INSTRUMENT } from 'src/constants/constants';
import { FCFEAndFCFFService } from 'src/valuationProcess/fcfeAndFCFF.service';
import * as XLSX from 'xlsx';
import { CalculationService } from 'src/calculation/calculation.service';

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
          const getReportData = await this.reportModel.findById(id);

          const valuationResult:any = await this.valuationService.getValuationById(getReportData.reportId);

          if(valuationResult.inputData[0].model.includes(MODEL[1])){
            const taxRate = valuationResult.inputData[0].taxRate.includes('%') ? parseFloat(valuationResult.inputData[0].taxRate.replace("%", "")) : valuationResult.inputData[0].taxRate;
             getCapitalStructure = await this.calculationService.getWaccExcptTargetCapStrc(
              +valuationResult.inputData[0].adjustedCostOfEquity,
              valuationResult.inputData[0].excelSheetId,+valuationResult.inputData[0].costOfDebt,
              +valuationResult.inputData[0].copShareCapital,+valuationResult.inputData[0].capitalStructure.deRatio,
              valuationResult.inputData[0].capitalStructureType,taxRate,valuationResult.inputData[0].capitalStructure
              );
          }

        let htmlFilePath, pdfFilePath;
          let dateStamp = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}-${new Date().getHours()}${new Date().getMinutes()}`;
          htmlFilePath = path.join(process.cwd(), 'html-template', `${approach === METHODS_AND_APPROACHES[0] ? 'basic-report' : approach === METHODS_AND_APPROACHES[1] ? 'nav-report' : ''}.html`);
          pdfFilePath = path.join(process.cwd(), 'pdf', `Ifinworth Valuation-${dateStamp}.pdf`);
  
          for await (let data of valuationResult.modelResults) {
              if (data.model !== MODEL[2] && data.model !== MODEL[4] && data.model !== MODEL[5]) {
                  transposedData.push({ model: data.model, data: await this.fcfeService.transformData(data.valuationData) });
              }
          }
          this.loadHelpers(transposedData, valuationResult, getReportData,getCapitalStructure);
  
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
        reportDate:data?.reportDate,
        natureOfInstrument:data?.natureOfInstrument,
        reportSection:data?.reportSection
      }
      try {
        const createdFoo = await this.reportModel.create(payload);
        return createdFoo._id;
      } catch (e) {
        throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
      }
    }

   loadHelpers(transposedData,valuationResult,getReportData,getCapitalStructure){
     try{
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
        modelName = modelName.split(',')
        let formattedValues;
        if (valuationResult) {
          formattedValues = modelName.flatMap((models) => {
              return valuationResult.modelResults.flatMap((response) => {
                  if (response.model === models && models !== 'NAV') {
                      const formattedNumber = Math.floor(response?.valuationData[0]?.valuePerShare).toLocaleString('en-IN');
                      return `${formattedNumber.replace(/,/g, ',')}/-`;
                  }
                  if (response.model === models && models === 'NAV') {
                      const formattedNumber = Math.floor(response?.valuationData?.valuePerShare.value).toLocaleString('en-IN');
                      return `${formattedNumber.replace(/,/g, ',')}/-`;
                  }
                  return [];
              });
          });
          return formattedValues[0];
      }
      // console.log(formattedValues,"formatted value")
        return '';
      })
      hbs.registerHelper('equityPerShare',()=>{
        if(transposedData[0].data.transposedResult[1])
        return valuationResult.modelResults.map((response)=>{
          if(response.model===MODEL[0] || response.model === MODEL[1]){
            const formattedNumber = Math.floor(response?.valuationData[0]?.equityValue * 100000).toLocaleString('en-IN');
            return `${formattedNumber.replace(/,/g, ',')}/-`;
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
        const stringAlpha={
          companySize:'Company Size',
          marketPosition:'Market Position',
          liquidityFactor:'Liquidity Factor',
          competition:'Competition',
          qualitativeFactor:'Qualitative Factor'
        }
        let letterIndex = 97; // this is the ascii code start
        for (const key in valuationResult.inputData[0].alpha) {
          if (valuationResult.inputData[0].alpha[key] !== '' && valuationResult.inputData[0].alpha[key] !== '0') {
            let element;
            let letter = String.fromCharCode(letterIndex);
            if (letterIndex > 97) {
              element = `<br/><span style="text-align: center;text-transform:capitalize">${letter}. ${stringAlpha[`${key}`]}</span>`;
            } else {
              element = `<span style="text-align: center;text-transform:capitalize">${letter}. ${stringAlpha[`${key}`]}</span>`;
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
          costOfDebt =  parseFloat(valuationResult.inputData[0]?.costOfDebt)?.toFixed(3);
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
        if(valuationResult.modelResults){
          valuationResult.modelResults.map((result)=>{
            result.valuationData.map((response,i)=>{
              if(response.particulars === 'Terminal Value'){
                index = i
              }
            })
            explicitYear = result.valuationData[index-1]['particulars'];
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

      hbs.registerHelper('depAndAmortisation', () => {
        let arraydepAndAmortisation = [];
        valuationResult.modelResults.forEach((result)=>{
          if(result.model === 'FCFE'){
            result.valuationData.map((response:any)=>{
              arraydepAndAmortisation.push({fcfeDepAmortisation:response.depAndAmortisation ? parseFloat(response?.depAndAmortisation).toFixed(2) : ''})
            })
            arraydepAndAmortisation.unshift({fcfeDepAmortisation:"Depn. and Amortn."});
          }
          else if (result.model === 'FCFF'){
            result.valuationData.map((response:any)=>{
              arraydepAndAmortisation.push({fcffDepAmortisation:response.depAndAmortisation ? parseFloat(response?.depAndAmortisation).toFixed(2) : ''})
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
              // console.log(response.onCashItems,"cash items", typeof response.onCashItems)
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
        // console.log(arrayonCashItems,"array values")
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
          if(result.valuationData?.some(obj => obj.hasOwnProperty('stubAdjValue'))){
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
              arrayEquityValue.unshift({fcfeEquityValue:`Equity Value as on ${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
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
              arrayEquityValue.unshift({fcffEquityValue:`Equity Value as on ${this.formatDate(new Date(valuationResult.inputData[0].valuationDate))}`});
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
        console.log(arrayEquityValue);
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

      hbs.registerHelper('natureOfInstrument',()=>{
        if(getReportData)
          return NATURE_OF_INSTRUMENT[`${getReportData.natureOfInstrument}`];
        return '';
      })

      hbs.registerHelper('ifEquityValProvisional',(options)=>{
        let checkiIfprovisional = false;
        valuationResult.modelResults.forEach((result)=>{
          if(result.valuationData?.some(obj => obj.hasOwnProperty('equityValueNew'))){
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
          // console.log(navData,"nav data")
          return navData;
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
}
