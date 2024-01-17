import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ElevenUaDocument } from './schema/eleven-ua.schema';
import { ExcelSheetService } from 'src/excelFileServices/uploadExcel.service';
import * as xlsx from 'xlsx';
import { convertToNumberOrZero, getCellValue } from 'src/excelFileServices/common.methods';
import { columnsList, sheet4_ruleElevenUaObj } from 'src/excelFileServices/excelSheetConfig';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { plainToClass } from 'class-transformer';
import { ElevenUaDTO, FetchElevenUaDto } from './dto/eleven-ua.dto';

@Injectable()
export class ElevenUaService {
    constructor(@InjectModel('ruleelevenua') private readonly ruleelevenuaModel: Model<ElevenUaDocument>,
    private readonly uplaodExcelService:ExcelSheetService,
    private readonly authenticationService:AuthenticationService){}

    async upsertProcess(req,payload,id){
        try{
            if(!payload)
                return {
                    msg:'Incorrect Payload',
                    status:false,
                }
            
            const excelSheetId = payload.isExcelModified ? payload.modifiedExcelSheetId : payload.excelSheetId;

            const filePath:any = await this.uplaodExcelService.fetchFinancialSheetFromS3(excelSheetId);

            const authorizeUser = await this.authenticationService.extractUserId(req);

            if(!authorizeUser.status)
                return authorizeUser

            if(!filePath)
                return {
                    msg:"Excel Sheet not found",
                    error:filePath,
                    status:false
                }

                const workbookXLSX = xlsx.readFile(filePath);
                const ruleElevenUaSheet = workbookXLSX.Sheets['Rule 11 UA'];

                // calculate book value of all assets
                const totalAssets = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.totalAssetsRow}`));
                const immovableProperty = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.immovablePropertyRow}`));
                const jewellery = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.jewelleryRow}`));
                const artisticWork = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.artisticWorkRow}`));
                const sharesAndSecurities = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.sharesAndSecuritiesRow}`));
                const currentInvestmentAndSecurities = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.currentInvestmentSharesAndSecuritesRow}`));
                const nonCurrentInvestmentAndSecurities = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.nonCurrentInvestmenInSharesAndSecuritesRow}`));

                const bookValueOfAllAssets = (totalAssets - immovableProperty - jewellery - artisticWork - sharesAndSecurities - currentInvestmentAndSecurities - nonCurrentInvestmentAndSecurities).toFixed(2);

                // calculate income tax refund claim b20+b21+b38
                const advanceTax = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.advanceTaxRow}`));
                const incomeTaxRefund = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.incomeTaxRefundRow}`));
                const advanceTaxPaid = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.advanceTaxPaidRow}`));

                const totalIncomeTaxPaid = (advanceTax + incomeTaxRefund + advanceTaxPaid).toFixed(2);
            
                // calculate unamortised amount of deffered expenditure b39 + b40 + b41+ b22
                const preliminaryExpense = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.preliminaryExpenseRow}`));
                const preOperativeExpense = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.preOperativeTaxRow}`));
                const otherMiscllneousExpense = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.otherMiscllneousExpenseRow}`));
                const deferredTaxAssets = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.defferedTaxRow}`));

                const unamortisedAmountOfDeferredExpenditure = (preliminaryExpense + preOperativeExpense + otherMiscllneousExpense + deferredTaxAssets).toFixed(2);

                // calculate book value of liabilities
                const bookValueOfLiabilities = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.totalAssetsRow}`)).toFixed(2);

                // calculate paid-up capital/share capital
                const paidUpCapital = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.shareCapitalRow}`)).toFixed(2);

                // calculate amount set apart for payment of dividends
                const paymentDividends = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.paymentDividendsRow}`)).toFixed(2);

                // calculate reserve and surplus
                const reserveAndSurplus = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.reserveAndSurplusRow}`)).toFixed(2);

                // calculate amount representing provision for taxation
                const provisionForTaxation = convertToNumberOrZero(await getCellValue(ruleElevenUaSheet, `${columnsList[0]}${sheet4_ruleElevenUaObj.provisionForTaxationRow}`)).toFixed(2);

                // calculate current-investment (shares and securities) and non-current-investment (shares and securities)
                const totalInvestmentSharesAndSecurities = (currentInvestmentAndSecurities + nonCurrentInvestmentAndSecurities).toFixed(2);

                const createPayload = {
                    bookValueOfAllAssets,
                    totalIncomeTaxPaid,
                    unamortisedAmountOfDeferredExpenditure,
                    totalInvestmentSharesAndSecurities,
                    bookValueOfLiabilities,
                    paidUpCapital,
                    paymentDividends,
                    reserveAndSurplus,
                    provisionForTaxation,
                    userId:authorizeUser.userId,
                    inputData:payload
                }

                let elevenUaResponse;

                if(id && id !== 'undefined'){
                    const elevenUaExist = await this.ruleelevenuaModel.findById(id);

                    if(elevenUaExist){

                        elevenUaResponse = await this.ruleelevenuaModel.findOneAndUpdate(
                            {_id:id},
                            createPayload,
                            { new:true }
                        )
                    }
                    else{

                        return {
                            msg:"Id not found",
                            status:false,
                        }
                    }
                }
                else{

                    elevenUaResponse = await new this.ruleelevenuaModel(createPayload).save();
                }

            return {
                data:elevenUaResponse,
                msg:"valuation success",
                status:true
            }
        }
        catch(error){
            return {
                msg:"rule eleven Ua valuation failed",
                error:error,
                status:false
            }
        }
    }

    async fetchRuleElevenUa(id){
        try{
            const  data = plainToClass(FetchElevenUaDto,await this.ruleelevenuaModel.findById({_id:id}), {excludeExtraneousValues:true})
            return {
                data,
                msg:"record found",
                status:true
            }
        }
        catch(error){
            return {
                error:error,
                msg:'eleven ua record not found',
                status:false
            } 
        }
    }
}
