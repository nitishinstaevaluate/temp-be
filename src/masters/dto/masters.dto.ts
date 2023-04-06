export class CreateIndustryDto {
    industry: string;
  }

  export class CreateValuationMethodDto {
    method: string;
  }
  export class CreateTaxRateDto {
    name: string;
    rate:string;
  }
  export class CreateDiscountRateDto {
    name: string;
    rate:string;
  }
  export class CreateTerminalGrowthRateDto {
    rate:number;
  }
  export class CreateCOEMethodDto {
    method:string;
  }
  export class CreateRiskFreeRateDto {
    label:string;
    rate:number;
  }
  export class CreateExpMarketReturnDto {
    marketReturn:string;
    rate:number;
  }
  export class CreateBetaDto {
    beta:string;
    rate:number;
  }
  export class CreateRiskPremiumDto {
    riskPremium:number;
  }
  export class CreateCOPShareCapitalDto {
    label:string;
    cost:number;
  }
  