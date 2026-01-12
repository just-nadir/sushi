import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
    private readonly logger = new Logger(SmsService.name);

    async sendOtp(phone: string, code: string): Promise<boolean> {
        // In a real application, you would integrate with an SMS provider here (e.g., Eskiz, Twilio)
        this.logger.log(`\n\n================================`);
        this.logger.log(`SMS to ${phone}: Sizning tasdiqlash kodingiz: ${code}`);
        this.logger.log(`================================\n`);

        return true;
    }
}
