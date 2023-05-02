import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { headingObj, footerInfo } from './exportResults.data';
import * as moment from 'moment';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
export function generatePdf(valuation: any, res: any) {
  const valuationData = getOrganizedData(valuation);
  const docDefinition = {
    tableLayout: 'auto',
    pageOrientation: 'landscape',
    footer: function (currentPage, pageCount) {
      return [
        {
          text: `Company Logo`,
          style: 'footer',
        },
        {
          text: `${valuation.company}`,
          style: 'footer',
        },
        { text: `Address: ${footerInfo.address}`, style: 'footer' },
        { text: `Email - ${footerInfo.email}`, style: 'footer' },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          style: 'footer',
        },
      ];
    },
    content: [
      {
        text: `${valuation.company}`,
        style: 'header',
      },
      {
        text: `Valuation Date: ${moment(valuation.inputData.valuationDate).format('MMM D, YYYY')}`,
        style: 'header',
      },
      {
        text: `Generated By- ${valuation.user.username}`,
        style: 'header',
      },
      {
        text: `Generated On- ${moment(valuation.createdAt).format('MMM D, YYYY')}`,
        style: 'header',
      },
      {
        text: 'Valuation of a firm based on Profit loss and balance sheet statements.',
        style: 'subHeader',
      },
      {
        table: {
          headerRows: 1,
          body: valuationData || [],
          style: 'table',
        },
      },
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
        margin: [30, 0, 0, 0],
      },
    },
  };

  const pdfDoc = pdfMake.createPdf(docDefinition);
  // pdfDoc.getBuffer((buffer) => {
  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.setHeader(
  //     'Content-Disposition',
  //     `attachment; filename=ValuationResult-${new Date().getTime()}.pdf`,
  //   );
  //   res.setHeader('Content-Length', buffer.length);
  //   res.end(buffer);
  // });
  pdfDoc.getBuffer((buffer) => {
    res.type('application/pdf');
    res.end(buffer);
  });
}

export function getOrganizedData(valuation) {
  const { model, valuationInputData } = valuation;
  if (model === 'FCFE' || model === 'FCFE')
    return FCFEAndFCFF_Format(valuationInputData);
  else if (model === 'Relative_Valuation') {
    const headerData = [
      'Sr.No',
      'Name',
      'P/E Ratio as on Valuation Date',
      'P/B Ratio as on Valuation Date',
      'EV/EBITDA as on Valuation Date',
      'Price/Sales Valuation Date',
    ];
  //Get Companies data here ..........
    const rows=[];
    valuation.companies.map((obj:any,index:number)=>{
rows.push([index+1,obj.company,obj.peRatio,obj.pbRatio,obj.ebitda,obj.sales])
    })
    // const emptyRow=[{},{},{},{},{},{}];
    const average=["","Average",7.03,0.67,4.63,0.63];
    const median=["","Median",5.03,0.45,6.22,0.43];
    return [headerData,...rows,average,median];
  }
}

function FCFEAndFCFF_Format(valuationInputData: any[]) {
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
  particulars.push(headingObj['particulars']);
  pat.push(headingObj['pat']);
  depAndAmortisation.push(headingObj['depAndAmortisation']);
  onCashItems.push(headingObj['onCashItems']);
  nca.push(headingObj['nca']);
  defferedTaxAssets.push(headingObj['defferedTaxAssets']);
  netCashFlow.push(headingObj['netCashFlow']);
  fixedAssets.push(headingObj['fixedAssets']);
  fcff.push(headingObj['fcff']);
  discountingPeriod.push(headingObj['discountingPeriod']);
  discountingFactor.push(headingObj['discountingFactor']);
  presentFCFF.push(headingObj['presentFCFF']);
  sumOfCashFlows.push(headingObj['sumOfCashFlows']);
  debtOnDate.push(headingObj['debtOnDate']);
  cashEquivalents.push(headingObj['cashEquivalents']);
  surplusAssets.push(headingObj['surplusAssets']);
  otherAdj.push(headingObj['otherAdj']);
  equityValue.push(headingObj['equityValue']);
  noOfShares.push(headingObj['noOfShares']);
  valuePerShare.push(headingObj['valuePerShare']);

  //Organized Data Process
  valuationInputData.map((valuation) => {
    Object.entries(valuation).forEach(([key, value]) => {
      if (value === null) value = '';
      if (key === 'particulars') particulars.push(value);
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
