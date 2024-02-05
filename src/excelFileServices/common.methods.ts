import { read } from 'fs';
import { columnsList } from './excelSheetConfig';
import { GET_DATE_MONTH_YEAR_FORMAT, GET_YEAR, MATCH_YEAR } from 'src/constants/constants';
const date = require('date-and-time');
export async function getCellValue(worksheet: any, address: string) {
  const Cell = worksheet[address];
  // console.log(Cell);
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
// only formats allowed (alphabets)2023/(alphabets)23/2023-2024/2023-24/2023/23 or 12-02-2023 / 12/02/2023 / 12.03.23 / 12.12.2023 / 03-12-23 / 12/12/23 -- implement function to valiadate the excel before processing
  try{
    const yearSet = [];
    let i=0;
    for (const key in worksheet1) {
      if (worksheet1.hasOwnProperty(key) && key !== '!ref' && typeof worksheet1[key]?.v === 'string' ) {
        const object = worksheet1[key];
        // console.log('First Object ', object.v);
        if(object.v && GET_DATE_MONTH_YEAR_FORMAT.test(object.v)){
          // console.log(object.v,"new date")
          yearSet.push(object.v.trim().slice(-2))
        }
        else if (object.v && GET_YEAR.test(object.v)) {
          if(object?.v?.includes('-')){
            // console.log("if condoitiosn",object?.v.split('-')[1])
            
            if(object?.v.split('-')[1].length <= 2){
              
              if (i===0){
                // console.log("I am in sector 3",object.v.trim());
                const baseDate = object.v.trim().slice(-2);
                yearSet.push(baseDate);
                i++;
              } else {
                yearSet.push(object?.v.split('-')[1]);
              }
            }
            else{
              const slicedYear = `${object?.v.split('-')[1][object?.v.split('-')[1].length - 2]}${object?.v.split('-')[1][object?.v.split('-')[1].length - 1]}`;
              yearSet.push(slicedYear);
              // console.log("year containing two numbers only splits -",slicedYear )
            }
          }
          else{
            // console.log('else condition')
            // console.log("if condoitios 3",object.v)
            const numbers = object.v.match(MATCH_YEAR).join('');
            if(numbers.length <= 2){
              yearSet.push(numbers);
              console.log("if sector NN",object.v)
            }
            else{
              // console.log("if condoitios - X ",object.v)
              const slicedYear = `${numbers[numbers.length - 2]}${numbers[numbers.length - 1]}`;
              // console.log(slicedYear);
              yearSet.push(slicedYear);
            }
          }
        }
      }

    }
    return yearSet;

  }
  catch(err){
    return{
      msg:'something went wrong',
      error:err.message,
      status:false
    }
  }

  // earlier used function
  // const firstYearCell = worksheet1['B1'];
  // const firstYear = firstYearCell.v.split(',')[1];
  // if (firstYear === undefined) return null;

  // const years = [];
  // years.push(firstYear.trim().split('-')[1]);
  // for (let i = 1; i < 100; i++) {
  //   const yearCell = await worksheet1[`${columnsList[i] + 1}`];
  //   if (yearCell === undefined) break;
  //   if (yearCell && yearCell !== undefined)
  //     years.push(yearCell.v.split('-')[1]);
  // }
  // return years;

  
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

export function latestFindAverage(type:any,company:any){
  const numbers = company.map((c: any) => {
    if (c.company !== 'Median') {
      return c[type];
    } else {
      return null; 
    }
  }).filter((value: any) => value !== null);
  const sum = numbers.reduce(
    (accumulator:any, currentValue:any) => accumulator + currentValue,
    0
  );
  const average = sum / numbers.length;
  return average
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
  if (discountingPeriod === 'Full_Period' || discountingPeriod === 'Full Period') discountingPeriodValue = 1;
  else if (discountingPeriod === 'Mid_Period' || discountingPeriod === 'Mid Period') discountingPeriodValue = 0.5;
  return {
    result: discountingPeriodValue,
    msg: 'Discounting period get Successfully.',
  };
}

export function searchDate(string) {
  // Create a regular expression to match a date.
  let dateRegex = /\d{2}-\d{2}-\d{4}/;

  // Search for the date in the string.
  let match = dateRegex.exec(string);

  // Return the date if it is found, or null otherwise.
  if (match) {
    return match[0];
  } else {
    return null;
  }
}
// export function isLeapYear(year: number) {
//   return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
// }

export function  parseDate(provisionalDates){
  const dateRegex = /^(0?[1-9]|1[0-9]|2[0-9]|3[01])[./\-](0?[1-9]|1[0-2])[./\-]\d{4}$/;

  if(provisionalDates){
    if(dateRegex.test(provisionalDates)){
      const [day, month, year] = provisionalDates.split(/[-./]/).map(Number);
      const parsedDate = new Date(year, month - 1, day);
      return parsedDate;
    }
  }
  return null;
}

export async function getFormattedProvisionalDate(provDate:Date) {
  const utcDate = provDate
  const istDate = new Date(utcDate.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000);
  
  const formattedDay = istDate.getDate().toString().padStart(2, '0');
  const formattedMonth = (istDate.getMonth() + 1).toString().padStart(2, '0');
  const formattedYear = istDate.getFullYear();

  const formattedProvisionalDate = `${formattedDay}-${formattedMonth}-${formattedYear}`;
  return formattedProvisionalDate;
}

export function convertToNumberOrZero(value: any): number {
  if (typeof value === 'string' || typeof value === 'number') {
    const num:any = Number(value);
    return isNaN(num) ? 0 : num;
  } else {
    return 0;
  }
}
export function convertToNumberOrOne(value: any): number {
  if (typeof value === 'string' || typeof value === 'number') {
    const num:any = Number(value);
    return isNaN(num) ? 0 : num;
  } else {
    return 1;
  }
}
export function formatDateHyphenToDDMMYYYY(inputDate: string): string {
    const date = new Date(inputDate);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

export function convertUnixTimestampToDateString(timestamp: number): string {
  const date = new Date(timestamp);
  
  const year = date.getUTCFullYear();
  const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
  const day = ('0' + (date.getUTCDate() + 1)).slice(-2);

  const formattedDate = `${year}-${month}-${day}T00:00:00.000Z`;

  return formattedDate;
}