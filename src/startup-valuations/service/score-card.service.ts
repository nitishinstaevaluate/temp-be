import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StartupValuationDocument } from "../schema/startup-valuation.schema";
import { MODEL, SCORE_CARD_VALUATION_MAPPER } from "src/constants/constants";
import { convertToNumberOrZero } from "src/excelFileServices/common.methods";

@Injectable()
export class ScoreCardService{

    constructor(@InjectModel('startupValuation')
    private readonly startupValuationModel: Model<StartupValuationDocument>){}

    async upsert(payload){
        try{
            const pid = payload?.processStateId;

            const scoreCardPayload = payload?.scoreCard;
            if(!scoreCardPayload) return await this.startupValuationModel.findOne({ processStateId: pid }).lean();

            const validScoreCard = {};
            const mapScoreCard = (key: string, value: any) => {
                validScoreCard[`${key}`] = value;
            };
            mapScoreCard(MODEL[11], scoreCardPayload);

            const scoreCardValuation = await this.scoreCardValuation(scoreCardPayload, MODEL[11]);
            mapScoreCard(scoreCardValuation.dbKey, scoreCardValuation.response);

            return await this.startupValuationModel.findOneAndUpdate(
                { processStateId: pid },
                { $set: { ...validScoreCard, modifiedOn:new Date()}},
                { new:true, upsert: true }
            ).lean();
        }
        catch(error){
            throw error;
        }
    }


    async scoreCardValuation(data, key){
        try{
            const staticSchema = SCORE_CARD_VALUATION_MAPPER[key];

            const { defaultWeightage, dbKey, config} = staticSchema;
            
            let pointer = 0, total = 0;
            while(pointer < config.length){
                const doaValue = data[config[pointer]?.controlDoa];
                if(doaValue !== null || doaValue !== undefined){
                    config[pointer].doa = doaValue;
                    config[pointer].weightAssign = defaultWeightage;
                    config[pointer].weightedValue = convertToNumberOrZero(doaValue) * convertToNumberOrZero(defaultWeightage)/100;
                    total += config[pointer].weightedValue;
                }

                if(config[pointer]?.label === 'Total') config[pointer].total = total;
                pointer++; 
            }
            return { response: config, dbKey };
        }
        catch(error){
            throw error;
        }
    }
}  