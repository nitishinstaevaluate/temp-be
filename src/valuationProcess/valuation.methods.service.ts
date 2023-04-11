import { Injectable } from '@nestjs/common';
import { IndustryService } from 'src/industry/industry.service';
import { GetPAT,DepAndAmortisation,OtherNonCashItemsMethod,ChangeInNCA,DeferredTaxAssets,
    ChangeInFixedAssets,GetDebtAsOnDate,CashEquivalents,SurplusAssets} from './calculation.method';
import { columnsList } from './excelSheetConfig';
//Valuation Methods Service
@Injectable()
export class ValuationMethodsService {
  constructor(private readonly industryService: IndustryService) {}

  async FCFEMethod(inputs:any,worksheet1:any,worksheet2:any): Promise<any> {
    
const firstYearCell = worksheet1["B1"];
const firstYear=firstYearCell.v.split(",")[1];
if(firstYear===undefined)
return {result:null,msg:"Please Separate Text Label and year with comma in B1 Cell in P&L Sheet1."};

const years=[];
years.push(firstYear.trim().split('-')[1]);
for(let i=1;i<9;i++){
  const yearCell = await worksheet1[`${columnsList[i]+1}`];
  if(yearCell===undefined)
       break;
  if(yearCell && yearCell!==undefined)
    years.push(yearCell.v.split('-')[1]);
}
const {projectionYear,outstandingShares}=inputs;
const finalResult=[];
//Industry Calculation we needs to create new service for it.
const discountingFactor=await this.industryService.getFCFEDisFactor(inputs);
years.map(async (year,i)=>{
  if(parseInt(year)>=projectionYear){
  let changeInNCA=null;
  let deferredTaxAssets=null;
  //Get PAT value
let pat= await GetPAT(i,worksheet1);
if(pat!==null)
   pat=pat.toFixed(2);
//Get Depn and Amortisation value
let depAndAmortisation= await DepAndAmortisation(i,worksheet1);
if(depAndAmortisation!==null)
   depAndAmortisation=depAndAmortisation.toFixed(2);

//Get Oher Non Cash items Value
const otherNonCashItems= await OtherNonCashItemsMethod(i,worksheet1);
const changeInNCAValue=  await ChangeInNCA(i,worksheet2);
changeInNCA=changeInNCA-changeInNCAValue;

const deferredTaxAssetsValue=  await DeferredTaxAssets(i,worksheet2);
deferredTaxAssets=deferredTaxAssets-deferredTaxAssetsValue;
// Net Cash Flow
const netCashFlow=parseInt(pat)||0+parseInt(depAndAmortisation)||0+parseInt(otherNonCashItems)||0+parseInt(changeInNCA)||0+parseInt(deferredTaxAssets)||0;
const changeInFixedAssets=  await ChangeInFixedAssets(i,worksheet2);
const fcff=netCashFlow+changeInFixedAssets;

const presentFCFF=discountingFactor*fcff;
const sumOfCashFlows= presentFCFF ;
const debtAsOnDate=  await GetDebtAsOnDate(i,worksheet2);
const cashEquivalents=  await CashEquivalents(i,worksheet2);
const surplusAssets=  await SurplusAssets(i,worksheet2);
const otherAdj=100000;
//formula: =+B16-B17+B18+B19+B20
const equityValue=sumOfCashFlows-debtAsOnDate+cashEquivalents+surplusAssets+otherAdj;
const valuePerShare=equityValue/outstandingShares;
  const result={
    "particulars":year,
    "pat":pat,
    "depAndAmortisation":depAndAmortisation,
    "onCashItems":otherNonCashItems.toFixed(2),
    "nca":changeInNCA.toFixed(2),
    "defferedTaxAssets":deferredTaxAssets,
    "netCashFlow":netCashFlow,
    "fixedAssets":changeInFixedAssets, 
    "fcff":fcff,
    "discountingPeriod":1,
    "discountingFactor":discountingFactor,
    "presentFCFF":presentFCFF,
    "sumOfCashFlows":sumOfCashFlows,
    "debtOnDate":debtAsOnDate,
    "cashEquivalents":cashEquivalents.toFixed(2),
    "surplusAssets":surplusAssets,
    "otherAdj":otherAdj,
    "equityValue": equityValue.toFixed(2),
    "noOfShares":outstandingShares,
    "valuePerShare":valuePerShare.toFixed(2)
      };
finalResult.push(result);
    }
})
  
  return {result:finalResult,msg:"FCFE Method Executed Successfully"};
  } 
  async FCFFMethod(inputs:any,worksheet1:any,worksheet2:any): Promise<any> {
    
    const firstYearCell = worksheet1["B1"];
    const firstYear=firstYearCell.v.split(",")[1];
    if(firstYear===undefined)
    return {result:null,msg:"Please Separate Text Label and year with comma in B1 Cell in P&L Sheet1."};
    
    const years=[];
    years.push(firstYear.trim().split('-')[1]);
    for(let i=1;i<9;i++){
      const yearCell = await worksheet1[`${columnsList[i]+1}`];
      if(yearCell===undefined)
           break;
      if(yearCell && yearCell!==undefined)
        years.push(yearCell.v.split('-')[1]);
    }
    const {projectionYear,outstandingShares,costOfDebt,costOfDebtValue,capitalStructure}=inputs;
    const finalResult=[];

    years.map(async (year,i)=>{
      if(parseInt(year)>=projectionYear){
      let changeInNCA=null;
      let deferredTaxAssets=null;
      //Get PAT value
    let pat= await GetPAT(i,worksheet1);
    if(pat!==null)
       pat=pat.toFixed(2);
    //Get Depn and Amortisation value
    let depAndAmortisation= await DepAndAmortisation(i,worksheet1);
    if(depAndAmortisation!==null)
       depAndAmortisation=depAndAmortisation.toFixed(2);
    
    //Get Oher Non Cash items Value
    const otherNonCashItems= await OtherNonCashItemsMethod(i,worksheet1);
    const changeInNCAValue=  await ChangeInNCA(i,worksheet2);
    changeInNCA=changeInNCA-changeInNCAValue;
    
    const deferredTaxAssetsValue=  await DeferredTaxAssets(i,worksheet2);
    deferredTaxAssets=deferredTaxAssets-deferredTaxAssetsValue;
    // Net Cash Flow
    const netCashFlow=parseInt(pat)||0+parseInt(depAndAmortisation)||0+parseInt(otherNonCashItems)||0+parseInt(changeInNCA)||0+parseInt(deferredTaxAssets)||0;
    const changeInFixedAssets=  await ChangeInFixedAssets(i,worksheet2);
    const fcff=netCashFlow+changeInFixedAssets;
        //Industry Calculation we needs to create new service for it.
    let costOfDebtValueNow=costOfDebtValue||null;
    if(costOfDebt==="Finance_Cost")
    costOfDebtValueNow=10;

    let capitalStructureValue=null;
    if(capitalStructure==="Company_Based")
    capitalStructureValue=1;
    else if(capitalStructure==="Industry_Based")
    capitalStructureValue=2;
    
    const discountingFactor=await this.industryService.getFCFFDisFactor(inputs,{
      "costOfDebt":costOfDebtValueNow,
      "capitalStructure":capitalStructureValue,
      "proportionOfDebt":1,
      "proportionOfEquity":1,
      "proportionOfPSC":1
      });
    const presentFCFF=discountingFactor*fcff;
    const sumOfCashFlows= presentFCFF ;
    const debtAsOnDate=  await GetDebtAsOnDate(i,worksheet2);
    const cashEquivalents=  await CashEquivalents(i,worksheet2);
    const surplusAssets=  await SurplusAssets(i,worksheet2);
    const otherAdj=100000;
    //formula: =+B16-B17+B18+B19+B20
    const equityValue=sumOfCashFlows-debtAsOnDate+cashEquivalents+surplusAssets+otherAdj;
    const valuePerShare=equityValue/outstandingShares;
      const result={
        "particulars":year,
        "pat":pat,
        "depAndAmortisation":depAndAmortisation,
        "onCashItems":otherNonCashItems.toFixed(2),
        "nca":changeInNCA.toFixed(2),
        "defferedTaxAssets":deferredTaxAssets,
        "netCashFlow":netCashFlow,
        "fixedAssets":changeInFixedAssets, 
        "fcff":fcff,
        "discountingPeriod":1,
        "discountingFactor":discountingFactor,
        "presentFCFF":presentFCFF,
        "sumOfCashFlows":sumOfCashFlows,
        "debtOnDate":debtAsOnDate,
        "cashEquivalents":cashEquivalents.toFixed(2),
        "surplusAssets":surplusAssets,
        "otherAdj":otherAdj,
        "equityValue": equityValue.toFixed(2),
        "noOfShares":outstandingShares,
        "valuePerShare":valuePerShare.toFixed(2)
          };
    finalResult.push(result);
        }
    })
      
      return {result:finalResult,msg:"FCFF Method Executed Successfully"};
      } 
}