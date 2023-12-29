import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsNumber, IsString, ArrayNotEmpty, IsBoolean, ValidateNested, isNotEmpty, IsAlphanumeric, IsArray, isString } from 'class-validator';

export class ElevenUaDTO {
    @IsNotEmpty()
    @IsString()
    company:String;

    @IsNotEmpty()
    valuationDate:Number;

    @IsNotEmpty()
    @IsString()
    location:String;

    @IsNotEmpty()
    @IsArray()
    model:Array<String>;

    @IsNotEmpty()
    @IsString()
    excelSheetId:String;

    @IsNotEmpty()
    @IsString()
    outstandingShares:String;

    @IsNotEmpty()
    @IsString()
    currencyUnit:String;

    @IsNotEmpty()
    @IsString()
    reportingUnit:String;

    @IsOptional()
    @IsString()
    fileName:String;

    @IsOptional()
    @IsString()
    fairValueJewellery:String;

    @IsOptional()
    @IsString()
    fairValueImmovableProp:String;

    @IsOptional()
    @IsString()
    fairValueinvstShareSec:String;

    @IsOptional()
    @IsString()
    contingentLiability:String;

    @IsOptional()
    @IsString()
    status:String;
  }