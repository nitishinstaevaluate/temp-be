import { read } from 'fs';
import { columnsList } from './excelSheetConfig';
export async function getCellValue(worksheet: any, address: string) {
  const Cell = worksheet[address];
  let value = null;
  if (Cell && Cell.t === 'n' && Cell.v >= 0) {
    value = parseFloat(Cell.w);                       // This should be w
  } else if (Cell && Cell.v < 0 ){
    value  = parseFloat('-' + Cell.w.replace(/[&\/\\#,+()$~%'" :*?<>{}]/g, ''));        // Handling negative values
  } else {
    value = 0;                                        // Note blank and null needs to be differentiated
  }
  
  // Sample Excel read  B36: { t: 'n', v: 169.30473479520026, f: '+B34*0.3', w: ' 11.60 ' },
  // C36: { t: 'n', v: 18.08294494499998, f: '+C34*0.3', w: ' 18.08 ' },
  // D36: { t: 'n', v: 24.501518408249996, f: '+D34*0.3', w: ' 24.50 ' },
  // E36: { t: 'n', v: 31.750118176012457, f: '+E34*0.3', w: ' 31.75 ' },
  // F36: { t: 'n', v: 52.27504573151061, f: '+F34*0.3', w: ' 52.28 ' },
  // G36: { t: 'n', v: 91.35138368187401, f: '+G34*0.3', w: ' 91.35 ' },
  // A37: {
  //   t: 's',
  //   v: '(b) (Less): MAT credit (where applicable)',
  //   r: '<t>(b) (Less): MAT credit (where applicable)</t>',
  //   h: '(b) (Less): MAT credit (where applicable)',
  //   w: '(b) (Less): MAT credit (where applicable)'
  // },
  // B37: { t: 'n', v: 0, w: ' -   ' },
  // C37: { t: 'n', v: 0, w: ' -   ' },
  // D37: { t: 'n', v: 0, w: ' -   ' },
  // E37: { t: 'n', v: 0, w: ' -   ' },
  // F37: { t: 'n', v: 0, w: ' -   ' },
  // G37: { t: 'n', v: 0, w: ' -   ' },
  // A38: {
  //   t: 's',
  //   v: '(c) Current tax expense relating to prior years',
  //   r: '<t>(c) Current tax expense relating to prior years</t>',
  //   h: '(c) Current tax expense relating to prior years',
  //   w: '(c) Current tax expense relating to prior years'
  // },

  // More Sample
// },
// C15: { t: 'n', v: -18.174887, f: '-(121-102.825113)', w: ' (18.17)' },
// D15: { t: 'n', v: -30, f: '-(151-121)', w: ' (30.00)' },
// E15: { t: 'n', v: -30, f: '-(181-151)', w: ' (30.00)' },
// F15: { t: 'n', v: -36, f: '-(217-181)', w: ' (36.00)' },
// G15: { t: 'n', v: -33, f: '-(250-217)', w: ' (33.00)' },
// A16: {
//   t: 's',
//   v: 'Employee Benefit Expenses',
//   r: '<t>Employee Benefit Expenses</t>',
//   h: 'Employee Benefit Expenses',
//   w: 'Employee Benefit Expenses'
// },
// B16: { t: 'n', v: 377.68621740000003, w: ' 25.87 ' },
// C16: { t: 'n', v: 28.455810900000003, w: ' 28.46 ' },
// D16: { t: 'n', v: 31.301391990000006, w: ' 31.30 ' },
// E16: { t: 'n', v: 34.43153118900001, w: ' 34.43 ' },
// F16: { t: 'n', v: 37.87468430790002, w: ' 37.87 ' },
// G16: { t: 'n', v: 41.662152738690025, w: ' 41.66 ' },
// A17: {
//   t: 's',
//   v: 'Power & Fuel',
//   r: '<t>Power &amp; Fuel</t>',
//   h: 'Power &amp; Fuel',
//   w: 'Power & Fuel'
// },
// B17: { t: 'n', v: 7.8348418, w: ' 0.54 ' },
// C17: { t: 'n', v: 0.5902963000000001, w: ' 0.59 ' },
// D17: { t: 'n', v: 0.6493259300000002, w: ' 0.65 ' },
// E17: { t: 'n', v: 0.7142585230000003, w: ' 0.71 ' },
// F17: { t: 'n', v: 0.7856843753000003, w: ' 0.79 ' },
// G17: { t: 'n', v: 0.8642528128300004, w: ' 0.86 ' },

  return isNaN(value)? 0: value ;
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
  const startDate = new Date(`${date.getFullYear()}-04-01`); // April 1st is considered as financial year
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
