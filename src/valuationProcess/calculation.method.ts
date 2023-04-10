import { sheet1_PLObj,sheet2_BSObj } from './excelSheetConfig';
import { columnsList } from './excelSheetConfig';
//worksheet1 is P&L sheet and worksheet2 is BS sheet.
//Common Method for geting Cell Value
export async function getCellValue(worksheet:any,address:string){
  const Cell = worksheet[address];
  let value=null;
  if(Cell&&Cell.t==='n')
  value=Cell.v;

  return value;
}
export async function GetPAT(i:number,worksheet1:any){
  //formula: =+'P&L'!B42
  const pat= await getCellValue(worksheet1,`${columnsList[i]+sheet1_PLObj.patRow}`);
  return pat;
}

export async function DepAndAmortisation(i:number,worksheet1:any){
  //formula: =+'P&L'!B26
  const depAndAmortisation= await getCellValue(worksheet1,`${columnsList[i]+sheet1_PLObj.depAndAmortisationRow}`);
  return depAndAmortisation;
}
export async function OtherNonCashItemsMethod(i:number,worksheet1:any){
    //formula:  =+(-'P&L'!B29+'P&L'!B31+'P&L'!B33)
    const otherIncome= await getCellValue(worksheet1,`${columnsList[i]+sheet1_PLObj.otherIncomeRow}`);
    const exceptionalItems= await getCellValue(worksheet1,`${columnsList[i]+sheet1_PLObj.exceptionalItemsRow}`);
    const extraordinaryItems=await getCellValue(worksheet1,`${columnsList[i]+sheet1_PLObj.extraordinaryItemsRow}`);

return otherIncome+exceptionalItems+extraordinaryItems;
}

export async function ChangeInNCA(i:number,worksheet2:any){
  //formula: =+(SUM(_xlfn.SINGLE(BS!B64:B69)-BS!B68)-SUM(BS!B34:B40))-(SUM(_xlfn.SINGLE(BS!#REF!)-BS!#REF!)-SUM(BS!#REF!))

  const tradeReceivables=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.tradeReceivablesRow}`);
  const unbilledRevenues=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.unbilledRevenuesRow}`);
  const inventories=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.inventoriesRow}`);
  const advances=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.advancesRow}`);
  const otherCurrentAssets=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.otherCurrentAssetsRow}`);

// b variables
  const tradePayables=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.tradePayablesRow}`);
  const employeePayables=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.employeePayablesRow}`);
  const shortTermBorrowings=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.shortTermBorrowingsRow}`);
  const lcPayablesRow=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.lcPayablesRow}`);
  const otherCurrentLiabilities=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.otherCurrentLiabilitiesRow}`);
  const shortTermProvisions=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.shortTermProvisionsRow}`);
  const interCo=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.interCoRow}`);

const sum1=tradeReceivables+unbilledRevenues+inventories+advances+otherCurrentAssets;
const sum2=tradePayables+employeePayables+shortTermBorrowings+lcPayablesRow+otherCurrentLiabilities+shortTermProvisions+interCo;

return sum1-sum2;
}

export async function DeferredTaxAssets(i:number,worksheet2:any){
  //formula: =+(BS!B59-BS!B25)-(BS!#REF!-BS!#REF!)
  const deferredTaxAssets=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.deferredTaxAssetsRow}`);
  const deferredTaxLiability=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.deferredTaxLiabilityRow}`);
  
return deferredTaxAssets-deferredTaxLiability;
}

export async function ChangeInFixedAssets(i:number,worksheet2:any){
  const fixedAssets=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.fixedAssetsRow}`);
  return fixedAssets;
}

export async function GetDebtAsOnDate(i:number,worksheet2:any){
  const debtAsOnDate= await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.debtAsOnDateRow}`);
  return debtAsOnDate;
}

export async function CashEquivalents(i:number,worksheet2:any){
  //formula: =+BS!B62+BS!B63
  const cashEquivalents=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.cashEquivalentsRow}`);
  const bankBalances=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.bankBalancesRow}`);
  
return cashEquivalents+bankBalances;
}

export async function SurplusAssets(i:number,worksheet2:any){
  //formula: =+BS!B56+BS!B68
  const nonCurrentInvestment=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.nonCurrentInvestmentRow}`);
  const shortTermInvestments=await getCellValue(worksheet2,`${columnsList[i]+sheet2_BSObj.shortTermInvestmentsRow}`);
  
return nonCurrentInvestment+shortTermInvestments;
}

