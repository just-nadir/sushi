import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../common/services/sms.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private otpStore = new Map<string, { code: string, expires: number }>();

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private smsService: SmsService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findFirst({ where: { username } });

        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            // Exclude password from result
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async validateTelegramUser(telegramId: string): Promise<any> {
        return this.prisma.user.findUnique({ where: { telegramId } });
    }

    async sendOtp(phone: string): Promise<void> {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        // Expires in 5 minutes
        this.otpStore.set(phone, { code, expires: Date.now() + 5 * 60 * 1000 });
        await this.smsService.sendOtp(phone, code);
    }

    async verifyOtp(phone: string, code: string): Promise<boolean> {
        const entry = this.otpStore.get(phone);
        if (!entry) return false;
        if (entry.expires < Date.now()) {
            this.otpStore.delete(phone);
            return false;
        }
        if (entry.code !== code) return false;

        this.otpStore.delete(phone);
        return true;
    }

    async registerTelegramUser(dto: any): Promise<any> {
        if (dto.phone) {
            const existingUser = await this.prisma.user.findFirst({ where: { phone: dto.phone } });
            if (existingUser) {
                return this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { telegramId: dto.telegramId }
                });
            }
        }

        return this.prisma.user.create({
            data: {
                telegramId: dto.telegramId,
                username: dto.username || `user_${dto.telegramId}`,
                fullName: dto.fullName || 'Foydalanuvchi',
                phone: dto.phone,
                role: 'CUSTOMER'
            }
        });
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
