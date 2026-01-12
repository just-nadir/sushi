import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VerifyOtpDto {
    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    telegramId: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    fullName?: string;
}
