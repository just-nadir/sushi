import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class TelegramLoginDto {
    @IsString()
    @IsNotEmpty()
    telegramId: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    phone?: string;
}
