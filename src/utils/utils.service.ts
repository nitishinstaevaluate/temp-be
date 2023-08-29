import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ValuationDocument } from 'src/valuationProcess/schema/valuation.schema';
import { Observable, catchError, forkJoin, from, of, switchMap } from 'rxjs';
//Valuations Service
@Injectable()
export class utilsService {
  constructor(
    @InjectModel('valuation')
    private readonly valuationModel: Model<ValuationDocument>
  ) {}
  async paginateValuationByUserId(userId: string, page: number, pageSize: number):Promise<any> {

    const skip = (page - 1) * pageSize;

    return forkJoin([
      from(
        this.valuationModel
          .find({ userId: userId })
          .skip(skip)
          .limit(pageSize)
          .sort({ createdAt: -1 })
          .select('company model valuation createdAt')
          .exec(),
      ),
      from(
        this.valuationModel
          .find({ userId: userId })
          .select('company model valuation createdAt')
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
  }