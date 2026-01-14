import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);
    private token: string | null = null;

    constructor(private configService: ConfigService) { }

    private async getToken(): Promise<string> {
        if (this.token) return this.token;

        const email = this.configService.get<string>('ESKIZ_EMAIL') || 'abdullayevamalika880@gmail.com';
        const password = this.configService.get<string>('ESKIZ_KEY') || 'KHgkYNJx3wOZaTx6OOJjBlUf9QwrZjWkUAZn7BPQ';

        try {
            // First try verify/login to get token
            const response = await axios.post('https://notify.eskiz.uz/api/auth/login', {
                email,
                password
            });

            this.token = response.data.data.token;
            return this.token!;
        } catch (error: any) {
            this.logger.error('Failed to get Eskiz token', error.message);
            throw new Error('SMS service configuration error');
        }
    }

    async sendOtp(phone: string, code: string): Promise<boolean> {
        try {
            const token = await this.getToken();
            const cleanPhone = phone.replace(/\D/g, '');
            const message = `"Sava Sushi" dasturidan ro'yhatdan o'tish uchun tasdiqlash kodi: ${code}`;

            await axios.post('https://notify.eskiz.uz/api/message/sms/send', {
                mobile_phone: cleanPhone,
                message: message,
                from: '4546', // Standard Eskiz sender ID
                callback_url: ''
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            this.logger.log(`SMS sent to ${phone}`);
            return true;
        } catch (error: any) {
            this.logger.error(`Failed to send SMS to ${phone}`, error.response?.data || error.message);
            // In case token expired, retry logic could be added here (reset token and retry once)
            if (error.response?.status === 401) {
                this.token = null;
                // Simple retry once functionality could be recursive return this.sendOtp(phone, code);
                // But preventing infinite loops is important.
            }
            return false;
        }
    }
}
