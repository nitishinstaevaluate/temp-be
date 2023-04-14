import { sheet1_PLObj, sheet2_BSObj } from './excelSheetConfig';
import { columnsList } from './excelSheetConfig';
import * as XLSX from 'xlsx';
//worksheet1 is P&L sheet and worksheet2 is BS sheet.
//Common Method for geting Cell Value
export async function getCellValue(worksheet: any, address: string) {
  const Cell = worksheet[address];
  let value = null;
  if (Cell && Cell.t === 'n') value = Cell.v;
  return value;
}
export async function GetPAT(i: number, worksheet1: any) {
  //formula: =+'P&L'!B42
  const pat = await getCellValue(
    worksheet1,
    `${columnsList[i] + sheet1_PLObj.patRow}`,
  );
  return pat;
}

export async function DepAndAmortisation(i: number, worksheet1: any) {
  //formula: =+'P&L'!B26
  const depAndAmortisation = await getCellValue(
    worksheet1,
    `${columnsList[i] + sheet1_PLObj.depAndAmortisationRow}`,
  );
  return depAndAmortisation;
}
export async function OtherNonCashItemsMethod(i: number, worksheet1: any) {
  //formula:  =+(-'P&L'!B29+'P&L'!B31+'P&L'!B33)
  const otherIncome = await getCellValue(
    worksheet1,
    `${columnsList[i] + sheet1_PLObj.otherIncomeRow}`,
  );
  const exceptionalItems = await getCellValue(
    worksheet1,
    `${columnsList[i] + sheet1_PLObj.exceptionalItemsRow}`,
  );
  const extraordinaryItems = await getCellValue(
    worksheet1,
    `${columnsList[i] + sheet1_PLObj.extraordinaryItemsRow}`,
  );

  return otherIncome + exceptionalItems + extraordinaryItems;
}

export async function ChangeInNCA(i: number, worksheet2: any) {
  //formula: =+(SUM(_xlfn.SINGLE(BS!B64:B69)-BS!B68)-SUM(BS!B34:B40))-(SUM(_xlfn.SINGLE(BS!#REF!)-BS!#REF!)-SUM(BS!#REF!))

  const tradeReceivables = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.tradeReceivablesRow}`,
  );
  const unbilledRevenues = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.unbilledRevenuesRow}`,
  );
  const inventories = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.inventoriesRow}`,
  );
  const advances = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.advancesRow}`,
  );
  const otherCurrentAssets = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.otherCurrentAssetsRow}`,
  );

  // b variables
  const tradePayables = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.tradePayablesRow}`,
  );
  const employeePayables = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.employeePayablesRow}`,
  );
  const shortTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shortTermBorrowingsRow}`,
  );
  const lcPayablesRow = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.lcPayablesRow}`,
  );
  const otherCurrentLiabilities = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.otherCurrentLiabilitiesRow}`,
  );
  const shortTermProvisions = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shortTermProvisionsRow}`,
  );
  const interCo = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.interCoRow}`,
  );

  const sum1 =
    tradeReceivables +
    unbilledRevenues +
    inventories +
    advances +
    otherCurrentAssets;
  const sum2 =
    tradePayables +
    employeePayables +
    shortTermBorrowings +
    lcPayablesRow +
    otherCurrentLiabilities +
    shortTermProvisions +
    interCo;

  return sum1 - sum2;
}

export async function DeferredTaxAssets(i: number, worksheet2: any) {
  //formula: =+(BS!B59-BS!B25)-(BS!#REF!-BS!#REF!)
  const deferredTaxAssets = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.deferredTaxAssetsRow}`,
  );
  const deferredTaxLiability = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.deferredTaxLiabilityRow}`,
  );

  return deferredTaxAssets - deferredTaxLiability;
}

export async function ChangeInFixedAssets(i: number, worksheet2: any) {
  const fixedAssets = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.fixedAssetsRow}`,
  );
  return fixedAssets;
}

export async function GetDebtAsOnDate(i: number, worksheet2: any) {
  const longTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.longTermBorrowingsRow}`,
  );
  return longTermBorrowings;
}

export async function CashEquivalents(i: number, worksheet2: any) {
  //formula: =+BS!B62+BS!B63
  const cashEquivalents = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.cashEquivalentsRow}`,
  );
  const bankBalances = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.bankBalancesRow}`,
  );

  return cashEquivalents + bankBalances;
}

export async function SurplusAssets(i: number, worksheet2: any) {
  //formula: =+BS!B56+BS!B68
  const nonCurrentInvestment = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.nonCurrentInvestmentRow}`,
  );
  const shortTermInvestments = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shortTermInvestmentsRow}`,
  );

  return nonCurrentInvestment + shortTermInvestments;
}

