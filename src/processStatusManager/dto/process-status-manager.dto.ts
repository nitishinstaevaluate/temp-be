import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsNumber, IsString, ArrayNotEmpty, IsBoolean, ValidateNested } from 'class-validator';

export class FirstStageInputDTO {
    @IsOptional()
    @IsString()
    company: string;

    @IsOptional()
    @IsString()
    valuationDate: string;

    @IsOptional()
    @IsNumber()
    projectionYears: number;

    @IsOptional()
    @IsString()
    industry: string;

    @IsOptional()
    @IsString()
    location: string;

    @IsOptional()
    @IsString()
    subIndustry: string;

    @IsOptional()
    @ArrayNotEmpty()
    @IsString({ each: true })
    model: string[];

    @IsOptional()
    @IsString()
    excelSheetId: string;

    @IsOptional()
    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    outstandingShares: string;

    @IsOptional()
    @IsString()
    taxRate: string;

    @IsOptional()
    @IsString()
    taxRateType: string;

    @IsOptional()
    @IsString()
    terminalGrowthRate: string;

    @IsOptional()
    @IsString()
    discountRateType: string;

    @IsOptional()
    @IsNumber()
    discountRateValue: number;

    @IsOptional()
    @IsString()
    reportingUnit: string;

    @IsOptional()
    @IsString()
    currencyUnit: string;

    @IsOptional()
    @IsString()
    modifiedExcelSheetId: string;

    @IsOptional()
    @IsBoolean()
    isExcelModified: boolean = false;

    @IsOptional()
    @ArrayNotEmpty()
    betaIndustry: [];

    @IsOptional()
    @ArrayNotEmpty()
    preferenceCompanies: [];

    @IsOptional()
    @ArrayNotEmpty()
    industriesRatio: [];
}
export class AlphaDTO {
    @IsString()
    companySize: string;
  
    @IsString()
    marketPosition: string;
  
    @IsString()
    liquidityFactor: string;
  
    @IsString()
    competition: string;
  }

export class FcfeInputDTO {
    @IsOptional()
    @IsString()
    discountRate: string;
  
    @IsOptional()
    @IsString()
    discountingPeriod: string;
  
    @IsOptional()
    @IsString()
    betaType: string;
  
    @IsOptional()
    @IsString()
    coeMethod: string;
  
    @IsOptional()
    @IsNumber()
    riskFreeRate: number;
  
    @IsOptional()
    @IsString()
    expMarketReturnType: string;
  
    @IsOptional()
    @IsNumber()
    expMarketReturn: number;
  
    @IsOptional()
    @IsBoolean()
    specificRiskPremium: boolean;
  
    @IsOptional()
    @IsNumber()
    beta: number;
  
    @IsOptional()
    @IsNumber()
    riskPremium: number;
  
    @IsOptional()
    @ValidateNested()
    @Type(() => AlphaDTO)
    alpha: AlphaDTO;
  }
export class ExcessEarningInputDTO {
    @IsOptional()
    @IsString()
    discountRate: string;
  
    @IsOptional()
    @IsString()
    discountingPeriod: string;
  
    @IsOptional()
    @IsString()
    betaType: string;
  
    @IsOptional()
    @IsString()
    coeMethod: string;
  
    @IsOptional()
    @IsNumber()
    riskFreeRate: number;
  
    @IsOptional()
    @IsString()
    expMarketReturnType: string;
  
    @IsOptional()
    @IsNumber()
    expMarketReturn: number;
  
    @IsOptional()
    @IsBoolean()
    specificRiskPremium: boolean;
  
    @IsOptional()
    @IsNumber()
    beta: number;
  
    @IsOptional()
    @IsNumber()
    riskPremium: number;
  
