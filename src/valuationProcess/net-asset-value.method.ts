import { convertToNumberOrZero, getCellValue } from "src/excelFileServices/common.methods";
import { columnsList, sheet2_BSObj } from "src/excelFileServices/excelSheetConfig";

export async function computeOtherNonCurrentAssets(balanceSheet){
    // Total Other Non-Current Assets = Goodwill + Inter Co-Inv + Other Non-Current Assets
    const goodwill = await getCellValue(
        balanceSheet,
        `${columnsList[0] + sheet2_BSObj.goodwillRow}`,
      );

    const interCoInv = await getCellValue(
        balanceSheet,
        `${columnsList[0] + sheet2_BSObj.interCoInvRow}`,
      );

    const otherNonCurrentAsset = await getCellValue(
        balanceSheet,
        `${columnsList[0] + sheet2_BSObj.otherNonCurrentAssetsRow}`,
      );

      return convertToNumberOrZero(goodwill) + convertToNumberOrZero(interCoInv) + convertToNumberOrZero(otherNonCurrentAsset);
}