export class CreateIndustryDto {
  industry: string;
}

export class CreateValuationMethodDto {
  fieldLabel: string;
  fieldValue: string;
}
export class CreateTaxRateDto {
  label: string;
  type: string;
}
export class CreateDiscountRateDto {
  discountRate: string;
}
export class CreateTerminalGrowthRateDto {
  rate: number;
}
export class CreateCOEMethodDto {
  fieldLabel: string;
  fieldValue: string;
}
export class CreateRiskFreeRateDto {
  label: string;
  type: string;
}
export class CreateExpMarketReturnDto {
  label: string;
  type: string;
}
export class CreateBetaDto {
  label: string;
  type: string;
}
export class CreateRiskPremiumDto {
  riskPremium: number;
}
export class CreateCOPShareCapitalDto {
  label: string;
  type: string;
}
//Cost of Debt Dto
export class CreateCODDto {
  label: string;
  type: string;
}
//Capital Structure Dto
export class CreateCapitalStructureDto {
  label: string;
  type: string;
}
//Proportion of Preference Share Capital Dto
export class CreatePOPShareCapitalDto {
  label: string;
  type: string;
}