    @IsOptional()
    @ValidateNested()
    @Type(() => AlphaDTO)
    alpha: AlphaDTO;
  }

  export class FcffInputDTO {
    @IsOptional()
    @IsString()
    discountRate: string;
  
    @IsOptional()
    @IsString()
    discountingPeriod: string;
  
    @IsOptional()
    @IsString()
    betaType: string;
  
    @IsOptional()
    @IsString()
    coeMethod: string;
  
    @IsOptional()
    @IsNumber()
    riskFreeRate: number;
  
    @IsOptional()
    @IsString()
    expMarketReturnType: string;
  
    @IsOptional()
    @IsNumber()
    expMarketReturn: number;
  
    @IsOptional()
    @IsBoolean()
    specificRiskPremium: boolean;
  
    @IsOptional()
    @IsNumber()
    beta: number;
  
    @IsOptional()
    @IsNumber()
    riskPremium: number;
  
    @IsOptional()
    @ValidateNested()
    @Type(() => AlphaDTO)
    alpha: AlphaDTO;
  
    @IsOptional()
    @IsString()
    capitalStructureType: string;
  
    @IsOptional()
    @IsString()
    costOfDebt: string;
  
    @IsOptional()
    @IsString()
    copShareCapital: string;
  }

  export class NavInputDTO {
    @IsOptional()
    @IsString()
    fixedAsset: string;
  
    @IsOptional()
    @IsString()
    longTermLoansAdvances: string;
  
    @IsOptional()
    @IsString()
    nonCurrentInvestment: string;
  
    @IsOptional()
    @IsString()
    deferredTaxAsset: string;
  
    @IsOptional()
    @IsString()
    inventories: string;
  
    @IsOptional()
    @IsString()
    shortTermLoanAdvances: string;
  
    @IsOptional()
    @IsString()
    tradeReceivables: string;
  
    @IsOptional()
    @IsString()
    cash: string;
  
    @IsOptional()
    @IsString()
    otherCurrentAssets: string;
  
    @IsOptional()
    @IsString()
    shortTermProvisions: string;
  
    @IsOptional()
    @IsString()
    shortTermBorrowings: string;
  
    @IsOptional()
    @IsString()
    tradePayables: string;
  
    @IsOptional()
    @IsString()
    otherCurrentLiabilities: string;
  
    @IsOptional()
    @IsString()
    lessLongTermBorrowings: string;
  
    @IsOptional()
    @IsString()
    lessLongTermProvisions: string;
  
    @IsOptional()
    @IsString()
    shareApplicationMoney: string;
  }

export class SecondStageInputDTO {
    @ValidateNested()
    @Type(() => FcfeInputDTO)
    fcfeInput: FcfeInputDTO;
  
    @ValidateNested()
    @Type(() => FcffInputDTO)
    fcffInput: FcffInputDTO;
  
    @ValidateNested()
    @Type(() => ExcessEarningInputDTO)
    excessEarningInput: ExcessEarningInputDTO;
  
    @ValidateNested()
    @Type(() => NavInputDTO)
    navInput: NavInputDTO;
  }

  export class ThirdStageInputDTO {
    @IsOptional()
    appData:[];

    @IsOptional()
    @IsString()
    otherAdj:String;
    
    @IsOptional()
    @IsBoolean()
    isExcelModified: boolean = false;
  
    @IsOptional()
    @IsString()
    modifiedExcelSheetId: string;
  }

  export class TotalWeightageModelDTO {
    @IsOptional()
    @IsString()
    weightedVal:String;
    
    @IsOptional()
    @ArrayNotEmpty()
    modelValue: [];

  }

  export class FourthStageInputDTO {
    @IsOptional()
    @IsString()
    valuationResultReportId:String;
    
    @ValidateNested()
    @IsOptional()
    @Type(() => TotalWeightageModelDTO)
    totalWeightageModel:TotalWeightageModelDTO;
  }

  export class FifthStageInputDTO {
    @IsOptional()
    @IsString()
    clientName:string;

    @IsOptional()
    @IsString()
    reportDate:string;

    @IsOptional()
    @IsString()
    useExistingValuer:string;
    
    @IsOptional()
    @IsString()
    appointingAuthorityName:string;

    @IsOptional()
    @IsString()
    dateOfAppointment:string;

    @IsOptional()
    @IsString()
    reportPurpose:string;

    @IsOptional()
    @ArrayNotEmpty()
    reportSection:[];

    @IsOptional()
    @IsString()
    natureOfInstrument:string;

    @IsOptional()
    @IsString()
    registeredValuerName:string;
    
    @IsOptional()
    @IsString()
    registeredValuerEmailId:string;
    
    @IsOptional()
    @IsString()
    registeredValuerIbbiId:string;
    
    @IsOptional()
    @IsString()
    registeredValuerMobileNumber:string;
    
    @IsOptional()
    @IsString()
    registeredValuerGeneralAddress:string;
    
    @IsOptional()
    @IsString()
    registeredValuerCorporateAddress:string;
    
    @IsOptional()
    @IsString()
    registeredvaluerDOIorConflict:string;
    
    @IsOptional()
    @IsString()
    registeredValuerQualifications:string;
    
    @IsOptional()
    @IsString()
    reportId:string;

    @IsOptional()
    @ArrayNotEmpty()
    finalWeightedAverage:[];
  }

export class ProcessStatusManagerDTO {
    @IsNotEmpty()
    firstStageInput: FirstStageInputDTO;

    @IsOptional()
    secondStageInput: [];

    @IsOptional()
    @IsNotEmpty()
    thirdStageInput: ThirdStageInputDTO;

    @IsOptional()
    @IsNotEmpty()
    fourthStageInput:FourthStageInputDTO;
    @IsOptional()
    @IsNotEmpty()
    fifthStageInput:FifthStageInputDTO;

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsNumber()
    step: number;
}