export class SendOtpDto {
    phone: string;
}

export class VerifyOtpDto {
    phone: string;
    code: string;
    telegramId?: string;
    username?: string;
    fullName?: string;
}

export class RegisterDto {
    phone: string;
    fullName: string;
    telegramId?: string;
    username?: string;
}
