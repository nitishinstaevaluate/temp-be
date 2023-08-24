import { sheet1_PLObj, sheet2_BSObj } from './excelSheetConfig';
import { columnsList } from './excelSheetConfig';
import * as XLSX from 'xlsx';
import { getCellValue } from './common.methods';

//worksheet1 is P&L sheet and worksheet2 is BS sheet.

export async function GetPAT(i: number, worksheet1:any) {
  //formula: =+'P&L'!B42
  // console.log(worksheet1);
  const pat = await getCellValue(
    worksheet1,
    `${columnsList[i] + sheet1_PLObj.patRow}`,              
  );

  // console.log(`${columnsList[i] + sheet1_PLObj.changeInInventoryRow}`);
  // console.log(`${columnsList[i+1] + sheet1_PLObj.changeInInventoryRow}`);
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
  return exceptionalItems + extraordinaryItems - otherIncome;
}
export async function OtherNonCashItemsMethodNext(i: number, worksheet1: any) {
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
  return exceptionalItems + extraordinaryItems - otherIncome;
}

export async function ChangeInNCA(i: number, worksheet2: any) {
  //formula: =+(SUM(@BS!B64:B69-BS!B68)-SUM(BS!B34:B40))-(SUM(@BS!C64:C69-BS!C68)-SUM(BS!C34:C40))

  // Current Column
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

    const currentSum = sum1 - sum2;

    // For next year
    // Current Column
  const nextTradeReceivables = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.tradeReceivablesRow}`,
  );
  const nextUnbilledRevenues = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.unbilledRevenuesRow}`,
  );
  const nextInventories = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.inventoriesRow}`,
  );
  const nextAdvances = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.advancesRow}`,
  );
  const nextOtherCurrentAssets = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.otherCurrentAssetsRow}`,
  );

  // b variables
  const nextTradePayables = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.tradePayablesRow}`,
  );
  const nextEmployeePayables = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.employeePayablesRow}`,
  );
  const nextShortTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.shortTermBorrowingsRow}`,
  );
  const nextLcPayablesRow = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.lcPayablesRow}`,
  );
  const nextOtherCurrentLiabilities = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.otherCurrentLiabilitiesRow}`,
  );
  const nextShortTermProvisions = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.shortTermProvisionsRow}`,
  );
  const nextInterCo = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.interCoRow}`,
  );

  const nextSum1 = nextTradeReceivables + nextUnbilledRevenues + nextInventories + nextAdvances + nextOtherCurrentAssets
  const nextSum2 = nextTradePayables + nextEmployeePayables + nextShortTermBorrowings + nextLcPayablesRow + nextOtherCurrentLiabilities + nextShortTermProvisions + nextInterCo
  const nextSum = nextSum1 - nextSum2

  return currentSum - nextSum;
}

export async function DeferredTaxAssets(i: number, worksheet2: any) {
  //formula: =+(BS!B59-BS!B25)-(BS!C59-BS!C25)
  // console.log(worksheet2);
  // Get Current year first
  const currentDeferredTaxAssets = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.deferredTaxAssetsRow}`,
  );
  const currentDeferredTaxLiability = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.deferredTaxLiabilityRow}`,
  );
  // Get Next year data
  const nextDeferredTaxAssets = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.deferredTaxAssetsRow}`,
  );
  const nextDeferredTaxLiability = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.deferredTaxLiabilityRow}`,
  );
  // console.log('Deferred ' ,' ' , currentDeferredTaxAssets, ' ', currentDeferredTaxLiability ,' ' , nextDeferredTaxAssets, ' ', nextDeferredTaxLiability);
  return (currentDeferredTaxAssets - currentDeferredTaxLiability)-(nextDeferredTaxAssets - nextDeferredTaxLiability);
}

