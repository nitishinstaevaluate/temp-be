import { IsAlpha, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, isBoolean } from 'class-validator';
import { Expose,} from 'class-transformer';

  export class CiqsimpleindustryDto {
    @Expose({name:'_id'})
    _id:string;
  
    @IsNotEmpty()
    @IsString()
    @Expose()
    simpleindustryid: string;
  
    @IsOptional()
    @IsString()
    @Expose()
    simpleindustrydescription: string;
  }

  export class CiqindustryhierarchyDto {
    @Expose({name:'_id'})
    _id:string;
  
    @IsNotEmpty()
    @IsNumber()
    @Expose()
    subTypeId: number;
  
    @IsOptional()
    @IsNumber()
    @Expose()
    GIC: number;
  
    @IsOptional()
    @IsString()
    @Expose()
    GICSDescriptor: string;
  
    @IsOptional()
    @IsNumber()
    @Expose()
    childLevel: number;
  
    @IsOptional()
    @IsNumber()
    @Expose()
    subParentId: number;
  }
  
  export class CiqIndustryListDto {
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    COMPANYID: number;
  
    @Expose()
    @IsString()
    COMPANYNAME: string;
  
    @Expose()
    @IsNumber()
    SIMPLEINDUSTRYID: number;
  
    @Expose()
    @IsString()
    SIMPLEINDUSTRYDESCRIPTION: string;

    @Expose()
    @IsString()
    CITY: string;
  }

  export class CiqSegmentDescriptionDto {
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    COMPANYID: number;

    @Expose()
    @IsString()
    @IsNotEmpty()
    SEGMENTDESCRIPTION: string;
  }