import { IsAlpha, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBetaIndustryDto {
  industry: string;
  noOfFirms: number;
  beta: string;
  deRatio: number;
  effectiveTaxRate: string;
  unleveredBeta: number;
  cashFirmValue: string;
  unleveredBetaCash: string;
  hiloRisk: string;
  stdEquity: string;
  stdOprIncome: string;
  betaAv: number;
}

export class PurposeOfReportDto {
  @IsAlpha()
  @IsNotEmpty()
  reportObjective:string

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReportDetailsDto)
  reportPurpose: ReportDetailsDto[];

  @IsOptional()
  createdAt?: Date;
}

export class ReportDetailsDto {
  @IsNotEmpty()
  srNo: number;

  @IsOptional()
  section?: string;

  @IsOptional()
  Description?: string;
}
