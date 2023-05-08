import { columnsList } from '../excelFileServices/excelSheetConfig';
//Get Years List from Excel Sheet.
export async function getYearsList(worksheet1: any): Promise<any> {
  const firstYearCell = worksheet1['B1'];
  const firstYear = firstYearCell.v.split(',')[1];
  if (firstYear === undefined) return null;

  const years = [];
  years.push(firstYear.trim().split('-')[1]);
  for (let i = 1; i < 100; i++) {
    const yearCell = await worksheet1[`${columnsList[i] + 1}`];
    if (yearCell === undefined) break;
    if (yearCell && yearCell !== undefined)
      years.push(yearCell.v.split('-')[1]);
  }
  return years;
}
