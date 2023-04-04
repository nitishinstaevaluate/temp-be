
import { sheet1_PLObj } from './excelSheetConfig';
import { OtherNonCashItemsMethod,ChangeInNCA,DeferredTaxAssets } from './calculation.method';

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
const {projectionYear}=inputs;
const finalResult=[];
const columnsList=['B','C','D','E','F','G','H','I','J'];
let changeInNCA=null;
years.map(async (year,i)=>{
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
const otherNonCashItems=OtherNonCashItemsMethod(i,worksheet1);
const changeInNCAValue=  await ChangeInNCA(i,worksheet2);
changeInNCA=changeInNCA-changeInNCAValue;
const deferredTaxAssets=  await DeferredTaxAssets(i,worksheet2);

// Net Cash Flow
const netCashFlow=parseInt(pat)||0+parseInt(depAndAmortisation)||0+parseInt(otherNonCashItems)||0+parseInt(changeInNCA)||0+deferredTaxAssets||0;

  const result={
    "particulars":projectionYear,
    "pat":pat,
    "depAndAmortisation":depAndAmortisation,
    "onCashItems":otherNonCashItems,
    "nca":changeInNCA.toFixed(2),
    "defferedTaxAssets":deferredTaxAssets,
    "netCashFlow":netCashFlow,
    "fixedAssets":877879, 
    "fcff":87898797,
    "discountingPeriod":7667,
    "discountingFactor":9887,
    "presentFCFF":7898,
    "sumOfCashFlows":9789798,
    "debtOnDate":87979,
    "ccEquivalents":787987,
    "surplusAssets":89890,
    "otherAdj":78979,
    "equityValue": 667676,
    "noOfShares":898789,
    "valuePerShare":4534.34
      };
  result.particulars=year;
finalResult.push(result);
})
  
  return finalResult;
}

export function OtherMethod() {
  return "This is Other Method which we will add in Future.";
}
