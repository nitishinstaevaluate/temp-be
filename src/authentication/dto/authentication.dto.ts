import { Expose } from "class-transformer";
import { IsNotEmpty, IsString, IsArray, ValidateNested } from "class-validator";

export class KCloginAuthDto {
    @IsNotEmpty({ message: 'userName cannot be empty' })
    @IsString({ message: 'userName should be string' })
    userName: string;
    
    @IsNotEmpty({ message: 'password cannot be empty' })
    @IsString({ message: 'password should be string' })
    password: string;
  }

export class authTokenDto {
    @IsNotEmpty({ message: 'sessionState cannot be empty' })
    @IsString({ message: 'sessionState should be string' })
    sessionState: string;
    
    @IsNotEmpty({ message: 'accessToken cannot be empty' })
    @IsString({ message: 'accessToken should be string' })
    accessToken: string;

    @IsNotEmpty({ message: 'refreshToken cannot be empty' })
    @IsString({ message: 'refreshToken should be string' })
    refreshToken: string;
  }
  
export class authUserDto {
    @Expose()
    @IsString()
    @IsNotEmpty()
    session_state: string;
    
    @Expose()
    @IsString()
    @IsNotEmpty()
    given_name: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    email: string;
  }