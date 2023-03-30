
export function OtherNonCashItemsMethod(worksheet1:any,sheet1_PLObj:any){
    //formula:  =+(-'P&L'!B29+'P&L'!B31+'P&L'!B33)

    const otherIncomeCell = worksheet1[`${"B"+sheet1_PLObj.otherIncomeRow}`];
    let otherIncome=null;
    if(otherIncomeCell.t==='n')
      otherIncome=otherIncomeCell.v;

    const exceptionalItemsCell = worksheet1[`${"B"+sheet1_PLObj.exceptionalItemsRow}`];
    let exceptionalItems=null;
    if(exceptionalItemsCell.t==='n')
     exceptionalItems=exceptionalItemsCell.v;

    const extraordinaryItemsCell = worksheet1[`${"B"+sheet1_PLObj.extraordinaryItemsRow}`];
    let extraordinaryItems=null;
    if(extraordinaryItemsCell.t==='n')
    extraordinaryItems=extraordinaryItemsCell.v;

return otherIncome+exceptionalItems+extraordinaryItems;
}