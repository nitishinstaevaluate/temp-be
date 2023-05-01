import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  Industry,
  IndustryDocument,
  SubIndustry,
  SubIndustryDocument,
  Company,
  CompanyDocument,
  ValuationMethod,
  ValuationMethodDocument,
  TaxRate,
  TaxRateDocument,
  DiscountRate,
  DiscountRateDocument,
  TerminalGrowthRate,
  TerminalGrowthRateDocument,
  COEMethod,
  COEMethodDocument,
  RiskFreeRate,
  RiskFreeRateDocument,
  ExpMarketReturn,
  ExpMarketReturnDocument,
  Beta,
  BetaDocument,
  RiskPremium,
  RiskPremiumDocument,
  COPShareCapital,
  COPShareCapitalDocument,
  COD,
  CODDocument,
  CapitalStructure,
  CapitalStructureDocument,
  POPShareCapital,
  POPShareCapitalDocument,
} from './schema/masters.schema';

// Industries Service
@Injectable()
export class IndustriesService {
  constructor(
    @InjectModel('industry')
    private readonly industryModel: Model<IndustryDocument>,
  ) {}

  async createIndustry(industry: object): Promise<Industry> {
    try {
      return await this.industryModel.create(industry);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getIndustries(): Promise<Industry[]> {
    return await this.industryModel.find().exec();
  }
  async updateIndustry(id: string, industry: Industry): Promise<Industry> {
    return await this.industryModel
      .findByIdAndUpdate(id, industry, { new: true })
      .exec();
  }

  async deleteIndustry(id: string): Promise<any> {
    return await this.industryModel.findByIdAndRemove(id).exec();
  }
}

// Sub Industries Service
@Injectable()
export class SubIndustriesService {
  constructor(
    @InjectModel('subIndustry')
    private readonly subIndustryModel: Model<SubIndustryDocument>,
  ) {}

  async createSubIndustry(subIndustry: object): Promise<SubIndustry> {
    try {
      return await this.subIndustryModel.create(subIndustry);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getSubIndustries(industryId:string): Promise<SubIndustry[]> {
    return await this.subIndustryModel.find({industryId}).exec();
  }
  async updateSubIndustry(id: string, subIndustry: SubIndustry): Promise<SubIndustry> {
    return await this.subIndustryModel
      .findByIdAndUpdate(id, subIndustry, { new: true })
      .exec();
  }

  async deleteSubIndustry(id: string): Promise<any> {
    return await this.subIndustryModel.findByIdAndRemove(id).exec();
  }
}

//Company Service
@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel('company')
    private readonly companyModel: Model<CompanyDocument>,
  ) {}

  async createCompany(company: object): Promise<Company> {
    try {
      return await this.companyModel.create(company);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getCompanies(industryId:string): Promise<Company[]> {
    return await this.companyModel.find({industryId}).exec();
  }
  async updateCompany(id: string, company: Company): Promise<Company> {
    return await this.companyModel
      .findByIdAndUpdate(id, company, { new: true })
      .exec();
  }

  async deleteCompany(id: string): Promise<any> {
    return await this.companyModel.findByIdAndRemove(id).exec();
  }
}


//ValuationMethods Service
@Injectable()
export class ValuationMethodsService {
  constructor(
    @InjectModel('valuationMethod')
    private readonly methodModel: Model<ValuationMethodDocument>,
  ) {}

  async createValuationMethod(method: object): Promise<ValuationMethod> {
    try {
      return await this.methodModel.create(method);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getValuationMethods(): Promise<ValuationMethod[]> {
    return await this.methodModel.find().exec();
  }
  async getValuationMethodById(id: string): Promise<ValuationMethod> {
    return await this.methodModel.findById(id);
  }
  async updateValuationMethod(
    id: string,
    method: ValuationMethod,
  ): Promise<ValuationMethod> {
    return await this.methodModel
      .findByIdAndUpdate(id, method, { new: true })
      .exec();
  }

  async deleteValuationMethod(id: string): Promise<any> {
    return await this.methodModel.findByIdAndRemove(id).exec();
  }
}

//TaxRates Service
@Injectable()
export class TaxRatesService {
  constructor(
    @InjectModel('taxRate')
    private readonly taxRateModel: Model<TaxRateDocument>,
  ) {}

  async createTaxRate(taxRate: object): Promise<TaxRate> {
    try {
      return await this.taxRateModel.create(taxRate);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getTaxRates(): Promise<TaxRate[]> {
    return await this.taxRateModel.find().exec();
  }
  async updateTaxRate(id: string, taxRate: TaxRate): Promise<TaxRate> {
    return await this.taxRateModel
      .findByIdAndUpdate(id, taxRate, { new: true })
      .exec();
  }

  async deleteTaxRate(id: string): Promise<any> {
    return await this.taxRateModel.findByIdAndRemove(id).exec();
  }
}

//DiscountRates Service
@Injectable()
export class DiscountRatesService {
  constructor(
    @InjectModel('discountRate')
    private readonly discountRateModel: Model<DiscountRateDocument>,
  ) {}

  async createDiscountRate(discountRate: object): Promise<DiscountRate> {
    try {
      return await this.discountRateModel.create(discountRate);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getDiscountRates(): Promise<DiscountRate[]> {
    return await this.discountRateModel.find().exec();
  }
  async updateDiscountRate(
    id: string,
    discountRate: DiscountRate,
  ): Promise<DiscountRate> {
    return await this.discountRateModel
      .findByIdAndUpdate(id, discountRate, { new: true })
      .exec();
  }

  async deleteDiscountRate(id: string): Promise<any> {
    return await this.discountRateModel.findByIdAndRemove(id).exec();
  }
}

//TerminalGrowthRates Service
@Injectable()
export class TerminalGrowthRatesService {
  constructor(
    @InjectModel('terminalGrowthRate')
    private readonly growthRateModel: Model<TerminalGrowthRateDocument>,
  ) {}

  async createGrowthRate(growthRate: object): Promise<TerminalGrowthRate> {
    try {
      return await this.growthRateModel.create(growthRate);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getGrowthRates(): Promise<TerminalGrowthRate[]> {
    return await this.growthRateModel.find().exec();
  }
  async updateGrowthRate(
    id: string,
    growthRate: TerminalGrowthRate,
  ): Promise<TerminalGrowthRate> {
    return await this.growthRateModel
      .findByIdAndUpdate(id, growthRate, { new: true })
      .exec();
  }

  async deleteGrowthRate(id: string): Promise<any> {
    return await this.growthRateModel.findByIdAndRemove(id).exec();
  }
}

//COEMethods Service
@Injectable()
export class COEMethodsService {
  constructor(
    @InjectModel('coeMethod')
    private readonly coeMethodModel: Model<COEMethodDocument>,
  ) {}

  async createCOEMethod(coeMethod: object): Promise<COEMethod> {
    try {
      return await this.coeMethodModel.create(coeMethod);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getCOEMethods(): Promise<COEMethod[]> {
    return await this.coeMethodModel.find().exec();
  }
  async getCOEMethodById(id: string): Promise<COEMethod> {
    return await this.coeMethodModel.findById(id);
  }
  async updateCOEMethod(id: string, coeMethod: COEMethod): Promise<COEMethod> {
    return await this.coeMethodModel
      .findByIdAndUpdate(id, coeMethod, { new: true })
      .exec();
  }

  async deleteCOEMethod(id: string): Promise<any> {
    return await this.coeMethodModel.findByIdAndRemove(id).exec();
  }
}

//RiskFreeRates Service
@Injectable()
export class RiskFreeRatesService {
  constructor(
    @InjectModel('riskFreeRate')
    private readonly riskFreeRateModel: Model<RiskFreeRateDocument>,
  ) {}

  async createRiskFreeRate(riskFreeRate: object): Promise<RiskFreeRate> {
    try {
      return await this.riskFreeRateModel.create(riskFreeRate);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getRiskFreeRates(): Promise<RiskFreeRate[]> {
    return await this.riskFreeRateModel.find().exec();
  }
  async getRiskFreeRateById(id: string): Promise<RiskFreeRate> {
    return await this.riskFreeRateModel.findById(id);
  }
  async updateRiskFreeRate(
    id: string,
    riskFreeRate: RiskFreeRate,
  ): Promise<RiskFreeRate> {
    return await this.riskFreeRateModel
      .findByIdAndUpdate(id, riskFreeRate, { new: true })
      .exec();
  }

  async deleteRiskFreeRate(id: string): Promise<any> {
    return await this.riskFreeRateModel.findByIdAndRemove(id).exec();
  }
}

//ExpMarketReturns Service
@Injectable()
export class ExpMarketReturnsService {
  constructor(
    @InjectModel('expMarketReturn')
    private readonly expMarketReturnModel: Model<ExpMarketReturnDocument>,
  ) {}

  async createExpMarketReturn(
    expMarketReturn: object,
  ): Promise<ExpMarketReturn> {
    try {
      return await this.expMarketReturnModel.create(expMarketReturn);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getExpMarketReturns(): Promise<ExpMarketReturn[]> {
    return await this.expMarketReturnModel.find().exec();
  }
  async getExpMarketReturnById(id: string): Promise<ExpMarketReturn> {
    return await this.expMarketReturnModel.findById(id);
  }
  async updateExpMarketReturn(
    id: string,
    expMarketReturn: ExpMarketReturn,
  ): Promise<ExpMarketReturn> {
    return await this.expMarketReturnModel
      .findByIdAndUpdate(id, expMarketReturn, { new: true })
      .exec();
  }

  async deleteExpReturn(id: string): Promise<any> {
    return await this.expMarketReturnModel.findByIdAndRemove(id).exec();
  }
}

//Beta Service
@Injectable()
export class BetaService {
  constructor(
    @InjectModel('beta') private readonly betaModel: Model<BetaDocument>,
  ) {}

  async createBeta(beta: object): Promise<Beta> {
    try {
      return await this.betaModel.create(beta);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getBetas(): Promise<Beta[]> {
    return await this.betaModel.find().exec();
  }
  async getBetaById(id: string): Promise<Beta> {
    return await this.betaModel.findById(id);
  }
  async updateBeta(id: string, beta: Beta): Promise<Beta> {
    return await this.betaModel
      .findByIdAndUpdate(id, beta, { new: true })
      .exec();
  }

  async deleteBeta(id: string): Promise<any> {
    return await this.betaModel.findByIdAndRemove(id).exec();
  }
}

//Risk Premium Service
@Injectable()
export class RiskPremiumService {
  constructor(
    @InjectModel('riskPremium')
    private readonly riskPremiumModel: Model<RiskPremiumDocument>,
  ) {}

  async createRiskPremium(riskPremium: object): Promise<RiskPremium> {
    try {
      return await this.riskPremiumModel.create(riskPremium);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getRiskPremiums(): Promise<RiskPremium[]> {
    return await this.riskPremiumModel.find().exec();
  }
  async getRiskPremiumById(id: string): Promise<RiskPremium> {
    return await this.riskPremiumModel.findById(id);
  }
  async updateRiskPremium(
    id: string,
    riskPremium: RiskPremium,
  ): Promise<RiskPremium> {
    return await this.riskPremiumModel
      .findByIdAndUpdate(id, riskPremium, { new: true })
      .exec();
  }

  async deleteRiskPremium(id: string): Promise<any> {
    return await this.riskPremiumModel.findByIdAndRemove(id).exec();
  }
}

//Cost of Preference Share Capital Service
@Injectable()
export class COPShareCapitalService {
  constructor(
    @InjectModel('copShareCapital')
    private readonly copShareCapitalModel: Model<COPShareCapitalDocument>,
  ) {}

  async createCOPShareCapital(
    copShareCapital: object,
  ): Promise<COPShareCapital> {
    try {
      return await this.copShareCapitalModel.create(copShareCapital);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getCOPShareCapitals(): Promise<COPShareCapital[]> {
    return await this.copShareCapitalModel.find().exec();
  }
  async updateCOPShareCapital(
    id: string,
    copShareCapital: COPShareCapital,
  ): Promise<COPShareCapital> {
    return await this.copShareCapitalModel
      .findByIdAndUpdate(id, copShareCapital, { new: true })
      .exec();
  }

  async deleteCOPShareCapital(id: string): Promise<any> {
    return await this.copShareCapitalModel.findByIdAndRemove(id).exec();
  }
}

//Cost of Debt Service
@Injectable()
export class CODService {
  constructor(
    @InjectModel('costOfDebt') private readonly codModel: Model<CODDocument>,
  ) {}

  async createCOD(cod: object): Promise<COD> {
    try {
      return await this.codModel.create(cod);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getCOD(): Promise<COD[]> {
    return await this.codModel.find().exec();
  }
  async getCODById(id: string): Promise<COD> {
    return await this.codModel.findById(id);
  }
  async updateCOD(id: string, cod: COD): Promise<COD> {
    return await this.codModel.findByIdAndUpdate(id, cod, { new: true }).exec();
  }

  async deleteCOD(id: string): Promise<any> {
    return await this.codModel.findByIdAndRemove(id).exec();
  }
}

//Capital Structure Service
@Injectable()
export class CapitalStructureService {
  constructor(
    @InjectModel('capitalStructure')
    private readonly capitalStructureModel: Model<CapitalStructureDocument>,
  ) {}

  async createCapitalStructure(
    capitalStructure: object,
  ): Promise<CapitalStructure> {
    try {
      return await this.capitalStructureModel.create(capitalStructure);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getCapitalStructure(): Promise<CapitalStructure[]> {
    return await this.capitalStructureModel.find().exec();
  }
  async getCapitalStructureById(id: string): Promise<CapitalStructure> {
    return await this.capitalStructureModel.findById(id);
  }
  async updateCapitalStructure(
    id: string,
    capitalStructure: CapitalStructure,
  ): Promise<CapitalStructure> {
    return await this.capitalStructureModel
      .findByIdAndUpdate(id, capitalStructure, { new: true })
      .exec();
  }

  async deleteCapitalStructure(id: string): Promise<any> {
    return await this.capitalStructureModel.findByIdAndRemove(id).exec();
  }
}

//Proportion of Preference Share Capital Service
@Injectable()
export class POPShareCapitalService {
  constructor(
    @InjectModel('popShareCapital')
    private readonly popShareCapitalModel: Model<POPShareCapitalDocument>,
  ) {}

  async createPOPShareCapital(
    popShareCapital: object,
  ): Promise<POPShareCapital> {
    try {
      return await this.popShareCapitalModel.create(popShareCapital);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }
  async getPOPShareCapitals(): Promise<POPShareCapital[]> {
    return await this.popShareCapitalModel.find().exec();
  }
  async updatePOPShareCapital(
    id: string,
    popShareCapital: POPShareCapital,
  ): Promise<POPShareCapital> {
    return await this.popShareCapitalModel
      .findByIdAndUpdate(id, popShareCapital, { new: true })
      .exec();
  }

  async deletePOPShareCapital(id: string): Promise<any> {
    return await this.popShareCapitalModel.findByIdAndRemove(id).exec();
  }
}
