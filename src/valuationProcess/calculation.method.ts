import { sheet1_PLObj,sheet2_BSObj } from './excelSheetConfig';
export function OtherNonCashItemsMethod(i:number,worksheet1:any){
    //formula:  =+(-'P&L'!B29+'P&L'!B31+'P&L'!B33)
    const columnsList=['B','C','D','E','F','G','H','I','J'];
    const otherIncomeCell = worksheet1[`${columnsList[i]+sheet1_PLObj.otherIncomeRow}`];

    let otherIncome=null;
    if(otherIncomeCell&&otherIncomeCell.t==='n')
      otherIncome=otherIncomeCell.v;

    const exceptionalItemsCell = worksheet1[`${columnsList[i]+sheet1_PLObj.exceptionalItemsRow}`];
    let exceptionalItems=null;
    if(exceptionalItemsCell&&exceptionalItemsCell.t==='n')
     exceptionalItems=exceptionalItemsCell.v;

    const extraordinaryItemsCell = worksheet1[`${columnsList[i]+sheet1_PLObj.extraordinaryItemsRow}`];
    let extraordinaryItems=null;
    if(extraordinaryItemsCell&&extraordinaryItemsCell.t==='n')
    extraordinaryItems=extraordinaryItemsCell.v;

return (otherIncome+exceptionalItems+extraordinaryItems).toFixed(2);
}

export async function ChangeInNCA(i:number,worksheet1:any){
  //formula: =+(SUM(_xlfn.SINGLE(BS!B64:B69)-BS!B68)-SUM(BS!B34:B40))-(SUM(_xlfn.SINGLE(BS!#REF!)-BS!#REF!)-SUM(BS!#REF!))
  const columnsList=['B','C','D','E','F','G','H','I','J'];
  const tradeReceivablesCell = worksheet1[`${columnsList[i]+sheet2_BSObj.tradeReceivablesRow}`];

  let tradeReceivables=null;
  if(tradeReceivablesCell&&tradeReceivablesCell.t==='n')
  tradeReceivables=tradeReceivablesCell.v;

  const unbilledRevenuesCell = worksheet1[`${columnsList[i]+sheet2_BSObj.unbilledRevenuesRow}`];
  let unbilledRevenues=null;
  if(unbilledRevenuesCell&&unbilledRevenuesCell.t==='n')
  unbilledRevenues=unbilledRevenuesCell.v;

  const inventoriesCell = worksheet1[`${columnsList[i]+sheet2_BSObj.inventoriesRow}`];
  let inventories=null;
  if(inventoriesCell&&inventoriesCell.t==='n')
  inventories=inventoriesCell.v;

  const advancesCell = worksheet1[`${columnsList[i]+sheet2_BSObj.advancesRow}`];
  let advances=null;
  if(advancesCell&&advancesCell.t==='n')
  advances=advancesCell.v;

  const otherCurrentAssetsCell = worksheet1[`${columnsList[i]+sheet2_BSObj.otherCurrentAssetsRow}`];
  let otherCurrentAssets=null;
  if(otherCurrentAssetsCell&&otherCurrentAssetsCell.t==='n')
  otherCurrentAssets=otherCurrentAssetsCell.v;
// b variables
  const tradePayablesCell = worksheet1[`${columnsList[i]+sheet2_BSObj.tradePayablesRow}`];
  let tradePayables=null;
  if(tradePayablesCell&&tradePayablesCell.t==='n')
  tradePayables=tradePayablesCell.v;


  const employeePayablesCell = worksheet1[`${columnsList[i]+sheet2_BSObj.employeePayablesRow}`];
  let employeePayables=null;
  if(employeePayablesCell&&employeePayablesCell.t==='n')
  employeePayables=employeePayablesCell.v;

  const shortTermBorrowingsCell = worksheet1[`${columnsList[i]+sheet2_BSObj.shortTermBorrowingsRow}`];
  let shortTermBorrowings=null;
  if(shortTermBorrowingsCell&&shortTermBorrowingsCell.t==='n')
  shortTermBorrowings=shortTermBorrowingsCell.v;

  const lcPayablesRowCell = worksheet1[`${columnsList[i]+sheet2_BSObj.lcPayablesRow}`];
  let lcPayablesRow=null;
  if(lcPayablesRowCell&&lcPayablesRowCell.t==='n')
  lcPayablesRow=lcPayablesRowCell.v;

  const otherCurrentLiabilitiesCell = worksheet1[`${columnsList[i]+sheet2_BSObj.otherCurrentLiabilitiesRow}`];
  let  otherCurrentLiabilities=null;
  if(otherCurrentLiabilitiesCell&&otherCurrentLiabilitiesCell.t==='n')
  otherCurrentLiabilities=otherCurrentLiabilitiesCell.v;

  const shortTermProvisionsCell = worksheet1[`${columnsList[i]+sheet2_BSObj.shortTermProvisionsRow}`];
  let shortTermProvisions=null;
  if(shortTermProvisionsCell&&shortTermProvisionsCell.t==='n')
  shortTermProvisions=shortTermProvisionsCell.v;

  const interCoCell = worksheet1[`${columnsList[i]+sheet2_BSObj.interCoRow}`];
  let interCo=null;
  if(interCoCell&&interCoCell.t==='n')
  interCo=interCoCell.v;

const sum1=tradeReceivables+unbilledRevenues+inventories+advances+otherCurrentAssets;
const sum2=tradePayables+employeePayables+shortTermBorrowings+lcPayablesRow+otherCurrentLiabilities+shortTermProvisions+interCo;
return sum1-sum2;
}

export async function DeferredTaxAssets(i:number,worksheet1:any){
  //formula: =+(BS!B59-BS!B25)-(BS!#REF!-BS!#REF!)
  const columnsList=['B','C','D','E','F','G','H','I','J'];

  const deferredTaxAssetsCell = worksheet1[`${columnsList[i]+sheet2_BSObj.deferredTaxAssetsRow}`];
  let deferredTaxAssets=null;
  if(deferredTaxAssetsCell&&deferredTaxAssetsCell.t==='n')
  deferredTaxAssets=deferredTaxAssetsCell.v;

  const deferredTaxLiabilityCell = worksheet1[`${columnsList[i]+sheet2_BSObj.deferredTaxLiabilityRow}`];
  let deferredTaxLiability=null;
  if(deferredTaxLiabilityCell&&deferredTaxLiabilityCell.t==='n')
  deferredTaxLiability=deferredTaxLiabilityCell.v;
console.log('Testing 1',deferredTaxAssets,deferredTaxLiability)
return deferredTaxAssets-deferredTaxLiability;
}