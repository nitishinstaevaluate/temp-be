import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {Industry, IndustryDocument, ValuationMethod, 
  ValuationMethodDocument,TaxRate,TaxRateDocument,
DiscountRate,DiscountRateDocument,TerminalGrowthRate,TerminalGrowthRateDocument } from './schema/masters.schema';

// Industries Service
@Injectable()
export class IndustriesService {
    constructor(
        @InjectModel('industry') private readonly industryModel: Model<IndustryDocument>,
      ) {}
    
      async createIndustry(industry:object): Promise<Industry> {
        return this.industryModel.create(industry);
    }
      async getIndustries(): Promise<Industry[]> {
        return this.industryModel.find().exec();
      }
}

//ValuationMethods Service
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

//TaxRates Service
@Injectable()
export class TaxRatesService {
    constructor(
        @InjectModel('taxRate') private readonly taxRateModel: Model<TaxRateDocument>,
      ) {}
    
      async createTaxRate(taxRate:object): Promise<TaxRate> {
        return this.taxRateModel.create(taxRate);
    }
      async getTaxRates(): Promise<TaxRate[]> {
        return this.taxRateModel.find().exec();
      }
}


//DiscountRates Service
@Injectable()
export class DiscountRatesService {
    constructor(
        @InjectModel('discountRate') private readonly discountRateModel: Model<DiscountRateDocument>,
      ) {}
    
      async createDiscountRate(discountRate:object): Promise<DiscountRate> {
        return this.discountRateModel.create(discountRate);
    }
      async getDiscountRates(): Promise<DiscountRate[]> {
        return this.discountRateModel.find().exec();
      }
}

//TerminalGrowthRates Service
@Injectable()
export class TerminalGrowthRatesService {
    constructor(
        @InjectModel('terminalGrowthRate') private readonly growthRateModel: Model<TerminalGrowthRateDocument>,
      ) {}
    
      async createGrowthRate(growthRate:object): Promise<TerminalGrowthRate> {
        return this.growthRateModel.create(growthRate);
    }
      async getGrowthRates(): Promise<TerminalGrowthRate[]> {
        return this.growthRateModel.find().exec();
      }
}