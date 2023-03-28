import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ValuationMethod, ValuationMethodDocument } from './schema/dropDowns.schema';

@Injectable()
export class ValuationMethodsService {
    constructor(
        @InjectModel('valuationMethod') private readonly methodModel: Model<ValuationMethodDocument>,
      ) {}
    
      async createValuationMethod(method:object): Promise<ValuationMethod> {
        return this.methodModel.create(method);
    }
      async getValuationMethods(): Promise<ValuationMethod[]> {
        return this.methodModel.find().exec();
      }
}
