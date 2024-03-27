import { Type } from "class-transformer";
import { IsNotEmpty, IsEmail, IsString, ValidateNested, IsBoolean } from "class-validator";

export class CreateUserDto {
    readonly email: string;
    readonly password: string;
  }

  export class credDto {
    @IsNotEmpty({ message: 'value is required eg.sanket@ifinworth.com' })
    @IsString({ message: 'value should be string eg. sanket@ifinworth.com' })
    value: string;

    @IsNotEmpty({ message: 'temporary is required eg.true/false' })
    @IsBoolean()
    temporary: boolean;

    @IsNotEmpty({ message: 'type is required eg.sanket@ifinworth.com' })
    @IsString({ message: 'type should be string eg. sanket@ifinworth.com' })
    type: string
  }

export class KCcreatUserDto{
  @IsNotEmpty({ message: 'username is required eg.sanket@ifinworth.com' })
  @IsString({ message: 'username should be string eg. sanket@ifinworth.com' })
  username: string;

  @IsNotEmpty({ message: 'email is required eg.sanket@ifinworth.com' })
  @IsString({ message: 'email should be string eg. sanket@ifinworth.com' })
  email: string;
  
  @IsNotEmpty({ message: 'firstName is required eg.sanket@ifinworth.com' })
  @IsString({ message: 'firstName should be string eg. sanket@ifinworth.com' })
  firstName: string;
  
  @IsNotEmpty({ message: 'lastName is required eg.sanket@ifinworth.com' })
  @IsString({ message: 'lastName should be string eg. sanket@ifinworth.com' })
  lastName: string;

  @ValidateNested({ message: 'credentials cannot be empty' })
  @IsNotEmpty({ message: 'credentials cannot be empty' })
  @Type(() => credDto) 
  credentials: credDto;
}
export class KCResetPasswordDto{

  @IsNotEmpty({ message: 'email is required eg.sanket@ifinworth.com' })
  @IsString({ message: 'email should be string eg. sanket@ifinworth.com' })
  email: string;
  
  @IsNotEmpty({ message: 'password is required ' })
  @IsString({ message: 'password should be string ' })
  password: string;
}