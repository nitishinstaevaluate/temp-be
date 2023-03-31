
import { sheet1_PLObj } from './excelSheetConfig';
import { OtherNonCashItemsMethod } from './calculation.method';

export async function FCFEMethod(inputs:any,worksheet1:any) {
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
console.log('Testing',years)
const {projectionYear}=inputs;
//Get PAT value
const B42Cell = worksheet1[`${"B"+sheet1_PLObj.patRow}`];
const pat=B42Cell.v;

//Get Depn and Amortisation value
const B26Cell = worksheet1[`${"B"+sheet1_PLObj.depAndAmortisationRow}`];
const depAndAmortisation=B26Cell.v;

//Get Oher Non Cash items Value
const otherNonCashItems=OtherNonCashItemsMethod(worksheet1,sheet1_PLObj);
const finalResult=[];

years.map((year)=>{
  const result={
    "particulars":projectionYear,
    "pat":pat,
    "depAndAmortisation":depAndAmortisation,
    "onCashItems":otherNonCashItems,
    "nca":88797,
    "defferedTaxAssets":87979,
    "netCashFlow":7779,
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
  console.log(year)
  result.particulars=year;
finalResult.push(result);
})
  
  return finalResult;
}

export function OtherMethod() {
  return "This is Other Method which we will add in Future.";
}
