import { Injectable } from '@nestjs/common';
import { ProcessStatusManagerDocument } from './schema/process-status-manager.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { isNotEmpty } from 'class-validator';
import { CustomLogger } from 'src/loggerService/logger.service';

@Injectable()
export class ProcessStatusManagerService {
    constructor(@InjectModel('processStatusManager')
    private readonly processStatusModel: Model<ProcessStatusManagerDocument>,
    private logger : CustomLogger){}
    async upsertProcess(process,processId){
       try{
        let existingRecord,alreadyExistingRecord;

        const {userId,step,...rest} = process
        
        if (processId && isValidObjectId(processId)) {
            alreadyExistingRecord = await this.processStatusModel.findOne({ _id: processId });
          
            if(process?.secondStageInput){
                const modelExists = await this.processStatusModel.exists({
                    _id: processId,
                    'secondStageInput.model': { $in: process.secondStageInput.map((obj) => obj.model) },
                  });
                  
                  if (modelExists) {
                    for await(const obj of process.secondStageInput) {
                        existingRecord = await this.processStatusModel.updateOne(
                          { _id: processId, 'secondStageInput.model': obj.model },
                          {
                            $set: {
                              'secondStageInput.$': obj,
                              step: parseInt(step) + 1,
                            },
                          },
                          (err)=>{
                           if(err){
                            this.logger.log({
                              message: `Second stage creation failed`,
                              error:err,
                              status:false
                            });
                           }
                          }
                        );
                      }

                      if (existingRecord.matchedCount === 1) {
                        existingRecord = await this.processStatusModel.findOne({ _id: processId });
                      }
                  } 
                  else {
                    existingRecord = await this.processStatusModel.findOneAndUpdate(
                      { _id: processId },
                      {
                        $push: {
                          secondStageInput: {
                            $each: process.secondStageInput,
                          },
                        },
                        $set: {
                          step: parseInt(step) + 1,
                        },
                      },
                      { new: true },
                      (err)=>{
                        if(err){
                          this.logger.log({
                            message: `Second stage insertion failed`,
                            error:err,
                            status:false
                          });
                         }
                      }
                    );
                  }

                  if (step === 2) {
                    
                    const stageOneDetails = existingRecord?.firstStageInput;
                    const stageTwoDetails = existingRecord?.secondStageInput;
                    
                    if (stageOneDetails && stageTwoDetails) {
                      const orgModels = stageOneDetails.model;
                    
                      for await (let model of orgModels) {
                        for await (let secondStageDetails of stageTwoDetails){
                            if(model !== secondStageDetails.model){
                              existingRecord=  await this.processStatusModel.findOneAndUpdate(
                                { _id: processId },
                                { $pull: 
                                  { 
                                    secondStageInput : 
                                    { 
                                      model: `${secondStageDetails?.model}`
                                    }
                                  } 
                                },
                                { new: true },
                                (err) => {
                                  if(err){
                                    this.logger.log({
                                      message: `Second stage deletion failed`,
                                      error:err,
                                      status:false
                                    });
                                   }
                                }
                              );
                            }
                          }
                      }
                    }
                  }
                
                  return {
                    processId: existingRecord.id,
                    status: true,
                    msg: 'Process state updated',
                  };
            }
            else {
                existingRecord = await this.processStatusModel.findOneAndUpdate(
                    { _id: processId },
                    { 
                      $set: { 
                          ...rest,
                          step: parseInt(step)+1
                      } 
                    },
                    { new: true }
                );
    
                return {
                    processId:existingRecord.id,
                    status:true,
                    msg:'process state updated',
                };
            }
        } 
        else {

          const newRecord = await new this.processStatusModel(
            {
                userId:userId,
                ...rest,
                step:parseInt(step)+1
            }).save();

          return {
            processId:newRecord.id,
            status:true,
            msg:'process state created',
          }
        }
       }
       catch(error){
        this.logger.log({
          message: `Process status manager fail`,
          error:error.message,
          status:false
        });

        return {
          error:error.message,
          status:false,
          msg:'Process status manager fail'
        }
       }
    }

    async fetchProcess(processId){
      try{
        const processInfo = await this.processStatusModel.findById({_id:processId});

        return {
          stateInfo:processInfo,
          status:true,
          msg:'Process retreive success'
        }
      }catch(error){
        return {
          error:error.message,
          status:false,
          msg:'Process retrieve failed'
        }
      }
    }
}
