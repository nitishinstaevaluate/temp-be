
import { sheet1_PLObj } from './excelSheetConfig';
import { OtherNonCashItemsMethod,ChangeInNCA,DeferredTaxAssets,
  ChangeInFixedAssets,GetDebtAsOnDate,CashEquivalents,SurplusAssets} from './calculation.method';

export async function FCFEMethod(inputs:any,worksheet1:any,worksheet2:any) {
const firstYearCell = worksheet1["B1"];
const firstYear=firstYearCell.v.split(",")[1];
const years=[];

years.push(firstYear.trim().split('-')[1]);
const columns=['C','D','E','F','G','H','I','J'];
for(let i=0;i<8;i++){
  const yearCell = await worksheet1[`${columns[i]+1}`];
  if(yearCell)
    years.push(yearCell.v.split('-')[1]);
}
const {projectionYear,outstandingShares}=inputs;
const finalResult=[];
const columnsList=['B','C','D','E','F','G','H','I','J'];
let changeInNCA=null;
let deferredTaxAssets=null;
console.log('Testing',projectionYear,years)
years.map(async (year,i)=>{
  console.log('Testing2: ',year)
//Get PAT value
const B42Cell = worksheet1[`${columnsList[i]+sheet1_PLObj.patRow}`];
if(!B42Cell)
return;
let pat=null;
if(B42Cell && B42Cell.t==='n')
 pat=B42Cell.v.toFixed(2);
//Get Depn and Amortisation value
const B26Cell = worksheet1[`${columnsList[i]+sheet1_PLObj.depAndAmortisationRow}`];
let depAndAmortisation=null;
if(B26Cell)
depAndAmortisation=B26Cell.v.toFixed(2);

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
const discountingFactor=2;

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
    "onCashItems":otherNonCashItems,
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
})
  
  return finalResult;
}

export function OtherMethod() {
  return "This is Other Method which we will add in Future.";
}
