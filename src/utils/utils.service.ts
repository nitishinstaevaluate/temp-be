import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ValuationDocument } from 'src/valuationProcess/schema/valuation.schema';
import { catchError, forkJoin, from, of, switchMap } from 'rxjs';
import { ProcessManagerDocument } from 'src/processStatusManager/schema/process-status-manager.schema';
//Valuations Service
@Injectable()
export class utilsService {
  constructor(
    @InjectModel('valuation') private readonly valuationModel: Model<ValuationDocument>,
    @InjectModel('processManager') private readonly processModel: Model<ProcessManagerDocument>
  ) {}
  async paginateValuationByUserId(userId: string, page: number, pageSize: number):Promise<any> {

    const skip = (page - 1) * pageSize;

    return forkJoin([
      from(
        this.processModel
          .find({ userId: userId })
          .skip(skip)
          .limit(pageSize)
          .sort({ createdAt: -1 })
          // .select('company model valuation createdAt')
          .exec(),
      ),
      from(
        this.processModel
          .find({ userId: userId })
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
  }

  async getMaxObId(){
    const maxState = await this.processModel.findOne({ processIdentifierId: { $exists: true, $ne: null } }).sort({ processIdentifierId: -1 }).exec();
    return maxState.processIdentifierId | 100000;
  }
  }