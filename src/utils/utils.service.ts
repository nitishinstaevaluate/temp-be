import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ValuationDocument } from 'src/valuationProcess/schema/valuation.schema';
import { catchError, forkJoin, from, of, switchMap } from 'rxjs';
import { ProcessManagerDocument } from 'src/processStatusManager/schema/process-status-manager.schema';
import { AuthenticationService } from 'src/authentication/authentication.service';
import * as fs from 'fs';
import * as wordListPath from 'word-list';

@Injectable()
export class utilsService {
  constructor(
    @InjectModel('valuation') private readonly valuationModel: Model<ValuationDocument>,
    @InjectModel('processManager') private readonly processModel: Model<ProcessManagerDocument>,
    private readonly authenticationService:AuthenticationService
  ) {}
  async paginateValuationByUserId(page: number, pageSize: number,req, query):Promise<any> {

    const skip = (page - 1) * pageSize;

    return from(this.authenticationService.extractUserId(req)).pipe(
      switchMap((userDetails)=>{
        if(!userDetails.status)
          return of(userDetails);
        return forkJoin([
          from(
            this.processModel
              .find(this.constructQuery(userDetails.userId,query))
              .skip(skip)
              .limit(pageSize)
              .sort({ processIdentifierId: -1 })
              // .select('company model valuation createdAt')
              .exec(),
          ),
          from(
            this.processModel
              .find(this.constructQuery(userDetails.userId,query))
              // .select('company model valuation createdAt')
              .exec(),
          ),
        ]).pipe(
          switchMap(([response, totalPage]):any => {
            const totalPages = Math.ceil(totalPage.length / pageSize);

            return of({
                response,
                pagination: {
                  current: page,
                  pageSize,
                  hasPrevious: page > 1,
                  previous: page - 1,
                  hasNext: page < totalPages,
                  next: page + 1,
                  lastPage: totalPages,
                  totalElements: totalPage.length,
                },
              })
          }),
          catchError((error) => {
            throw new NotFoundException({
              error,
              message: 'Something went wrong',
            });
          })
        );
      })
    )
  }

  async getMaxObId(){
    const maxState = await this.processModel.findOne({ processIdentifierId: { $exists: true, $ne: null } }).sort({ processIdentifierId: -1 }).exec();
    return maxState.processIdentifierId | 100000;
  }

  constructQuery(userId: string, query?: string): FilterQuery<any> {
    const baseQuery: FilterQuery<any> = { "userId": userId };
  
    if (query && query !== undefined && query !== 'undefined') {
      baseQuery["$or"] = [
        { "firstStageInput.company": { "$regex": `${query}`, "$options": "i" }},
        { "processIdentifierId": parseInt(query) || -1 },
      ];
    }
    return baseQuery;
  }

  async getWordList(wordTyped){
    try{
      const wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');
      const newArray = wordArray
      .filter(word => word.toLowerCase().indexOf(wordTyped.toLowerCase()) === 0)
      .slice(0, 10);
      return newArray;
    }
    catch(error){
      return{
        error:error,
        status:false,
        msg:"Autocomplete list error"
      }
    }
  }
  }