
export function OtherNonCashItemsMethod(i:number,worksheet1:any,sheet1_PLObj:any){
    //formula:  =+(-'P&L'!B29+'P&L'!B31+'P&L'!B33)
    const columnsList=['B','C','D','E','F','G','H','I','J'];
    const otherIncomeCell = worksheet1[`${columnsList[i]+sheet1_PLObj.otherIncomeRow}`];

    let otherIncome=null;
    if(otherIncomeCell&&otherIncomeCell.t==='n')
      otherIncome=otherIncomeCell.v;

    const exceptionalItemsCell = worksheet1[`${columnsList[i]+sheet1_PLObj.exceptionalItemsRow}`];
    let exceptionalItems=null;
    if(exceptionalItemsCell&&exceptionalItemsCell.t==='n')
     exceptionalItems=exceptionalItemsCell.v;

    const extraordinaryItemsCell = worksheet1[`${columnsList[i]+sheet1_PLObj.extraordinaryItemsRow}`];
    let extraordinaryItems=null;
    if(extraordinaryItemsCell&&extraordinaryItemsCell.t==='n')
    extraordinaryItems=extraordinaryItemsCell.v;

return (otherIncome+exceptionalItems+extraordinaryItems).toFixed(2);
}