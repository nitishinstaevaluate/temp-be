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
  rate: number;
}
export class CreateExpMarketReturnDto {
  marketReturn: string;
  rate: number;
}
export class CreateBetaDto {
  beta: string;
  rate: number;
}
export class CreateRiskPremiumDto {
  riskPremium: number;
}
export class CreateCOPShareCapitalDto {
  label: string;
  cost: number;
}
//Cost of Debt Dto
export class CreateCODDto {
  fieldLabel: string;
  fieldValue: string;
}
//Capital Structure Dto
export class CreateCapitalStructureDto {
  fieldLabel: string;
  fieldValue: string;
}
