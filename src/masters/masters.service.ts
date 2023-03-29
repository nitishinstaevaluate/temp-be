import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {Industry, IndustryDocument, ValuationMethod, 
  ValuationMethodDocument,TaxRate,TaxRateDocument,
DiscountRate,DiscountRateDocument,TerminalGrowthRate,
TerminalGrowthRateDocument,COEMethod,COEMethodDocument,
RiskFreeRate,RiskFreeRateDocument,ExpMarketReturn,
ExpMarketReturnDocument } from './schema/masters.schema';

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
      async updateIndustry(id: string, industry:Industry): Promise<Industry> {
        return this.industryModel.findByIdAndUpdate(id,industry, { new: true }).exec();
      }
    
      async deleteIndustry(id: string): Promise<any> {
        return this.industryModel.findByIdAndRemove(id).exec();
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
      async getValuationMethodById(id: string): Promise<ValuationMethod> {
        return this.methodModel.findById(id);
      }
      async updateValuationMethod(id: string,method:ValuationMethod): Promise<ValuationMethod> {
        return this.methodModel.findByIdAndUpdate(id,method, { new: true }).exec();
      }
    
      async deleteValuationMethod(id: string): Promise<any> {
        return this.methodModel.findByIdAndRemove(id).exec();
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
      async updateTaxRate(id: string, taxRate: TaxRate): Promise<TaxRate> {
        return this.taxRateModel.findByIdAndUpdate(id,taxRate, { new: true }).exec();
      }
    
      async deleteTaxRate(id: string): Promise<any> {
        return this.taxRateModel.findByIdAndRemove(id).exec();
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
      async updateDiscountRate(id: string,discountRate: DiscountRate): Promise<DiscountRate> {
        return this.discountRateModel.findByIdAndUpdate(id,discountRate, { new: true }).exec();
      }
    
      async deleteDiscountRate(id: string): Promise<any> {
        return this.discountRateModel.findByIdAndRemove(id).exec();
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
      async updateGrowthRate(id: string, growthRate: TerminalGrowthRate): Promise<TerminalGrowthRate> {
        return this.growthRateModel.findByIdAndUpdate(id, growthRate, { new: true }).exec();
      }
    
      async deleteGrowthRate(id: string): Promise<any> {
        return this.growthRateModel.findByIdAndRemove(id).exec();
      }
}

//COEMethods Service
@Injectable()
export class COEMethodsService {
    constructor(
        @InjectModel('coeMethod') private readonly coeMethodModel: Model<COEMethodDocument>,
      ) {}
    
      async createCOEMethod(coeMethod:object): Promise<COEMethod> {
        return this.coeMethodModel.create(coeMethod);
    }
      async getCOEMethods(): Promise<COEMethod[]> {
        return this.coeMethodModel.find().exec();
      }
      async updateCOEMethod(id: string, coeMethod: COEMethod): Promise<COEMethod> {
        return this.coeMethodModel.findByIdAndUpdate(id,coeMethod, { new: true }).exec();
      }
    
      async deleteCOEMethod(id: string): Promise<any> {
        return this.coeMethodModel.findByIdAndRemove(id).exec();
      }
}

//RiskFreeRates Service
@Injectable()
export class RiskFreeRatesService {
    constructor(
        @InjectModel('riskFreeRate') private readonly riskFreeRateModel: Model<RiskFreeRateDocument>,
      ) {}
    
      async createRiskFreeRate(riskFreeRate:object): Promise<RiskFreeRate> {
        return this.riskFreeRateModel.create(riskFreeRate);
    }
      async getRiskFreeRates(): Promise<RiskFreeRate[]> {
        return this.riskFreeRateModel.find().exec();
      }
      async updateRiskFreeRate(id: string, riskFreeRate: RiskFreeRate): Promise<RiskFreeRate> {
        return this.riskFreeRateModel.findByIdAndUpdate(id, riskFreeRate, { new: true }).exec();
      }
    
      async deleteRiskFreeRate(id: string): Promise<any> {
        return this.riskFreeRateModel.findByIdAndRemove(id).exec();
      }
}

//ExpMarketReturns Service
@Injectable()
export class ExpMarketReturnsService {
    constructor(
        @InjectModel('expMarketReturn') private readonly expMarketReturnModel: Model<ExpMarketReturnDocument>,
      ) {}
    
      async createExpMarketReturn(expMarketReturn:object): Promise<ExpMarketReturn> {
        return this.expMarketReturnModel.create(expMarketReturn);
    }
      async getExpMarketReturns(): Promise<ExpMarketReturn[]> {
        return this.expMarketReturnModel.find().exec();
      }
      async updateExpMarketReturn(id: string, expMarketReturn: ExpMarketReturn): Promise<ExpMarketReturn> {
        return this.expMarketReturnModel.findByIdAndUpdate(id, expMarketReturn, { new: true }).exec();
      }
    
      async deleteExpReturn(id: string): Promise<any> {
        return this.expMarketReturnModel.findByIdAndRemove(id).exec();
      }
}