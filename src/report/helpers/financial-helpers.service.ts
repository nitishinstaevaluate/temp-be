import { Injectable } from "@nestjs/common";
import hbs = require('handlebars');
import { MODEL } from "src/constants/constants";
import { convertToNumberOrZero } from "src/excelFileServices/common.methods";
import { formatPositiveAndNegativeValues } from "../report-common-functions";

@Injectable()
export class financialHelperService{

    loadFinancialTableHelper(financialData, valuationDetails){
        hbs.registerHelper('financialSegment',()=>{
          let financiallyFilteredCompany = [], companySelectedArray = [], isSelectedExists = false;
          if(financialData){
            valuationDetails.modelResults.map((data)=>{
              if(data.model === MODEL[2] || data.model === MODEL[4]){
                isSelectedExists  = data.valuationData?.companies.some((indCompanies: any) => 'isSelected' in indCompanies);
                if(isSelectedExists){
                  companySelectedArray = data.valuationData?.companies;
                }
              }
            }
            )
            if(isSelectedExists && companySelectedArray?.length){
              let counter = 1;
              companySelectedArray.map((indFilterCompany)=>{
                financialData.map((indFinancialCompanyData)=>{
                  if(indFinancialCompanyData?.companyId === indFilterCompany?.companyId && indFilterCompany?.isSelected){
                    indFinancialCompanyData['serialNo'] = counter;
                    financiallyFilteredCompany.push(indFinancialCompanyData);
                    counter ++;
                  }
                })
              })
              return financiallyFilteredCompany;
            }
            else{
              return financialData;
            }
          }
          return [];
        })
    
        hbs.registerHelper('fiancialMean',()=>{
          let mean = 0;
          if(financialData){
            financialData.map((elements)=>{
              mean += convertToNumberOrZero(elements.evByRevenue);
            })
            return (mean/financialData.length).toFixed(2);
          }
          return 0;
        })
    
        hbs.registerHelper('priceToSalesMean',()=>{
          let mean = 0;
          if(financialData){
            valuationDetails.modelResults.map((data)=>{
              if(data.model === MODEL[2] || data.model === MODEL[4]){
                const companies = data.valuationData?.companies;
                if(!companies?.length)
                    return mean = 0;
                companies.map((indCompany)=>{
                  if(indCompany.company === 'Average'){
                    mean = indCompany.sales
                  }
                })
              }
            }
            )
            // financialData.map((elements)=>{
            //   mean += convertToNumberOrZero(elements.sales);
            // })
            return convertToNumberOrZero(mean).toFixed(2);
          }
          return 0;
        })
        hbs.registerHelper('priceToBookMean',()=>{
          let mean = 0;
          if(financialData){
            valuationDetails.modelResults.map((data)=>{
              if(data.model === MODEL[2] || data.model === MODEL[4]){
                const companies = data.valuationData?.companies;
                if(!companies?.length)
                  return mean = 0;
                companies.map((indCompany)=>{
                  if(indCompany.company === 'Average'){
                    mean = indCompany.pbRatio;
                  }
                })
              }
            }
            )
            // financialData.map((elements)=>{
            //   mean += convertToNumberOrZero(elements.pbRatio);
            // })
            return convertToNumberOrZero(mean).toFixed(2);
          }
          return 0;
        })
    
        hbs.registerHelper('priceToEquityMean',()=>{
          let mean = 0;
          if(financialData){
            valuationDetails.modelResults.map((data)=>{
              if(data.model === MODEL[2] || data.model === MODEL[4]){
                const companies = data.valuationData?.companies;
                if(!companies?.length)
                  return mean = 0;
                companies.map((indCompany)=>{
                  if(indCompany.company === 'Average'){
                    mean = indCompany.peRatio;
                  }
                })
              }
            }
            )
            // financialData.map((elements)=>{
            //   mean += convertToNumberOrZero(elements.peRatio);
            // })
            return convertToNumberOrZero(mean).toFixed(2);
          }
          return 0;
        })
        hbs.registerHelper('evByEbitdaMean',()=>{
          let mean = 0;
          if(financialData){
            valuationDetails.modelResults.map((data)=>{
              if(data.model === MODEL[2] || data.model === MODEL[4]){
                const companies = data.valuationData?.companies;
                if(!companies?.length)
                  return mean = 0;
                companies.map((indCompany)=>{
                  if(indCompany.company === 'Average'){
                    mean = indCompany.ebitda;
                  }
                })
              }
            }
            )
            // financialData.map((elements)=>{
            //   mean += convertToNumberOrZero(elements.ebitda);
            // })
            return convertToNumberOrZero(mean).toFixed(2);
          }
          return 0;
        })
    
        hbs.registerHelper('fixDecimalUptoTwo',(val)=>{
          if (val) {
            return formatPositiveAndNegativeValues(val);
          }
          return '-';
        })
    
        hbs.registerHelper('decimalAdjustment',(val)=>{
          if (val && !isNaN(+val)) {
            return parseFloat(val).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
          }
          return '-';
        })
    
        hbs.registerHelper('lessDiscountRate',()=>{
          if (valuationDetails) {
            return valuationDetails.inputData[0].discountRateValue;
          }
          return '-';
        })
        hbs.registerHelper('postDiscount',(mean)=>{
          if (mean || valuationDetails.inputData[0].discountRateValue) {
            return (mean * (1 - (+valuationDetails.inputData[0].discountRateValue/100))).toFixed(2);
          }
          return '-';
        })
      }

}