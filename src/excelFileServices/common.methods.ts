import { read } from 'fs';
import { columnsList } from './excelSheetConfig';
const date = require('date-and-time');
export async function getCellValue(worksheet: any, address: string) {
  const Cell = worksheet[address];
  let value = null;
  if (Cell && Cell.t === 'n') {
    value = Cell.v;
  }
  //  && Cell.v >= 0) {
  //   value = parseFloat(Cell.w);                       // Logic put in place to handle wrong read from excel file
  // } else if (Cell && Cell.v < 0 ){
  //   value  = parseFloat('-' + Cell.w.replace(/[&\/\\#,+()$~%'" :*?<>{}]/g, ''));        // Handling negative values
  // } else {
  //   value = 0;                                        // Note blank and null needs to be differentiated
  // }

  return isNaN(value) ? 0 : value;
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

export async function calculateDaysFromDate(dateString: Date) {
  // const vdate = new Date(dateString);
  let totalDays = 0;
  const valuationDate = date.addDays(dateString,1)        // Adding a day due to UTC adjustment
  // console.log('Year is ', `${date.getFullYear()}`);
  // const valuationMonth = valuationDate.getMonth();
  const startDate = valuationDate.getMonth() <= 3 ? new Date(`${valuationDate.getFullYear()-1},4,1`):new Date(`${valuationDate.getFullYear()+1},4,1`); // April 1st is considered as financial year
  // new Date(`${valuationDate.getFullYear()+1}-04-01`)
  console.log('Start Date ', startDate);
  const endDate = valuationDate
  console.log('End Date ',endDate);

  const daysRemaining = startDate > endDate ? date.subtract(startDate,endDate).toDays():date.subtract(endDate,startDate).toDays(); 

  console.log("Days Left calc using date-time ",daysRemaining)

  // const diffInDays = datediff(startDate, endDate);
  // console.log('Date Difference ',diffInDays);
  const timeDiff = endDate.getTime() - startDate.getTime();
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  // const totalDays = date.isLeapYear(valuationDate.getFullYear()) ? 366 : 365;
  if (valuationDate.getMonth() <=3 ){
    totalDays = date.isLeapYear(endDate.getFullYear()) ? 366 :365;
  } else {
    totalDays = date.isLeapYear(startDate.getFullYear()) ? 366 :365;
  }


  // if (days <= 0) {
  //   const diff = totalDays - -days;
  //   if (diff === 0)
  //     return totalDays;
  //   else
  //     return diff;
  // }
  let daysParam = {
    dateDiff : daysRemaining,
    totalDays : totalDays,
    isLeapYear : date.isLeapYear(startDate.getFullYear())
  }
  return daysParam;
}

export function getDiscountingPeriod(discountingPeriod: string) {
  let discountingPeriodValue = 0;
  if (discountingPeriod === 'Full_Period') discountingPeriodValue = 1;
  else if (discountingPeriod === 'Mid_Period') discountingPeriodValue = 0.5;
  return {
    result: discountingPeriodValue,
    msg: 'Discounting period get Successfully.',
  };
}

// export function isLeapYear(year: number) {
//   return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
// }

