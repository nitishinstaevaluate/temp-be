export class ValuationDto {
  company: string;
  model: string;
  provisionalDate: Date;
  valuation:any;
  inputData:object;
  valuationData: object;
  userId: string;
}

export class TerminalValueWorkingDto {
  freeCashFlow: number;
  terminalGrowthRate: number;
  costOfEquity: number;
  terminalYearValue: number;
  pvFactor: number;
  pvTerminalValue: number;
}

export class PostMainValuationDto {
  reportId: string;
  valuationResult: [];
}

export class PostDcfValuationDto {
  model: string;
  valuationData: [];
  valuation: [];
  terminalYearWorking: object;
  columnHeader: [];
  provisionalDate: any;
}
