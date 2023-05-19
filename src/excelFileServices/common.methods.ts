export async function getCellValue(worksheet: any, address: string) {
  const Cell = worksheet[address];
  let value = null;
  if (Cell && Cell.t === 'n') value = Cell.v;
  return value;
}


export function findMedian(numbers:number[]) {
    numbers.sort((a, b) => a - b);
    const middleIndex = Math.floor(numbers.length / 2);
    const isEvenLength = numbers.length % 2 === 0;
    if (isEvenLength) {
      return (numbers[middleIndex - 1] + numbers[middleIndex]) / 2;
    } else {
      return numbers[middleIndex];
    }
  }
  
 export function findAverage(numbers:number[]) {
    const sum = numbers.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );
    const average = sum / numbers.length;
    return average;
  }

  export function calculateDaysFromDate(dateString:string) {
    const date = new Date(dateString);
    const startDate = new Date(`${date.getFullYear()}-04-01`); // April 1st
    const endDate =date;
    const timeDiff = endDate.getTime() - startDate.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    
    return days;
  }