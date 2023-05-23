import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  fcfe_fcff_headingObj,
  relative_valuation_headingObj,
  footerInfo,
} from './exportResults.data';
import * as moment from 'moment';
import * as fs from 'fs';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
const logoPath = './logo/logo.jpg'; // specify the relative path to your image file
const logoData = fs.readFileSync(logoPath);
const logoDataURL = `data:image/jpeg;base64,${logoData.toString('base64')}`;
const decimalPoints=2;

export function generatePdf(valuation: any, res: any) {
  const generatedBy = `Generated By: ${valuation.user.username}\n`;
const generatedOn = `Generated On: ${moment(valuation.createdAt).format('MMM D, YYYY')}`;

  const docDefinition = {
    tableLayout: 'auto',
    pageOrientation: getOrientation(valuation.model),
    header: function (currentPage, pageCount, pageSize) {
      if(currentPage!==1)
      return [
        {
          text: generatedBy,
          alignment: 'right',
          margin: [0, 20, 20, 0],
          fontSize: 10,
        },
        {
          text: generatedOn,
          alignment: 'right',
          margin: [0, -25, 20, 0],
          fontSize: 10,
        },
      ];
    },
    footer: function (currentPage, pageCount) {
      return [
        {
          text: `${valuation.company}`,
          style: 'footer',
        },
        {
          columns: [
            {
              width: '80%',
              margin: [40, 0, 0, 0],
              text: [
                { text: `Address: ${footerInfo.address}`, style: 'footer' },
              ],
            },
            {
              width: '20%',
              margin: [0, 0, 10, 0],
              text: [
                {
                  text: `Page ${currentPage} of ${pageCount}`,
                  style: 'pageNumber',
                  alignment: 'right',
                },
              ],
            },
          ],
        },
        { text: `Email - ${footerInfo.email}`, style: 'footer', noWrap: true },
      ];
    },
    content: [
      {
        image: logoDataURL,
        fit: [100, 100],
        alignment: 'left',
        margin: [0, 0, 0, 0],
      }, {
        columns: [
          {
            width: '50%',
            margin: [0, 0, 0, 0],
            text: [
              {
                text: `\n${valuation.company}\n`,
                style:'header'
              },
              {
                text: `Valuation Date: ${moment(
                  valuation.inputData.valuationDate,
                ).format('MMM D, YYYY')}\nMethod: ${valuation.model}`,
                style:'header'
              },
            ],
          },
          {
            width: '50%',
            margin: valuation.model==="FCFE"||valuation.model==="FCFF"?[30, 0, 0, 0]:[0,0,0,0],
            text: [
              {
                text: `\nGenerated By- ${valuation.user.username}\n`,
                style: 'header',
              },
              {
                text: `Generated On- ${moment(valuation.createdAt).format(
                  'MMM D, YYYY',
                )}`,
                style: 'header',
              },
              {
                text: `\nCurrency- All figures in INR`,
                style: 'header',
              },
            ],
          },
        ],
      },
      
     
      {
        text: 'Valuation of a firm based on Profit loss and balance sheet statements.',
        style: 'subHeader',
      },
      getPdfContent(valuation),
    ],
    styles: {
      header: {
        fontSize: 12,
        bold: true,
      },
      subHeader: {
        fontSize: 12,
        margin: [0, 15, 0, 10],
      },
      footer: {
        fontSize: 8,
        margin: [40, 0, 0, 0],
      },
      pageNumber: {
        fontSize: 8,
        margin: [0, 0, 10, 0],
        alignment: 'right',
      },
      tableHeader:{
        bold:true
      }
    },
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  pdfDoc.getBuffer((buffer) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ValuationResult-${new Date().getTime()}.pdf`,
    );
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  });
  // pdfDoc.getBuffer((buffer) => {
  //   res.type('application/pdf');
  //   res.end(buffer);
  // });
}
function getOrientation(model:string) {
  if (model === 'FCFE' || model === 'FCFF') return 'landscape';
  else return 'portrate';
}
export function getPdfContent(valuation: any) {
  const { model, valuationData } = valuation;
  if (model === 'FCFE' || model === 'FCFF')
    return {
      table: {
        headerRows: 1,
        body: FCFEAndFCFF_Organized_Data(valuationData) || [],
        style: 'table',
      },
    };
  else if (model === 'Relative_Valuation') {
    const tablesData = Relative_Valuation_Organized_Data(valuation);
    return [
      {
        table: {
          headerRows: 1,
          body: tablesData.table1 || [],
          style: 'table',
        },
      },
      {
        text: '\n',
      },
      {
        table: {
          headerRows: 3,
          body:
            [
              [
                {
                  text: 'Valuation of CMM InfraProjects Ltd                                Amount (in INR)',
                  colSpan: 4,
                  style:'tableHeader'
                },
                {},
                {},
                {},
              ],
              [{text:'Sr.No',style:'tableHeader'}, {text:'Particulars',style:'tableHeader'}, {text:'As on 31.03.2018',style:'tableHeader'}, {text:'As on 31.03.2018',style:'tableHeader'}],
              ...tablesData.table2,
              [
                '',
                relative_valuation_headingObj['tentativeIssuePrice'],
                {
                  text: valuationData.valuation[4].tentativeIssuePrice,
                  colSpan: 2,
                },
              ],
            ] || [],
          style: 'table',
        },
      },
    ];
  }
}

function FCFEAndFCFF_Organized_Data(valuationData: any[]) {
  const particulars = [],
    pat = [],
    depAndAmortisation = [],
    onCashItems = [],
    nca = [],
    defferedTaxAssets = [],
    netCashFlow = [],
    fixedAssets = [],
    fcff = [],
    discountingPeriod = [],
    discountingFactor = [],
    presentFCFF = [],
    sumOfCashFlows = [],
    debtOnDate = [],
    cashEquivalents = [],
    surplusAssets = [],
    otherAdj = [],
    equityValue = [],
    noOfShares = [],
    valuePerShare = [];

  //Set Headers
  particulars.push({text:fcfe_fcff_headingObj['particulars'],style:'tableHeader'});
  pat.push(fcfe_fcff_headingObj['pat']);
  depAndAmortisation.push(fcfe_fcff_headingObj['depAndAmortisation']);
  onCashItems.push(fcfe_fcff_headingObj['onCashItems']);
  nca.push(fcfe_fcff_headingObj['nca']);
  defferedTaxAssets.push(fcfe_fcff_headingObj['defferedTaxAssets']);
  netCashFlow.push(fcfe_fcff_headingObj['netCashFlow']);
  fixedAssets.push(fcfe_fcff_headingObj['fixedAssets']);
  fcff.push(fcfe_fcff_headingObj['fcff']);
  discountingPeriod.push(fcfe_fcff_headingObj['discountingPeriod']);
  discountingFactor.push(fcfe_fcff_headingObj['discountingFactor']);
  presentFCFF.push(fcfe_fcff_headingObj['presentFCFF']);
  sumOfCashFlows.push(fcfe_fcff_headingObj['sumOfCashFlows']);
  debtOnDate.push(fcfe_fcff_headingObj['debtOnDate']);
  cashEquivalents.push(fcfe_fcff_headingObj['cashEquivalents']);
  surplusAssets.push(fcfe_fcff_headingObj['surplusAssets']);
  otherAdj.push(fcfe_fcff_headingObj['otherAdj']);
  equityValue.push(fcfe_fcff_headingObj['equityValue']);
  noOfShares.push(fcfe_fcff_headingObj['noOfShares']);
  valuePerShare.push(fcfe_fcff_headingObj['valuePerShare']);

  //Organized Data Process
  valuationData.map((valuation) => {
    Object.entries(valuation).forEach(([key, value]) => {
      if (typeof value === 'number') value = (value as number).toFixed(decimalPoints);
      if(value==null|| value==undefined)
        value="";
      if (key === 'particulars') particulars.push({text:value,style:'tableHeader'});
      else if (key === 'pat') pat.push(value);
      else if (key === 'depAndAmortisation') depAndAmortisation.push(value);
      else if (key === 'onCashItems') onCashItems.push(value);
      else if (key === 'nca') nca.push(value);
      else if (key === 'defferedTaxAssets') defferedTaxAssets.push(value);
      else if (key === 'netCashFlow') netCashFlow.push(value);
      else if (key === 'fixedAssets') fixedAssets.push(value);
      else if (key === 'fcff') fcff.push(value);
      else if (key === 'discountingPeriod') discountingPeriod.push(value);
      else if (key === 'discountingFactor') discountingFactor.push(value);
      else if (key === 'presentFCFF') presentFCFF.push(value);
      else if (key === 'sumOfCashFlows') sumOfCashFlows.push(value);
      else if (key === 'debtOnDate') debtOnDate.push(value);
      else if (key === 'cashEquivalents') cashEquivalents.push(value);
      else if (key === 'surplusAssets') surplusAssets.push(value);
      else if (key === 'otherAdj') otherAdj.push(value);
      else if (key === 'equityValue') equityValue.push(value);
      else if (key === 'noOfShares') noOfShares.push(value);
      else if (key === 'valuePerShare') valuePerShare.push(value);
    });
  });
  return [
    particulars,
    pat,
    depAndAmortisation,
    onCashItems,
    nca,
    defferedTaxAssets,
    netCashFlow,
    fixedAssets,
    fcff,
    discountingPeriod,
    discountingFactor,
    presentFCFF,
    sumOfCashFlows,
    debtOnDate,
    cashEquivalents,
    surplusAssets,
    otherAdj,
    equityValue,
    noOfShares,
    valuePerShare,
  ];
}

function Relative_Valuation_Organized_Data(valuation: any) {
  const { valuationData } = valuation;
  const headerData = [
    {text:'Sr.No',style:'tableHeader'},
    {text:'Name',style:'tableHeader'},
    {text:'P/E Ratio as on Valuation Date',style:'tableHeader'},
    {text:'P/B Ratio as on Valuation Date',style:'tableHeader'},
    {text:'EV/EBITDA as on Valuation Date',style:'tableHeader'},
    {text:'Price/Sales Valuation Date',style:'tableHeader'},
  ];
  //Get Companies data here ..........
  const rows = [];
  const table1EmptyRow = [" ","", "", "","",""];
  valuationData.companies.map((obj: any, index: number) => {
    rows.push([
      index + 1,
      obj.company,
      obj.peRatio?obj.peRatio.toFixed(decimalPoints):"",
      obj.pbRatio?obj.pbRatio.toFixed(decimalPoints):"",
      obj.ebitda?obj.ebitda.toFixed(decimalPoints):"",
      obj.sales?obj.sales.toFixed(decimalPoints):"",
    ]);
  });
  const companiesInfo = valuationData.companiesInfo;
  const average = [
    '',
    'Average',
    companiesInfo.peRatioAvg? companiesInfo.peRatioAvg.toFixed(decimalPoints):"",
    companiesInfo.pbRatioAvg?companiesInfo.pbRatioAvg.toFixed(decimalPoints):"",
    companiesInfo.ebitdaAvg?companiesInfo.ebitdaAvg.toFixed(decimalPoints):"",
    companiesInfo.salesAvg?companiesInfo.salesAvg.toFixed(decimalPoints):"",
  ];
  const median = [
    '',
    'Median',
    companiesInfo.peRatioMed?companiesInfo.peRatioMed.toFixed(decimalPoints):"",
    companiesInfo.pbRatioMed?companiesInfo.pbRatioMed.toFixed(decimalPoints):"",
    companiesInfo.ebitdaMed?companiesInfo.ebitdaMed.toFixed(decimalPoints):"",
    companiesInfo.salesMed?companiesInfo.salesMed.toFixed(decimalPoints):"",
  ];
  const table1 = [headerData, ...rows, table1EmptyRow, average, median];
  const table2 = [];
  table2.push(['', '', {text:'Average',style:"tableHeader"},{text: 'Median',style:"tableHeader"}]);
  valuationData.valuation.map((obj: any, index: number) => {
    if (obj.particular === 'pbRatio') {
      table2.push([
        index + 1,
        relative_valuation_headingObj['pbRatioLabel'],
        '',
        '',
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['netWorth'],
        obj.netWorthAvg?obj.netWorthAvg.toFixed(decimalPoints):"",
        obj.netWorthMed?obj.netWorthMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['pbShares'],
        obj.pbSharesAvg?obj.pbSharesAvg.toFixed(decimalPoints):"",
        obj.pbSharesMed?obj.pbSharesMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['bookValue'],
        obj.bookValueAvg?obj.bookValueAvg.toFixed(decimalPoints):"",
        obj.bookValueMed?obj.bookValueMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['pbRatio'],
        obj.pbRatioAvg?obj.pbRatioAvg.toFixed(decimalPoints):"",
        obj.pbRatioMed?obj.pbRatioMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['pbMarketPrice'],
        obj.pbMarketPriceAvg?obj.pbMarketPriceAvg.toFixed(decimalPoints):"",
        obj.pbMarketPriceMed?obj.pbMarketPriceMed.toFixed(decimalPoints):"",
      ]);
    } else if (obj.particular === 'peRatio') {
      table2.push(["  ","", "",""]);
      table2.push([
        index + 1,
        relative_valuation_headingObj['peRatioLabel'],
        '',
        '',
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['eps'],
        obj.epsAvg?obj.epsAvg.toFixed(decimalPoints):"",
        obj.epsMed?obj.epsMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['peRatio'],
        obj.peRatioAvg?obj.peRatioAvg.toFixed(decimalPoints):"",
        obj.peRatioMed?obj.peRatioMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['peMarketPrice'],
        obj.peMarketPriceAvg?obj.peMarketPriceAvg.toFixed(decimalPoints):"",
        obj.peMarketPriceMed?obj.peMarketPriceMed.toFixed(decimalPoints):"",
      ]);
    } else if (obj.particular === 'ebitda') {
      table2.push(["  ","", "",""]);
      table2.push([
        index + 1,
        relative_valuation_headingObj['ebitdaLabel'],
        '',
        '',
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['ebitda'],
        obj.ebitdaAvg?obj.ebitdaAvg.toFixed(decimalPoints):"",
        obj.ebitdaMed?obj.ebitdaMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['ev'],
        obj.evAvg?obj.evAvg.toFixed(decimalPoints):"",
        obj.evMed?obj.evMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['enterprise'],
        obj.enterpriseAvg?obj.enterpriseAvg.toFixed(decimalPoints):"",
        obj.enterpriseMed?obj.enterpriseMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['debt'],
        obj.debtAvg?obj.debtAvg.toFixed(decimalPoints):"",
        obj.debtMed?obj.debtMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['ebitdaEquity'],
        obj.ebitdaEquityAvg?obj.ebitdaEquityAvg.toFixed(decimalPoints):"",
        obj.ebitdaEquityMed?obj.ebitdaEquityMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['ebitdaShares'],
        obj.ebitdaSharesAvg?obj.ebitdaSharesAvg.toFixed(decimalPoints):"",
        obj.ebitdaSharesMed?obj.ebitdaSharesMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['ebitdaMarketPrice'],
        obj.ebitdaMarketPriceAvg?obj.ebitdaMarketPriceAvg.toFixed(decimalPoints):"",
        obj.ebitdaMarketPriceMed?obj.ebitdaMarketPriceMed.toFixed(decimalPoints):"",
      ]);
    } else if (obj.particular === 'sales') {
      table2.push(["  ","", "",""]);
      table2.push([
        index + 1,
        relative_valuation_headingObj['salesLabel'],
        '',
        '',
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['sales'],
        obj.salesAvg?obj.salesAvg.toFixed(decimalPoints):"",
        obj.salesMed?obj.salesMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['salesRatio'],
        obj.salesRatioAvg?obj.salesRatioAvg.toFixed(decimalPoints):"",
        obj.salesRatioMed?obj.salesRatioMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['salesEquity'],
        obj.salesEquityAvg?obj.salesEquityAvg.toFixed(decimalPoints):"",
        obj.salesEquityMed?obj.salesEquityMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['salesShares'],
        obj.salesSharesAvg?obj.salesSharesAvg.toFixed(decimalPoints):"",
        obj.salesSharesMed?obj.salesSharesMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['salesMarketPrice'],
        obj.salesMarketPriceAvg?obj.salesMarketPriceAvg.toFixed(decimalPoints):"",
        obj.salesMarketPriceMed?obj.salesMarketPriceMed.toFixed(decimalPoints):"",
      ]);
    } else if (obj.particular === 'result') {
      table2.push(["  ","", "",""]);
      table2.push([
        '',
        relative_valuation_headingObj['avgPricePerShare'],
        obj.avgPricePerShareAvg?obj.avgPricePerShareAvg.toFixed(decimalPoints):"",
        obj.avgPricePerShareMed?obj.avgPricePerShareMed.toFixed(decimalPoints):"",
      ]);
      table2.push(["  ","", "",""]);
      table2.push([
        '',
        relative_valuation_headingObj['average'],
        obj.averageAvg?obj.averageAvg.toFixed(decimalPoints):"",
        obj.averageMed?obj.averageMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['loc'],
        obj.locAvg?obj.locAvg.toFixed(decimalPoints):"",
        obj.locMed?obj.locMed.toFixed(decimalPoints):"",
      ]);
      table2.push([
        '',
        relative_valuation_headingObj['finalPrice'],
        obj.finalPriceAvg?obj.finalPriceAvg.toFixed(decimalPoints):"",
        obj.finalPriceMed?obj.finalPriceMed.toFixed(decimalPoints):"",
      ]);
    }
  });

  return {
    table1,
    table2,
  };
}
