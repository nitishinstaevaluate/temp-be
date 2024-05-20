import { IsAlpha, IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, ValidationOptions, isBoolean } from 'class-validator';
import { Expose, Type,} from 'class-transformer';

  export class CiqsimpleindustryDto {
    @Expose({name:'_id'})
    _id:string;
  
    @IsNotEmpty()
    @IsString()
    @Expose()
    simpleindustryid: string;
  
    @IsOptional()
    @IsString()
    @Expose()
    simpleindustrydescription: string;
  }

  export class CiqindustryhierarchyDto {
    @Expose({name:'_id'})
    _id:string;
  
    @IsNotEmpty()
    @IsNumber()
    @Expose()
    subTypeId: number;
  
    @IsOptional()
    @IsNumber()
    @Expose()
    GIC: number;
  
    @IsOptional()
    @IsString()
    @Expose()
    GICSDescriptor: string;
  
    @IsOptional()
    @IsNumber()
    @Expose()
    childLevel: number;
  
    @IsOptional()
    @IsNumber()
    @Expose()
    subParentId: number;
  }
  
  export class CiqIndustryListDto {
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    COMPANYID: number;
  
    @Expose()
    @IsString()
    COMPANYNAME: string;
  
    // @Expose()
    // @IsNumber()
    // SIMPLEINDUSTRYID: number;
  
    @Expose()
    @IsString()
    SIMPLEINDUSTRYDESCRIPTION: string;

    @Expose()
    @IsString()
    CITY: string;
    
    @Expose()
    @IsNumber()
    MARKETCAP: number;

    @Expose()
    @IsNumber()
    SHARESOUTSTANDING: number;

    @Expose()
    @IsNumber()
    SALESVALUE: number;

    @Expose()
    @IsNumber()
    EBITDAVALUE: number;

    // @Expose()
    // @IsString()
    // PRICINGDATE: number;
  }

  export class CiqSegmentDescriptionDto {
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    COMPANYID: number;

    @Expose()
    @IsString()
    @IsNotEmpty()
    SEGMENTDESCRIPTION: string;
  }

  export class ciqGetFinancialDto {
    @IsNotEmpty({ message: 'Valuation date cannot be empty' })
    @IsString({ message: 'Valuation date should be of format mm/dd/yyyy and must be string' })
    valuationDate: string;

    @IsArray({ message: 'Industry aggregate list must be an array' })
    @ValidateNested({ each: true })
    industryAggregateList: [];
  }

  export class ciqUpdateCompaniesDto {
    @IsNotEmpty({ message: 'Valuation date cannot be empty' })
    valuationDate: string;

    @IsArray({ message: 'Industry aggregate list must be an array' })
    @ValidateNested({ each: true })
    industryAggregateList: [];
  }

  export class ciqGetStockBetaDto {
    @IsNotEmpty({ message: 'valuationDate cannot be empty' })
    @IsNumber({}, { message: 'valuationDate should be a number eg.1703961000000' })
    valuationDate: number;

    @IsNotEmpty({ message: 'companyId cannot be empty' })
    @IsNumber({}, { message: 'companyId should be a number eg.874487' })
    companyId: number;
  }

  export class ciqGetMarketBetaDto {
    @IsNotEmpty({ message: 'beta sub type cannot be empty' })
    @IsString({ message: 'beta sub type is required eg.meanBeta,medianBeta' })
    betaSubType: string;

    @IsNotEmpty({ message: 'beta type cannot be empty' })
    @IsString({ message: 'beta type is required eg.levered,unlevered' })
    betaType: string;

    @IsNotEmpty({ message: 'Tax rate cannot be empty' })
    @IsString({ message: 'tax rate is required' })
    taxRate: string;

    @IsArray({ message: 'Industry aggregate list must be an array' })
    @ValidateNested({ each: true })
    industryAggregateList: [];
  }

  export class ciqGetCompanyMeanMedianDto {
    @IsNotEmpty({ message: 'ratio type cannot be empty' })
    @IsString({ message: 'ratio type is required eg.Company based' })
    ratioType: string;

    @IsArray({ message: 'Industry aggregate list must be an array' })
    @ValidateNested({ each: true })
    industryAggregateList: [];

    @IsNotEmpty({ message: 'valuationDate cannot be empty' })
    @IsNumber({}, { message: 'valuationDate should be a number eg.1703961000000' })
    valuationDate: number;
  }

  export class BetaMeanMedianDto {
    @IsNotEmpty({ message: 'betaType cannot be empty' })
    @IsString({ message: 'betaType is required eg.meanBeta or medianBeta' })
    betaType: string;

    @IsOptional()
    @IsNotEmpty({ message: 'debtToCapital cannot be empty' })
    @IsNumber({}, { message: 'debtToCapital should be a number' })
    debtToCapital?: number;

    @IsOptional()
    @IsNotEmpty({ message: 'equityToCapital cannot be empty' })
    @IsNumber({}, { message: 'equityToCapital should be a number' })
    equityToCapital?: number;

    @IsOptional()
    leveredBeta?: number;

    @IsOptional()
    @IsNotEmpty({ message: 'unleveredBeta cannot be empty' })
    @IsNumber({}, { message: 'unleveredBeta should be a number' })
    unleveredBeta?: number;
}

  export class CoreBetaWorkingDto {
    @IsNotEmpty({ message: 'companyId cannot be empty' })
    @IsNumber({}, { message: 'companyId should be a number' })
    companyId: number;
    
    @IsNotEmpty({ message: 'companyName cannot be empty' })
    @IsString({ message: 'companyName should be string' })
    companyName: string;
    
    @IsOptional()
    @IsNotEmpty({ message: 'totalBookValueOfDebt cannot be empty' })
    @IsNumber({}, { message: 'totalBookValueOfDebt should be a number' })
    totalBookValueOfDebt?: number;
    
    @IsOptional()
    @IsNotEmpty({ message: 'totalBookValueOfPreferredEquity cannot be empty' })
    @IsNumber({}, { message: 'totalBookValueOfPreferredEquity should be a number' })
    totalBookValueOfPreferredEquity?: number;
    
    @IsOptional()
    @IsNotEmpty({ message: 'totalMarketValueOfEquity cannot be empty' })
    @IsNumber({}, { message: 'totalMarketValueOfEquity should be a number' })
    totalMarketValueOfEquity?: number;
    
    @IsOptional()
    @IsNotEmpty({ message: 'totalMarketValueOfCapital cannot be empty' })
    @IsNumber({}, { message: 'totalMarketValueOfCapital should be a number' })
    totalMarketValueOfCapital?: number;
    
    @IsOptional()
    @IsNotEmpty({ message: 'debtToCapital cannot be empty' })
    @IsNumber({}, { message: 'debtToCapital should be a number' })
    debtToCapital?: number;
    
    @IsOptional()
    @IsNotEmpty({ message: 'equityToCapital cannot be empty' })
    @IsNumber({}, { message: 'equityToCapital should be a number' })
    equityToCapital?: number;
    
    @IsOptional()
    @IsNotEmpty({ message: 'unleveredBeta cannot be empty' })
    @IsNumber({}, { message: 'unleveredBeta should be a number' })
    unleveredBeta?: number;
    
    @IsOptional()
    leveredBeta?: number;
  }

  export class betaWorkingDto {
    @IsArray({ message: 'coreBetaWorking must be an array' })
    @ValidateNested({ each: true })
    @Type(() => CoreBetaWorkingDto)
    coreBetaWorking: CoreBetaWorkingDto[];
    
    @IsArray({ message: 'betaMeanMedianWorking must be an array' })
    @ValidateNested({ each: true })
    @Type(() => BetaMeanMedianDto)
    betaMeanMedianWorking: BetaMeanMedianDto[];

    @IsNotEmpty({ message: 'processIdentifierId cannot be empty' })
    @IsNumber({}, { message: 'processIdentifierId should be a number' })
    processIdentifierId: number;
  }