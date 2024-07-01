import { IsAlpha, IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, ValidationOptions, isBoolean } from 'class-validator';

export class postSensitivityAnalysisDto {
    @IsNotEmpty({ message: 'processStateId cannot be empty' })
    @IsString({ message: 'processStateId is required' })
    processStateId: string;

    @IsNotEmpty({ message: 'primaryReportId cannot be empty' })
    @IsString({ message: 'primaryReportId is required' })
    primaryReportId: string;

    @IsOptional()
    @IsString({ message: 'secondaryReportId should be string' })
    secondaryReportId?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'selectedReportId cannot be empty' })
    @IsString({ message: 'selectedReportId is required' })
    selectedReportId?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'terminalValueType cannot be empty' })
    @IsString({ message: 'terminalValueType is required' })
    terminalSelectionType?: string;

    @IsNotEmpty({ message: 'userId cannot be empty' })
    @IsString({ message: 'userId is required' })
    userId: string;

    @IsArray({ message: 'Industry aggregate list must be an array' })
    @ValidateNested({ each: true })
    primaryValuation: [];

    @IsOptional()
    @IsArray({ message: 'Industry aggregate list must be an array' })
    @ValidateNested({ each: true })
    secondaryValuation?: [];
  }