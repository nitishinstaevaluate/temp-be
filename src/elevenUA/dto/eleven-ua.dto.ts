import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsNumber, IsString, ArrayNotEmpty, IsBoolean, ValidateNested } from 'class-validator';

export class ElevenUaDTO {
    @IsOptional()
    @IsString()
    valuationResultReportId:String;
  }
