import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { headingObj } from './exportResults.data';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
export function generatePdf(valuationInputData:any,res:any) {
  const valuationData=getOrganizedData(valuationInputData as any[]);
    const docDefinition = {
      tableLayout: 'auto',
      pageOrientation: 'landscape',
      content: [
        { text: 'Valuation', style: 'header' },
        { text: 'Valuation of a firm based on Profit loss and balance sheet statements.', style: 'subheader' },
        { text: 'Data', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto','*','*','*','*','*','*'],
            body: valuationData||[]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true
        },
        subheader: {
          fontSize: 14,
          margin: [0, 15, 0, 0]
        },
        sectionHeader: {
          bold: true,
          fontSize: 14,
          margin: [0, 15, 0, 0]
        }
      }
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer(buffer => {
      res.type('application/pdf');
      res.end(buffer, 'binary');
    });
  }


export function getOrganizedData(valuationInputData:any[]){
  const particulars=[],pat=[],depAndAmortisation=[],onCashItems=[],
  nca=[],defferedTaxAssets=[],netCashFlow=[],fixedAssets=[],fcff=[],
  discountingPeriod=[],discountingFactor=[],presentFCFF=[],sumOfCashFlows=[],
  debtOnDate=[],ccEquivalents=[],surplusAssets=[],otherAdj=[],equityValue=[],
  noOfShares=[],valuePerShare=[];

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
  ccEquivalents.push(headingObj['ccEquivalents']);
  surplusAssets.push(headingObj['surplusAssets']);
  otherAdj.push(headingObj['otherAdj']);
  equityValue.push(headingObj['equityValue']);
  noOfShares.push(headingObj['noOfShares']);
  valuePerShare.push(headingObj['valuePerShare']);

  //Organized Data Process
  valuationInputData.map((valuation)=>{
    Object.entries(valuation).forEach(([key, value]) => {
      if(key==="particulars")
      particulars.push(value)
      else if(key==="pat")
      pat.push(value)
      else if(key==="depAndAmortisation")
      depAndAmortisation.push(value)
      else if(key==="onCashItems")
      onCashItems.push(value)
      else if(key==="nca")
      nca.push(value)
      else if(key==="defferedTaxAssets")
      defferedTaxAssets.push(value)
      else if(key==="netCashFlow")
      netCashFlow.push(value)
      else if(key==="fixedAssets")
      fixedAssets.push(value)
      else if(key==="fcff")
      fcff.push(value)
      else if(key==="discountingPeriod")
      discountingPeriod.push(value)
      else if(key==="discountingFactor")
      discountingFactor.push(value)
      else if(key==="presentFCFF")
      presentFCFF.push(value)
      else if(key==="sumOfCashFlows")
      sumOfCashFlows.push(value)
      else if(key==="debtOnDate")
      debtOnDate.push(value)
      else if(key==="ccEquivalents")
      ccEquivalents.push(value)
      else if(key==="surplusAssets")
      surplusAssets.push(value)
      else if(key==="otherAdj")
      otherAdj.push(value)
      else if(key==="equityValue")
      equityValue.push(value)
      else if(key==="noOfShares")
      noOfShares.push(value)
      else if(key==="valuePerShare")
      valuePerShare.push(value)
    });
  })
  return [particulars,pat,depAndAmortisation,onCashItems,nca,defferedTaxAssets,fixedAssets,fcff,discountingPeriod,discountingFactor,presentFCFF,sumOfCashFlows,debtOnDate,ccEquivalents,surplusAssets,otherAdj,equityValue,noOfShares,valuePerShare];
}