//Industry Calculations Related Methods, all are under development
export async function CostOfDebt(i: number, worksheet1: any,worksheet2:any) {
  //formula:  User formula Finance costs /(Long term borrowing + short term borrowing) 
  // as: P&L!C28/(BS!D27 + BS!D36)

  const financeCosts = await getCellValue(
    worksheet1,
    `${columnsList[i] + sheet1_PLObj.financeCostsRow}`,
  );

  const longTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.longTermBorrowingsRow}`,
  );
  const shortTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shortTermBorrowingsRow}`,
  );
const result=financeCosts/(longTermBorrowings+shortTermBorrowings);

  return isNaN(result)?null:result;
}

export async function CapitalStructure(i: number, worksheet2: any) {
  //formula: if company based use: long term borrowing + short term / net worth (Other equity + eq + pref). 
  // As: (BS!D27 + BS!D36)/(BS!D6 note this formula is already a sum in sheet but 
  // user may chose to enter values hence calculate as BS!D7:D22 sum)
  const longTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.longTermBorrowingsRow}`,
  );
  const shortTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shortTermBorrowingsRow}`,
  );

//Calculate total sum for BS!D7:D22
const startCell = `${columnsList[i]}7`;
const endCell = `${columnsList[i]}22`;

const startCellRef = XLSX.utils.decode_cell(startCell);
const endCellRef = XLSX.utils.decode_cell(endCell);

let shareholderFunds = 0;
for(let row = startCellRef.r; row <= endCellRef.r; row++) {
  for(let col = startCellRef.c; col <= endCellRef.c; col++) {
    const cellRef = XLSX.utils.encode_cell({r: row, c: col});
    const cell = worksheet2[cellRef];
    if(cell && cell.t === 'n') {
      shareholderFunds += cell.v;
    }
  }
}
  return (longTermBorrowings+shortTermBorrowings)/shareholderFunds;
}

export async function ProportionOfDebt (i: number, worksheet2: any) {
  //formula: sum(BS!SUM(D25:D31) + SUM(D32:D40))/BS!D41

//Calculate total sum for BS!SUM(D25:D31)
const startCell = `${columnsList[i]}25`;
const endCell = `${columnsList[i]}31`;

const startCellRef = XLSX.utils.decode_cell(startCell);
const endCellRef = XLSX.utils.decode_cell(endCell);

let sum1 = 0;
for(let row = startCellRef.r; row <= endCellRef.r; row++) {
  for(let col = startCellRef.c; col <= endCellRef.c; col++) {
    const cellRef = XLSX.utils.encode_cell({r: row, c: col});
    const cell = worksheet2[cellRef];
    if(cell && cell.t === 'n') {
      sum1 += cell.v;
    }
  }
}

//Calculate total sum for BS!SUM(D32:D40)
const startCell2 = `${columnsList[i]}32`;
const endCell2 = `${columnsList[i]}40`;

const startCellRef2 = XLSX.utils.decode_cell(startCell2);
const endCellRef2 = XLSX.utils.decode_cell(endCell2);

let sum2 = 0;
for(let row = startCellRef2.r; row <= endCellRef2.r; row++) {
  for(let col = startCellRef2.c; col <= endCellRef2.c; col++) {
    const cellRef = XLSX.utils.encode_cell({r: row, c: col});
    const cell = worksheet2[cellRef];
    if(cell && cell.t === 'n') {
      sum2 += cell.v;
    }
  }
}
const total = await getCellValue(
  worksheet2,
  `${columnsList[i] + sheet2_BSObj.totalRow}`,
);
  return (sum1+sum2)/total;
}

export async function ProportionOfEquity(i: number, worksheet2: any) {
  //formula: sum(BS!D7:D22)/BS!D41
 //Calculate total sum for sum(BS!D7:D22)
const startCell = `${columnsList[i]}7`;
const endCell = `${columnsList[i]}22`;

const startCellRef = XLSX.utils.decode_cell(startCell);
const endCellRef = XLSX.utils.decode_cell(endCell);

let sum = 0;
for(let row = startCellRef.r; row <= endCellRef.r; row++) {
  for(let col = startCellRef.c; col <= endCellRef.c; col++) {
    const cellRef = XLSX.utils.encode_cell({r: row, c: col});
    const cell = worksheet2[cellRef];
    if(cell && cell.t === 'n') {
      sum += cell.v;
    }
  }
}
const total = await getCellValue(
  worksheet2,
  `${columnsList[i] + sheet2_BSObj.totalRow}`,
);
  return sum/total;
}

export async function POPShareCapital(i: number, worksheet2: any) {
  //formula: BS!D8/(BS!D7:BS!D22) or Ability to pick from BS!A8
  const nonCurrentInvestment = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.nonCurrentInvestmentRow}`,
  );
  const shortTermInvestments = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shortTermInvestmentsRow}`,
  );

  return 1;
}