export async function ChangeInFixedAssets(i: number, worksheet2: any) {
  const tangibleAssets = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.tangibleAssetsRow}`,
  );
  const intangibleAssets = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.intangibleAssetsRow}`,
  );
  const capitalWorkInProgress = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.capitalWorkInProgressRow}`,
  );
  const preOperativeExpenses = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.preOperativeExpensesRow}`,
  );
  const capitalAdvances = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.capitalAdvancesRow}`,
  );
  const capitalLiabilities = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.capitalLiabilitiesRow}`,
  );

  const netFixedAsset = tangibleAssets + intangibleAssets + capitalWorkInProgress + preOperativeExpenses + capitalAdvances + capitalLiabilities
    // console.log('Net Fixed Asset - ', netFixedAsset );
  const nextTangibleAssets = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.tangibleAssetsRow}`,
  );
  const nextIntangibleAssets = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.intangibleAssetsRow}`,
  );
  const nextCapitalWorkInProgress = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.capitalWorkInProgressRow}`,
  );
  const nextPreOperativeExpenses = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.preOperativeExpensesRow}`,
  );
  const nextCapitalAdvances = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.capitalAdvancesRow}`,
  );
  const nextCapitalLiabilities = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.capitalLiabilitiesRow}`,
  );

  // const nextCapitalLiabilities = await getCellValue(
  //   worksheet2,
  //   `${columnsList[i] + sheet2_BSObj.capitalLiabilitiesRow}`,
  // );
  
  const nextNetFixedAsset = nextTangibleAssets + nextIntangibleAssets + nextCapitalWorkInProgress + 
  nextPreOperativeExpenses + nextCapitalAdvances + nextCapitalLiabilities
  // console.log('Net Next Fixed Asset - ', nextNetFixedAsset );
  return netFixedAsset - nextNetFixedAsset;
}

