import { getYearsList } from 'src/excelFileServices/common.methods';

export function  formatDate(date: Date): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }

  export function formatPositiveAndNegativeValues(value) {
    const epsilonThreshold = 0.00001;
  
    if (value !== undefined && value !== null && value !== '' &&  Math.abs(value) < epsilonThreshold) {
      return '-';
    }
  
    let formattedValue = '';
  
    if (value !== null && value !== undefined && value !== '') {
      formattedValue = Math.abs(value) < 0.005 ? '0.00' : `${Math.abs(value).toFixed(2)}`;
      formattedValue = Number(formattedValue).toLocaleString('en-IN');
    }
  
    return value < 0 ? `(${formattedValue})` : formattedValue;
  }

  export function convertEpochToPlusOneDate(date): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    date.setDate(date.getDate() + 1);

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  }

  export async function transformData(data: any[]) { //only for data table showcase on ui
    try{
    let maxKeys = Object.keys(data[0]).length;
    let maxKeysObject = data[0];

    for (let i = 1; i < data.length; i++) {
      const numKeys = Object.keys(data[i]).length;
      if (numKeys > maxKeys) {
        maxKeys = numKeys;
        maxKeysObject = data[i];
      }
    }
    const atLeastOneArray = data.some(item => Array.isArray(item));
    const keysArray = Object.keys(maxKeysObject);
    data.forEach(obj => {
      keysArray.forEach(key => {
        if (!(key in obj)) {
          obj[key] = null;
        }
      });
    });
    let splicedEle;
    keysArray.map((value:any,index:number)=>{
      if(value === 'Particulars'){
        splicedEle = keysArray.splice(index,1);
      }
    })
    if(!atLeastOneArray){
      keysArray.unshift(splicedEle[0])
    }
    data.unshift(keysArray)
    return data;
  }
    catch(error){
      console.log(error);
      throw error;
    }
  
  }

  export async function computedTotalYears(worksheet){
    try{
      const excelWorkSheet = worksheet.Sheets['P&L'] || worksheet.Sheets['BS'];

      const yearList:any = await getYearsList(excelWorkSheet);

      let totalYearList = [];
      yearList.forEach((indYear, index) => {
        if(index !== yearList.length - 1){
          totalYearList.push(`20${indYear}-20${yearList[index+1]}`);
        }
      });

      return {
        startYear: totalYearList[0],
        endYear: totalYearList[totalYearList.length-1] || totalYearList[0]
      }
    }
    catch(error){
      console.log(error,"error")
      return{
        error:error,
        status:false,
        msg:"Financial and projection years"
      }
    }
  }

  export function convertToRomanNumeral(num:any) {
    const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
  
    if (num === undefined || num === null || num > romanNumerals.length) {
      return '';
    }
  
    return romanNumerals[num];
  }