import { Injectable, UploadedFile } from '@nestjs/common';
import { CreateImportDto } from './dto/create-import.dto';
import { UpdateImportDto } from './dto/update-import.dto';
import { multerOptions, multerConfig } from 'src/middleware/file-upload.utils';
const reader = require('xlsx');


@Injectable()
export class ImportService {
  create(createImportDto: CreateImportDto) {
    return 'This action adds a new import';
  }

  findAll() {
    return `This action returns all import`;
  }

  findOne(id: number) {
    return `This action returns a #${id} import`;
  }

  update(id: number, updateImportDto: UpdateImportDto) {
    return `This action updates a #${id} import`;
  }

  remove(id: number) {
    return `This action removes a #${id} import`;
  }

  // createMessage(message): Observable<Object> {
  //   return this.http.post('http://localhost:3000/messages', {
  //     content: message.content,
  //     submittedBy: message.submittedBy
  //   });
  public async getFiles() {
    return "Test 2"
  }
  public async getxlsxFiles() {
    return "Test excel"
  }

  public async calcFcfeVal(years: number, discountingFactor: number, noOfEquityShares: number,
    otherAdjustments: number, @UploadedFile() file) {
    const uploadPath = multerConfig.dest;
    const downloadPath = multerConfig.export;
    // console.log("Current directory:", __dirname)
    const inputFile = reader.readFile(`${uploadPath}/${(file.filename)}`);
    let profitLoss = []
    let balanceSheet = []

    const sheets = inputFile.SheetNames

    for (let i = 0; i < sheets.length; i++) {
      const temp = reader.utils.sheet_to_json(inputFile.Sheets[inputFile.SheetNames[i]], {
        raw: true,
        // header: 2, 
        // dateNF: 'yyyy-mm-dd',
        blankrows: false,
      })
      temp.forEach((res) => {

        Object.keys(res).forEach((key) => {
          var replacedKey = JSON.parse(JSON.stringify(key.trim().replace(/\s(?=\w+":)/g, '')));

          // var replacedKey = JSON.parse(JSON.stringify(key.trim().replace("-", '')));

          if (key !== replacedKey) {
            res[replacedKey] = res[key];
            delete res[key];
          }
        });

        if (i == 0) {
          profitLoss.push(res);
          // JSON.parse(JSON.stringify(res).replace(/\s(?=\w+":)/g, "")))
        } else {
          balanceSheet.push(res)
        }
      })
    }

    // Printing data
    console.log("Profit Loss");
    console.log(profitLoss);
    console.log("Balance Sheet");
    console.log(balanceSheet);

    // var jsonParsed = JSON.stringify(profitLoss);
    // Reading P&L specific values
    const PAT = profitLoss[32].Provisional_Valuation;
    const deprAmort = profitLoss[17].Provisional_Valuation;
    var otherIncome = profitLoss[20].Provisional_Valuation;
    var exceptionalItems = profitLoss[22].Provisional_Valuation;
    var extraordinaryItems = profitLoss[24].Provisional_Valuation;
    
    if (typeof otherIncome === 'string') {
      otherIncome = 0;
    }

    if (typeof exceptionalItems === 'string') {
      exceptionalItems = 0;
    }
    if (typeof extraordinaryItems === 'string') {
      extraordinaryItems = 0;
    }
    const otherNonCashItems = otherIncome + exceptionalItems + extraordinaryItems;
    // Reading BS specific values
    const tradeReceivables = balanceSheet[53].Provisional_Valuation;
    
    const unbilledRevenue = balanceSheet[54].Provisional_Valuation;
    const inventories = balanceSheet[55].Provisional_Valuation;
    const advances = balanceSheet[56].Provisional_Valuation;
    const shortTermInvestments = balanceSheet[57].Provisional_Valuation;
    const otherCurrentAssets = balanceSheet[58].Provisional_Valuation;
    
    const changeInNCA = tradeReceivables + unbilledRevenue + inventories + advances + shortTermInvestments + otherCurrentAssets - shortTermInvestments;
    
    const deferredTaxAssets = balanceSheet[49].Provisional_Valuation;
    const deferredTaxLiability = balanceSheet[20].Provisional_Valuation;

    const netDeferredTaxAssets = deferredTaxAssets - deferredTaxLiability;
    const netCashFlow = PAT + deprAmort + otherNonCashItems + changeInNCA + netDeferredTaxAssets;
    var grossFixedAssets = balanceSheet[37].Provisional_Valuation;  // deduct from next year projection
    
    
    const changeInFixedAssets = grossFixedAssets;

    const valuationFCFF = netCashFlow + changeInFixedAssets;      // Primary Valuation 

    const presentValueFCFF = discountingFactor * valuationFCFF;

    const reservesAndSurplus = balanceSheet[6].Provisional_Valuation; // Sum up across years
    const sumOfCashFlow = reservesAndSurplus;

    // console.log(balanceSheet[57].Particulars);
    const longTermBorrowings = balanceSheet[21].Provisional_Valuation;
    const debtAsOnDate = longTermBorrowings;
    console.log(debtAsOnDate);

    const cashEquivalent = balanceSheet[51].Provisional_Valuation;
    const bankBalances = balanceSheet[52].Provisional_Valuation;
    const cashAndCashEquivalent = cashEquivalent + bankBalances;
    
    const nonCurrentInvestments = balanceSheet[46].Provisional_Valuation;
    // const shortTermInvestments = balanceSheet[56].Provisional_Valuation;
    const surplusAsset = nonCurrentInvestments + shortTermInvestments;
    
    var equityValue = sumOfCashFlow - debtAsOnDate + cashAndCashEquivalent + surplusAsset + Number(otherAdjustments);
    
    var valuePerShare = equityValue / Number(noOfEquityShares);

    const responseData = {
      message: "Calculated valution using FCFF",
      userInputs: {
        projectedYears: years,
        discountingFactor: discountingFactor,
        noOfEquityShares: noOfEquityShares,
        otherAdjustments: otherAdjustments
      },
      valuationResults: {
        valuation: valuationFCFF,
        presentValue: presentValueFCFF,
        equityValue: equityValue,
        valuePerShare: valuePerShare
      }
    }

    // Creating Data format to write to excel file

    const data = [{
      Particulars: 'PAT',
      Y1: PAT,
      Y2: PAT * 1.1,
      Y3: PAT * 1.2,
      Y4: PAT * 1.25,
      Y5: PAT * 1.3,
      Y6: PAT * 1.32
     }, 
     {
      Particulars: 'Depn and Amortisation',
     Y1: deprAmort,
     Y2: deprAmort * 1.1,
     Y3: deprAmort * 1.2,
     Y4: deprAmort * 1.25,
     Y5: deprAmort * 1.3,
     Y6: deprAmort * 1.32
     }, 
     {
      Particulars: 'Oher Non Cash items',
     Y1: otherNonCashItems,
     Y2: otherNonCashItems * 1.1,
     Y3: otherNonCashItems * 1.2,
     Y4: otherNonCashItems * 1.25,
     Y5: otherNonCashItems * 1.3,
     Y6: otherNonCashItems * 1.32
     },
     {
      Particulars: 'Change in NCA',
     Y1: changeInNCA,
     Y2: changeInNCA * 1.1,
     Y3: changeInNCA * 1.2,
     Y4: changeInNCA * 1.25,
     Y5: changeInNCA * 1.3,
     Y6: changeInNCA * 1.32
     },
     {
      Particulars: 'Add/Less: Deferred Tax Assets(Net)',
     Y1: deferredTaxAssets,
     Y2: deferredTaxAssets * 1.1,
     Y3: deferredTaxAssets * 1.2,
     Y4: deferredTaxAssets * 1.25,
     Y5: deferredTaxAssets * 1.3,
     Y6: deferredTaxAssets * 1.32
     },
     {
      Particulars: 'Net Cash Flow',
     Y1: netCashFlow,
     Y2: netCashFlow * 1.1,
     Y3: netCashFlow * 1.2,
     Y4: netCashFlow * 1.25,
     Y5: netCashFlow * 1.3,
     Y6: netCashFlow * 1.32
     },
     {
      Particulars: 'Change in fixed assets',
     Y1: changeInFixedAssets,
     Y2: changeInFixedAssets * 1.1,
     Y3: changeInFixedAssets * 1.2,
     Y4: changeInFixedAssets * 1.25,
     Y5: changeInFixedAssets * 1.3,
     Y6: changeInFixedAssets * 1.32
     },
     {
      Particulars: 'FCFF',
     Y1: valuationFCFF,
     Y2: valuationFCFF * 1.1,
     Y3: valuationFCFF * 1.2,
     Y4: valuationFCFF * 1.25,
     Y5: valuationFCFF * 1.3,
     Y6: valuationFCFF * 1.32
     },
     {
      Particulars: 'Discounting Period (Mid Year)',
     Y1: 'NA',
     Y2: 'NA',
     Y3: 'NA',
     Y4: 'NA',
     Y5: 'NA',
     Y6: 'NA',
     },
     {
      Particulars: 'Discounting Factor @WACCAT',
     Y1: discountingFactor,
     Y2: discountingFactor,
     Y3: discountingFactor,
     Y4: discountingFactor,
     Y5: discountingFactor,
     Y6: discountingFactor
     },
     {
      Particulars: 'Present Value of FCFF',
     Y1: presentValueFCFF,
     Y2: presentValueFCFF * 1.1,
     Y3: presentValueFCFF * 1.2,
     Y4: presentValueFCFF * 1.25,
     Y5: presentValueFCFF * 1.3,
     Y6: presentValueFCFF * 1.32
     },
     {
      Particulars: 'Sum of Cash Flows',
     Y1: sumOfCashFlow,
     Y2: sumOfCashFlow * 1.1,
     Y3: sumOfCashFlow * 1.2,
     Y4: sumOfCashFlow * 1.25,
     Y5: sumOfCashFlow * 1.3,
     Y6: sumOfCashFlow * 1.32
     },
     {
      Particulars: 'Less: Debt as on Date',
     Y1: debtAsOnDate,
     Y2: debtAsOnDate * 1.1,
     Y3: debtAsOnDate * 1.2,
     Y4: debtAsOnDate * 1.25,
     Y5: debtAsOnDate * 1.3,
     Y6: debtAsOnDate * 1.32
     },
     {
      Particulars: 'Add: Cash & Cash Equivalents',
     Y1: cashAndCashEquivalent,
     Y2: cashAndCashEquivalent * 1.1,
     Y3: cashAndCashEquivalent * 1.2,
     Y4: cashAndCashEquivalent * 1.25,
     Y5: cashAndCashEquivalent * 1.3,
     Y6: cashAndCashEquivalent * 1.32
     },
     {
      Particulars: 'Add: Surplus Assets/Investments',
     Y1: surplusAsset,
     Y2: surplusAsset * 1.1,
     Y3: surplusAsset * 1.2,
     Y4: surplusAsset * 1.25,
     Y5: surplusAsset * 1.3,
     Y6: surplusAsset * 1.32
     },
     {
      Particulars: 'Add/Less: Other Adjustments(if any)',
     Y1: otherAdjustments,
     Y2: otherAdjustments * 1.1,
     Y3: otherAdjustments * 1.2,
     Y4: otherAdjustments * 1.25,
     Y5: otherAdjustments * 1.3,
     Y6: otherAdjustments * 1.32
     },
     {
      Particulars: 'Equity Value',
     Y1: equityValue,
     Y2: equityValue * 1.1,
     Y3: equityValue * 1.2,
     Y4: equityValue * 1.25,
     Y5: equityValue * 1.3,
     Y6: equityValue * 1.32
     },
     {
      Particulars: 'No. of Shares',
     Y1: noOfEquityShares,
     Y2: noOfEquityShares * 1.1,
     Y3: noOfEquityShares * 1.2,
     Y4: noOfEquityShares * 1.25,
     Y5: noOfEquityShares * 1.3,
     Y6: noOfEquityShares * 1.32
     },
     {
      Particulars: 'Value per Share',
     Y1: valuePerShare,
     Y2: valuePerShare * 1.1,
     Y3: valuePerShare * 1.2,
     Y4: valuePerShare * 1.25,
     Y5: valuePerShare * 1.3,
     Y6: valuePerShare * 1.32
     },

    ]
     
    const ws = reader.utils.json_to_sheet(data)
    const wb = reader.utils.book_new()
    reader.utils.book_append_sheet(wb, ws, 'FCFEValuation')
    // const outputFile = reader.readFile(`${downloadPath}/${(file.filename)}`);
    reader.writeFile(wb, `${downloadPath}/${'sampleextract.xlsx'}`)

    // const jsonContent = JSON.stringify(responseData);
    return responseData;
  }

  public async uploadFile(years: number, file: File) {
    return `This your lucky nu #${years}`;
  }


  public async uploadFiles(years: number) {
    return `This your lucky nu #${years}`;
  }

}
