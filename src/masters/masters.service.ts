import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {Industry, IndustryDocument, ValuationMethod, 
  ValuationMethodDocument,TaxRate,TaxRateDocument,
DiscountRate,DiscountRateDocument,TerminalGrowthRate,
TerminalGrowthRateDocument,COEMethod,COEMethodDocument,
RiskFreeRate,RiskFreeRateDocument,ExpMarketReturn,
ExpMarketReturnDocument,Beta,BetaDocument,RiskPremium,
RiskPremiumDocument,COPShareCapital,COPShareCapitalDocument,
COD,CODDocument,CapitalStructure,CapitalStructureDocument } from './schema/masters.schema';

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
      async getCOEMethodById(id:string): Promise<COEMethod> {
        return this.coeMethodModel.findById(id);
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
      async getRiskFreeRateById(id:string): Promise<RiskFreeRate> {
        return this.riskFreeRateModel.findById(id);
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
      async getExpMarketReturnById(id:string): Promise<ExpMarketReturn> {
        return this.expMarketReturnModel.findById(id);
      }
      async updateExpMarketReturn(id: string, expMarketReturn: ExpMarketReturn): Promise<ExpMarketReturn> {
        return this.expMarketReturnModel.findByIdAndUpdate(id, expMarketReturn, { new: true }).exec();
      }
    
      async deleteExpReturn(id: string): Promise<any> {
        return this.expMarketReturnModel.findByIdAndRemove(id).exec();
      }
}

//Beta Service
@Injectable()
export class BetaService {
    constructor(
        @InjectModel('beta') private readonly betaModel: Model<BetaDocument>,
      ) {}
    
      async createBeta(beta:object): Promise<Beta> {
        return this.betaModel.create(beta);
    }
      async getBetas(): Promise<Beta[]> {
        return this.betaModel.find().exec();
      }
      async getBetaById(id:string): Promise<Beta> {
        return this.betaModel.findById(id);
      }
      async updateBeta(id: string, beta: Beta): Promise<Beta> {
        return this.betaModel.findByIdAndUpdate(id, beta, { new: true }).exec();
      }
    
      async deleteBeta(id: string): Promise<any> {
        return this.betaModel.findByIdAndRemove(id).exec();
      }
}


//Risk Premium Service
@Injectable()
export class RiskPremiumService {
    constructor(
        @InjectModel('riskPremium') private readonly riskPremiumModel: Model<RiskPremiumDocument>,
      ) {}
    
      async createRiskPremium(riskPremium:object): Promise<RiskPremium> {
        return this.riskPremiumModel.create(riskPremium);
    }
      async getRiskPremiums(): Promise<RiskPremium[]> {
        return this.riskPremiumModel.find().exec();
      }
      async getRiskPremiumById(id:string): Promise<RiskPremium> {
        return this.riskPremiumModel.findById(id);
      }
      async updateRiskPremium(id: string, riskPremium: RiskPremium): Promise<RiskPremium> {
        return this.riskPremiumModel.findByIdAndUpdate(id, riskPremium, { new: true }).exec();
      }
    
      async deleteRiskPremium(id: string): Promise<any> {
        return this.riskPremiumModel.findByIdAndRemove(id).exec();
      }
}

//Cost of Preference Share Capital Service
@Injectable()
export class COPShareCapitalService {
    constructor(
        @InjectModel('copShareCapital') private readonly copShareCapitalModel: Model<COPShareCapitalDocument>,
      ) {}
    
      async createCOPShareCapital(copShareCapital:object): Promise<COPShareCapital> {
        return this.copShareCapitalModel.create(copShareCapital);
    }
      async getCOPShareCapitals(): Promise<COPShareCapital[]> {
        return this.copShareCapitalModel.find().exec();
      }
      async updateCOPShareCapital(id: string, copShareCapital: COPShareCapital): Promise<COPShareCapital> {
        return this.copShareCapitalModel.findByIdAndUpdate(id, copShareCapital, { new: true }).exec();
      }
    
      async deleteCOPShareCapital(id: string): Promise<any> {
        return this.copShareCapitalModel.findByIdAndRemove(id).exec();
      }
}

//Cost of Debt Service
@Injectable()
export class CODService {
    constructor(
        @InjectModel('costOfDebt') private readonly codModel: Model<CODDocument>,
      ) {}
    
      async createCOD(cod:object): Promise<COD> {
        return this.codModel.create(cod);
    }
      async getCOD(): Promise<COD[]> {
        return this.codModel.find().exec();
      }
      async getCODById(id:string): Promise<COD> {
        return this.codModel.findById(id);
      }
      async updateCOD(id: string, cod: COD): Promise<COD> {
        return this.codModel.findByIdAndUpdate(id,cod, { new: true }).exec();
      }
    
      async deleteCOD(id: string): Promise<any> {
        return this.codModel.findByIdAndRemove(id).exec();
      }
}

//Capital Structure Service
@Injectable()
export class CapitalStructureService {
    constructor(
        @InjectModel('capitalStructure') private readonly capitalStructureModel: Model<CapitalStructureDocument>,
      ) {}
    
      async createCapitalStructure(capitalStructure:object): Promise<CapitalStructure> {
        return this.capitalStructureModel.create(capitalStructure);
    }
      async getCapitalStructure(): Promise<CapitalStructure[]> {
        return this.capitalStructureModel.find().exec();
      }
      async getCapitalStructureById(id:string): Promise<CapitalStructure> {
        return this.capitalStructureModel.findById(id);
      }
      async updateCapitalStructure(id: string, capitalStructure: CapitalStructure): Promise<CapitalStructure> {
        return this.capitalStructureModel.findByIdAndUpdate(id,capitalStructure, { new: true }).exec();
      }
    
      async deleteCapitalStructure(id: string): Promise<any> {
        return this.capitalStructureModel.findByIdAndRemove(id).exec();
      }
}
