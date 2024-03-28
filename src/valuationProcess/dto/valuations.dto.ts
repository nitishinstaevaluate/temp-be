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
