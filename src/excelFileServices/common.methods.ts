import { columnsList } from './excelSheetConfig';
export async function getCellValue(worksheet: any, address: string) {
  const Cell = worksheet[address];
  let value = null;
  if (Cell && Cell.t === 'n') value = Cell.v;
  return value;
}
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
export function findMedian(numbers: number[]) {
  numbers.sort((a, b) => a - b);
  const middleIndex = Math.floor(numbers.length / 2);
  const isEvenLength = numbers.length % 2 === 0;
  if (isEvenLength) {
    return (numbers[middleIndex - 1] + numbers[middleIndex]) / 2;
  } else {
    return numbers[middleIndex];
  }
}

export function findAverage(numbers: number[]) {
  const sum = numbers.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
  const average = sum / numbers.length;
  return average;
}

export function calculateDaysFromDate(dateString: string) {
  const date = new Date(dateString);
  const startDate = new Date(`${date.getFullYear()}-04-01`); // April 1st
  const endDate = date;
  const timeDiff = endDate.getTime() - startDate.getTime();
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  const totalDays = isLeapYear(date.getFullYear()) ? 366 : 365;
  if (days <= 0){
    const diff=totalDays - -days;
  if(diff===0)
  return totalDays;
  else
  return diff;
  } 
  return days;
}

export function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