export async function GetDebtAsOnDate(i: number, worksheet2: any) {

  // =+BS!B26+BS!B27+BS!B36

  const otherUnsecuredLoans = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.otherUnsecuredLoansRow}`,
  );

  const longTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.longTermBorrowingsRow}`,
  );

  const shortTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shortTermBorrowingsRow}`,
  );
    // console.log ('deb as on date ', longTermBorrowings, ' ', shortTermBorrowings ,' ', otherUnsecuredLoans)
  return longTermBorrowings+shortTermBorrowings + otherUnsecuredLoans;
}

export async function fcfeTerminalValue(fcfe: number, terminalRate: number,adjCOE: number){
  // =F13*(1+Sheet2!C9)/(Sheet2!D22-Sheet2!C9)
  const fcfeAtTerminalRate = fcfe * (1+terminalRate/100)/(adjCOE/100-terminalRate/100)

  return fcfeAtTerminalRate;
}

export async function fcffTerminalValue(fcff: number, terminalRate: number,wacc: number){
  // =F13*(1+Sheet2!C9)/(Sheet2!C34-Sheet2!C9)
  const fcffAtTerminalRate = fcff * (1+terminalRate/100)/(wacc-terminalRate/100)
  // console.log('calc term ', fcff, ' ', terminalRate, ' ', wacc);
  // console.log('FCFF TER ', fcffAtTerminalRate);
  return fcffAtTerminalRate;
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

export async function interestAdjustedTaxes(i: number, worksheet1: any, taxRate: number) {
  // =+'P&L'!C28*(1-Sheet2!$D$7)
  const financeCost = await getCellValue(
    worksheet1,
    `${columnsList[i+1] + sheet1_PLObj.financeCostsRow}`,
  );

  const addInterestAdjustedTaxes = financeCost * (1 - taxRate/100);
  return addInterestAdjustedTaxes;

}

export async function interestAdjustedTaxesWithStubPeriod(i: number, worksheet1: any, taxRate: number) {
  // =+'P&L'!C28*(1-Sheet2!$D$7)
  let financeCost = await getCellValue(
    worksheet1,
    `${columnsList[i+1] + sheet1_PLObj.financeCostsRow}`,
  );

  let financeCostOld = await getCellValue(
    worksheet1,
    `${columnsList[i] + sheet1_PLObj.financeCostsRow}`,
  );

  financeCost = financeCost - financeCostOld;

  const addInterestAdjustedTaxes = financeCost * (1 - taxRate/100);
  return addInterestAdjustedTaxes;

}

export async function changeInBorrowings(i: number, worksheet2: any) {
  // =+BS!C26+BS!C36+BS!C27-BS!B26-BS!B27-BS!B36
  const nextOtherUnsecuredLoans = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.otherUnsecuredLoansRow}`,
  );

  const nextShortTermBorrowingsRow = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.shortTermBorrowingsRow}`,
  );

  const nextNetLongTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i+1] + sheet2_BSObj.longTermBorrowingsRow}`,
  );


  const otherUnsecuredLoans = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.otherUnsecuredLoansRow}`,
  );

  const shortTermBorrowingsRow = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shortTermBorrowingsRow}`,
  );

  const netLongTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.longTermBorrowingsRow}`,
  );

  return nextOtherUnsecuredLoans + nextShortTermBorrowingsRow + nextNetLongTermBorrowings - otherUnsecuredLoans - shortTermBorrowingsRow - netLongTermBorrowings
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
export async function CostOfDebt(i: number, worksheet1: any, worksheet2: any) {
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
  const result = financeCosts / (longTermBorrowings + shortTermBorrowings);

  return isNaN(result) ? null : result;
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
  for (let row = startCellRef.r; row <= endCellRef.r; row++) {
    for (let col = startCellRef.c; col <= endCellRef.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet2[cellRef];
      if (cell && cell.t === 'n') {
        shareholderFunds += cell.v;
      }
    }
  }
  return (longTermBorrowings + shortTermBorrowings) / shareholderFunds;
}

export async function CapitalStruc(i: number, worksheet2: any, shareHolderFunds: number) {
  //formula: if company based use: long term borrowing + short term / net worth (Other equity + eq + pref).
  // As: (BS!D27 + BS!D36)/(BS!D6 note this formula is already a sum in sheet but
  // user may chose to enter values hence calculate as BS!D7:D22 sum)

  // Total Equity = Shareholders' Funds - Preference Share Capital
  // Total Debt = Other Unsecured Loans + Long Term Borrowings + Liability component of CCD's + Short Term Borrowings
  // Total Preference Share Capital = Preference Share Capital
  
  // =+(BS!B27+BS!B26+BS!B36)/(BS!B6-BS!B8)
  // (longTermBorrowingsRow + otherUnsecuredLoans + shortTermBorrowingsRow ) / (shareholderFunds - preferenceShareCapital)

  // const shareholderFunds = await this.getShareholderFunds(i,worksheet2);

  const preferenceShareCapital = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.preferenceShareCapitalRow}`,
  );

  const otherUnsecuredLoans = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.otherUnsecuredLoansRow}`,
  );

  const liabilityComponentofCCD = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.liabilityComponentofCCDRow}`,
  );
  const longTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.longTermBorrowingsRow}`,
  );
  const shortTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shortTermBorrowingsRow}`,
  );
  
  const totalCapital = (longTermBorrowings + otherUnsecuredLoans + shortTermBorrowings ) / (shareHolderFunds - preferenceShareCapital);
  // const totalDebt = otherUnsecuredLoans + longTermBorrowings +liabilityComponentofCCD +shortTermBorrowings;

  // const totalCapital = totalEquity + preferenceShareCapital + totalDebt;
  const debtProp = totalCapital / (1 + totalCapital);
  const equityProp = 1 - debtProp;
  const prefProp = 1 - debtProp -equityProp;

  let capitalStructure = {
    capitalStructureType : 'Company_Based',
    debtProp : debtProp,
    equityProp : equityProp,
    prefProp: prefProp,
    totalCapital : totalCapital           // this is actual value and not a proporation.
  }

  console.log(capitalStructure);
  return capitalStructure;
}

