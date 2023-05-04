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

export async function netWorthOfCompany(column, worksheet2: any) {
  //formula: =+BS!D7+SUM(BS!D9:D19)
  const equityShareCapital = await getCellValue(
    worksheet2,
    `${column + sheet2_BSObj.equityShareCapitalRow}`,
  );
  //Calculate total sum for SUM(BS!D9:D19)
  const startCell = `${column}9`;
  const endCell = `${column}19`;

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

  return equityShareCapital + sum;
}

export async function earningPerShare(column, worksheet1: any) {
  //formula: P&L'!C58
  const earningPerShare = await getCellValue(
    worksheet1,
    `${column + sheet1_PLObj.earningPerShareRow}`,
  );
  return earningPerShare;
}
