import { convertToNumberOrOne, convertToNumberOrZero, getCellValue } from "./common.methods";
import { columnsList, sheet1_PLObj, sheet2_BSObj } from "./excelSheetConfig";

export async function versionTwoNetWorthOfCompany(column:number, worksheet2: any) {
    const shareHoldersFund = await getCellValue(
      worksheet2,
      `${columnsList[column] + sheet2_BSObj.shareholderFundsRow}`,
    );

    const preferenceShareCapital = await getCellValue(
      worksheet2,
      `${columnsList[column] + sheet2_BSObj.preferenceShareCapitalRow}`,
    );
    
    return convertToNumberOrZero(shareHoldersFund) - convertToNumberOrZero(preferenceShareCapital);
  }

export async function versionTwoProfitLossValues(column:number, worksheet2: any) {
    const profitLossValues = await getCellValue(
      worksheet2,
      `${columnsList[column] + sheet1_PLObj.profitLossOfYear}`,
    );

    return convertToNumberOrZero(profitLossValues);
  }