export async function ProportionOfDebt(i: number, worksheet2: any) {
  //formula: sum(BS!SUM(D25:D31) + SUM(D32:D40))/BS!D41

  //Calculate total sum for BS!SUM(D25:D31)
  const startCell = `${columnsList[i]}25`;
  const endCell = `${columnsList[i]}31`;

  const startCellRef = XLSX.utils.decode_cell(startCell);
  const endCellRef = XLSX.utils.decode_cell(endCell);

  let sum1 = 0;
  for (let row = startCellRef.r; row <= endCellRef.r; row++) {
    for (let col = startCellRef.c; col <= endCellRef.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet2[cellRef];
      if (cell && cell.t === 'n') {
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
  for (let row = startCellRef2.r; row <= endCellRef2.r; row++) {
    for (let col = startCellRef2.c; col <= endCellRef2.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet2[cellRef];
      if (cell && cell.t === 'n') {
        sum2 += cell.v;
      }
    }
  }
  const total = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.totalRow}`,
  );
  return (sum1 + sum2) / total;
}

export async function ProportionOfEquity(i: number, worksheet2: any) {
  //formula: sum(BS!D7:D22)/BS!D41
  //Calculate total sum for sum(BS!D7:D22)
  const startCell = `${columnsList[i]}7`;
  const endCell = `${columnsList[i]}22`;

  const startCellRef = XLSX.utils.decode_cell(startCell);
  const endCellRef = XLSX.utils.decode_cell(endCell);

  let sum = 0;
  for (let row = startCellRef.r; row <= endCellRef.r; row++) {
    for (let col = startCellRef.c; col <= endCellRef.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet2[cellRef];
      if (cell && cell.t === 'n') {
        sum += cell.v;
      }
    }
  }
  const total = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.totalRow}`,
  );
  return sum / total;
}

export async function POPShareCapital(i: number, worksheet2: any) {
  //formula: BS!D8/Sum(BS!D7:BS!D22)
  const preferenceShareCapital = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.preferenceShareCapitalRow}`,
  );
  //Calculate total sum for sum(BS!D7:BS!D22)
  const startCell = `${columnsList[i]}7`;
  const endCell = `${columnsList[i]}22`;

  const startCellRef = XLSX.utils.decode_cell(startCell);
  const endCellRef = XLSX.utils.decode_cell(endCell);

  let sum = 0;
  for (let row = startCellRef.r; row <= endCellRef.r; row++) {
    for (let col = startCellRef.c; col <= endCellRef.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet2[cellRef];
      if (cell && cell.t === 'n') {
        sum += cell.v;
      }
    }
  }

  return preferenceShareCapital / sum;
}

export async function POPShareCapitalLabelPer(i: number, worksheet2: any) {
  //formula: Ability to pick from BS!A8
  const Cell = worksheet2['A8'];
  let preferenceShareCapitalPer = null;
  if (Cell && Cell.t === 's') preferenceShareCapitalPer = parseInt(Cell.v);

  return isNaN(preferenceShareCapitalPer) ? null : preferenceShareCapitalPer;
}

export async function getWACCInputValues(i:number, worksheet2: any){

  const reserverAndSurplus = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.reserveAndSurplusRow}`,
  );

  const preferenceShareCapital = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.preferenceShareCapitalRow}`,
  );

  const equityCap = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.equityShareCapitalRow}`,
  );


  const longTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.longTermBorrowingsRow}`,
  );

  const shortTermBorrowings = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shortTermBorrowingsRow}`,
  );

    let waccCalInputs = {
      equityCapital: equityCap,
      preferenceShareCapital: preferenceShareCapital,
      longTermBorrowings: longTermBorrowings,
      shortTermBorrowings: shortTermBorrowings
    }

    return waccCalInputs;
}


export async function getShareholderFunds(i:number, worksheet2: any){
  const equityShareCapital = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.equityShareCapitalRow}`,
  );

  const preferenceShareCapital = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.preferenceShareCapitalRow}`,
  );

  const otherEquity = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.otherEquityRow}`,
  );

  const sharePremium = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.sharePremiumRow}`,
  );

  const reserveAndSurplus = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.reserveAndSurplusRow}`,
  );

  const revaluationReserve = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.revaluationReserveRow}`,
  );

  const capitalReserve = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.capitalReserveRow}`,
  );

  const capitalRedemptionReserve = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.capitalRedemptionReserveRow}`,
  );

  const debentureRedemptionReserve = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.debentureRedemptionReserveRow}`,
  );

  const shareBasedPaymentReserve = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shareBasedPaymentReserveRow}`,
  );

  const definedBenefitObligationReserve = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.definedBenefitObligationReserveRow}`,
  );

  const otherComprehensiveIncome = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.otherComprehensiveIncomeRow}`,
  );

  const nonControllingInterest = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.nonControllingInterestRow}`,
  );

  const shareWarrants = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shareWarrantsRow}`,
  );

  const shareApplication = await getCellValue(
    worksheet2,
    `${columnsList[i] + sheet2_BSObj.shareApplicationRow}`,
  );

  const shareHolderFunds = equityShareCapital + preferenceShareCapital + otherEquity +sharePremium + reserveAndSurplus +
          revaluationReserve + capitalReserve +capitalRedemptionReserve + debentureRedemptionReserve +shareBasedPaymentReserve +
          definedBenefitObligationReserve +
          otherComprehensiveIncome + shareWarrants + nonControllingInterest + 
          shareApplication;



  return shareHolderFunds;

}
