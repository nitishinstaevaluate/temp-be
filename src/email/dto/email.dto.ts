import { IsNotEmpty, IsString, IsNumber, IsEmail } from "class-validator";

export class validateDataCheckListDto {
        @IsNotEmpty({ message: 'Date of report is required eg.2024-02-12' })
        @IsString({ message: 'date should be string eg. 2023-03-29' })
        dateOfReport: string;
    
        @IsNotEmpty({ message: 'appointing authority is required eg.Board Of directors' })
        @IsString({ message: 'appointing authority cannot be empty eg.Board Of directors' })
        appointingAuthority: string;

        @IsNotEmpty({ message: 'dateOfAppointment is required eg.2024-02-12' })
        @IsString({ message: 'dateOfAppointment cannot be empty eg.2024-02-12' })
        dateOfAppointment: string;

        @IsNotEmpty({ message: 'cinNumber is required eg.241231231' })
        @IsString({ message: 'cinNumber cannot be empty eg.1231244123' })
        cinNumber: string;

        @IsNotEmpty({ message: 'dateOfIncorporation is required eg.2024-02-12' })
        @IsString({ message: 'dateOfIncorporation cannot be empty eg.2024-02-12' })
        dateOfIncorporation: string;

        @IsNotEmpty({ message: 'companyAddress is required eg.Andheri east' })
        @IsString({ message: 'companyAddress cannot be empty eg.Andheri east' })
        companyAddress: string;

        @IsNotEmpty({ message: 'natureOfInstrument is required eg.Equity Shares' })
        @IsString({ message: 'natureOfInstrument cannot be empty eg.Equity Shares' })
        natureOfInstrument: string;

        @IsNotEmpty({ message: 'purposeOfReport is required eg.Companies act' })
        @IsString({ message: 'purposeOfReport cannot be empty eg.Companies act' })
        purposeOfReport: string;

        @IsNotEmpty({ message: 'taxRate is required eg.25.16' })
        @IsString({ message: 'taxRate cannot be empty eg.25.16' })
        taxRate: string;

        @IsNotEmpty({ message: 'outstandingShares is required eg.11000' })
        @IsString({ message: 'outstandingShares cannot be empty eg.11000' })
        outstandingShares: string;

        @IsNotEmpty({ message: 'valuationDate is required eg.2024-02-12' })
        @IsString({ message: 'valuationDate cannot be empty eg.2024-02-12' })
        valuationDate: string;
}

export class emailDto{
        @IsNotEmpty({ message: 'emailId is required eg.sanket@ifinworth.com' })
        @IsEmail({}, { message: 'emailId should be a valid email address' })
        @IsString({ message: 'emailId should be string eg. sanket@ifinworth.com' })
        emailId: string;

        @IsNotEmpty({ message: 'checkListUrl is required' })
        @IsString({ message: 'checkListUrl should be string' })
        checkListUrl: string;
}