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
    valuationDate: number;

    @IsArray({ message: 'Industry aggregate list must be an array' })
    @ValidateNested({ each: true })
    industryAggregateList: [];
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
  }