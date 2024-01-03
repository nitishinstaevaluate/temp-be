import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsNumber, IsString, ArrayNotEmpty, IsBoolean, ValidateNested, isNotEmpty, IsAlphanumeric, IsArray, isString, IsObject, isNumber } from 'class-validator';

export class ElevenUaDTO {
    @IsNotEmpty()
    @IsString()
    company:string;

    @IsNotEmpty()
    valuationDate:number;

    @IsNotEmpty()
    @IsString()
    location:string;

    @IsNotEmpty()
    @IsArray()
    model:Array<String>;

    @IsNotEmpty()
    @IsString()
    excelSheetId:string;

    @IsNotEmpty()
    @IsString()
    outstandingShares:string;

    @IsNotEmpty()
    @IsString()
    currencyUnit:string;

    @IsNotEmpty()
    @IsString()
    reportingUnit:string;

    @IsOptional()
    @IsString()
    fileName:string;

    @IsOptional()
    @IsString()
    fairValueJewellery:string;

    @IsOptional()
    @IsString()
    fairValueImmovableProp:string;

    @IsOptional()
    @IsString()
    fairValueinvstShareSec:string;

    @IsOptional()
    @IsString()
    otherThanAscertainLiability:string;

    @IsOptional()
    @IsString()
    contingentLiability:string;

    @IsOptional()
    @IsString()
    status:string;
  }

  export class FetchElevenUaDto {
    @Expose({name:'_id'})
    _id:String;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    bookValueOfAllAssets:number;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    totalIncomeTaxPaid:number;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    unamortisedAmountOfDeferredExpenditure:Number;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    bookValueOfLiabilities:String;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    paidUpCapital:number;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    paymentDividends:number;

    @Expose()
    @IsNotEmpty()
    @IsNumber() 
    reserveAndSurplus:number;

    @Expose()
    @IsNotEmpty()
    @IsNumber()
    provisionForTaxation:number;

    @Expose()
    @IsOptional()
    @IsString()
    userId:String;

    @Expose()
    @IsOptional()
    @IsObject()
    inputData:object;
  }