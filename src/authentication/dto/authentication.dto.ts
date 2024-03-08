import { IsNotEmpty, IsString, IsArray, ValidateNested } from "class-validator";

export class KCloginAuthDto {
    @IsNotEmpty({ message: 'userName cannot be empty' })
    @IsString({ message: 'userName should be string' })
    userName: string;
    
    @IsNotEmpty({ message: 'password cannot be empty' })
    @IsString({ message: 'password should be string' })
    password: string;
  }