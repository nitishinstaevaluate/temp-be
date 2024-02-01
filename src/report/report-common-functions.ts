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