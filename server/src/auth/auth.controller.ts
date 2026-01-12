import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramLoginDto } from './dto/telegram-login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        const user = await this.authService.validateUser(body.username, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('telegram')
    async loginTelegram(@Body() dto: TelegramLoginDto) {
        let user = await this.authService.validateTelegramUser(dto.telegramId);

        if (!user) {
            if (dto.phone) {
                // Send OTP instead of registering immediately
                await this.authService.sendOtp(dto.phone);
                return { message: 'OTP_SENT' };
            } else {
                throw new UnauthorizedException('USER_NOT_FOUND');
            }
        }

        return this.authService.login(user);
    }

    @Post('verify')
    async verifyTelegram(@Body() dto: VerifyOtpDto) {
        const isValid = await this.authService.verifyOtp(dto.phone, dto.code);
        if (!isValid) {
            throw new UnauthorizedException('INVALID_OTP');
        }

        // Register user
        const user = await this.authService.registerTelegramUser({
            telegramId: dto.telegramId,
            username: dto.username,
            fullName: dto.fullName,
            phone: dto.phone
        });

        return this.authService.login(user);
    }
}
