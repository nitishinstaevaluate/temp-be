import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, ValidateNested } from "class-validator";

export class ExcelArchiveDto {
    @IsNotEmpty({ message: 'companyId cannot be empty' })
    @IsString({ message: 'filename is required' })
    fileName: string;
    
    @IsNotEmpty({ message: 'sheetName cannot be empty' })
    @IsString({ message: 'sheetName should be string' })
    sheetName: string;
    
    @IsNotEmpty({ message: 'rowCount cannot be empty' })
    @IsNumber({}, { message: 'rowCount should be a number' })
    rowCount: number;
    
    @IsNotEmpty({ message: 'fileSize cannot be empty' })
    @IsString({ message: 'fileSize should be string' })
    fileSize: string;
    
    @IsNotEmpty({ message: 'fileType cannot be empty' })
    @IsString({ message: 'fileType should be string' })
    fileType: string;
    
    @IsNotEmpty({ message: 'importedBy cannot be empty' })
    @IsString({ message: 'importedBy should be string' })
    importedBy: string;


    @IsNotEmpty({ message: 'status cannot be empty' })
    @IsString({ message: 'status should be string' })
    status: string;
    
    @IsArray({ message: 'excel data must be an array' })
    @ValidateNested({ each: true })
    data: [];
  }