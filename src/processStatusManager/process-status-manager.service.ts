import { Injectable, NotFoundException } from '@nestjs/common';
import { ProcessManagerDocument } from './schema/process-status-manager.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { isNotEmpty } from 'class-validator';
import { CustomLogger } from 'src/loggerService/logger.service';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { utilsService } from 'src/utils/utils.service';

@Injectable()
export class ProcessStatusManagerService {
    constructor(@InjectModel('processManager')
    private readonly processModel: Model<ProcessManagerDocument>,
    private logger : CustomLogger,
    private readonly authenticationService: AuthenticationService,
    private readonly utilsService:utilsService){}

    async upsertProcess(req,process,processId){
       try{
        let existingRecord,alreadyExistingRecord;

        const {step,...rest} = process
        
        if (processId && isValidObjectId(processId)) {
            alreadyExistingRecord = await this.processModel.findOne({ _id: processId });
          
            if(process?.secondStageInput){
                const modelExists = await this.processModel.exists({
                    _id: processId,
                    'secondStageInput.model': { $in: process.secondStageInput.map((obj) => obj.model) },
                  });

                  if (modelExists) {
                    for await(const obj of process.secondStageInput) {
                      if(obj){
                        try {
                          existingRecord =  await this.processModel.updateOne(
                            { _id: processId, 'secondStageInput.model': obj.model },
                            {
                              $set: {
                                'secondStageInput.$': obj,
                                step: parseInt(step) + 1,
                              },
                            }
                          );
                        } catch (err) {
                          this.logger.log({
                            message: `Second stage creation failed`,
                            error: err,
                            status: false,
                          });
                        }
                      }
                      }
                      if (existingRecord.matchedCount === 1) {
                        existingRecord = await this.processModel.findOne({ _id: processId });
                      }
                  } 
                  else {
                    try{
                      
                      existingRecord = await this.processModel.findOneAndUpdate(
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
                      );
                    }catch(err){
                      this.logger.log({
                        message: `Second stage insertion failed`,
                        error:err,
                        status:false
                      });
                    }
                  }

                  if (step === 2) {
                    
                    const stageOneDetails = existingRecord?.firstStageInput;
                    const stageTwoDetails = existingRecord?.secondStageInput;
                    
                    if (stageOneDetails && stageTwoDetails) {
                      const orgModels = stageOneDetails.model;
                    
                      for await (let secondStageDetails of stageTwoDetails) {
                        const modelExist = orgModels.some((model)=>model === secondStageDetails.model);
                        if(!modelExist){
                          existingRecord=  await this.processModel.findOneAndUpdate(
                            { _id: processId },
                            { $pull: 
                              { 
                                secondStageInput : 
                                { 
                                  model: `${secondStageDetails.model}`
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

                  return {
                    processId: existingRecord.id,
                    status: true,
                    msg: 'Process state updated',
                  };
            }
            else {
                existingRecord = await this.processModel.findOneAndUpdate(
                    { _id: processId },
                    { 
                      $set: {
                          ...rest,
                          step: parseInt(step)+1,
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
          const maxProcessIdentifierId = await this.utilsService.getMaxObId();

          const authoriseUser = await this.authenticationService.extractUserId(req);

          if(!authoriseUser.status)
            return authoriseUser;

          const newRecord = await new this.processModel(
            {
                ...rest,
                step:parseInt(step)+1,
                processIdentifierId : maxProcessIdentifierId + 1,
                userId:authoriseUser.userId
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
        const processInfo = await this.processModel.findById({_id:processId});

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
