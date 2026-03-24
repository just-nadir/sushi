import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import axios from 'axios';
import https from 'https';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TelegramBotService implements OnModuleInit {
    private bot: Telegraf;
    private readonly pollingEnabled: boolean;
    private readonly sendTimeoutMs: number;
    private readonly telegramHttpAgent: https.Agent;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) {
        const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
        this.pollingEnabled = this.configService.get<string>('TELEGRAM_BOT_ENABLE_POLLING') !== 'false';
        this.sendTimeoutMs = Number(this.configService.get<string>('TELEGRAM_SEND_TIMEOUT_MS') || 8000);
        // Some hosts intermittently hang on IPv6 when calling Telegram API.
        this.telegramHttpAgent = new https.Agent({ family: 4, keepAlive: true });
        if (token) {
            this.bot = new Telegraf(token);
        }
    }

    async onModuleInit() {
        if (!this.bot) return;

        this.bot.command('start', (ctx) => {
            ctx.reply('Xush kelibsiz! Buyurtma berish uchun quyidagi tugmani bosing 👇', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🛍 Buyurtma berish", web_app: { url: "https://nadpos.uz/tgapp" } }]
                    ]
                }
            });
        });

        this.bot.on('contact', async (ctx) => {
            const contact = ctx.message.contact;
            const telegramId = (contact.user_id || 0).toString();
            if (telegramId === '0') {
                await ctx.reply('Xatolik: ID aniqlanmadi');
                return;
            }
            const phone = contact.phone_number.startsWith('+') ? contact.phone_number : `+${contact.phone_number}`;

            // Check if user exists
            const existingUser = await this.prisma.user.findFirst({
                where: { telegramId }
            });

            if (existingUser) {
                // Update phone if missing or different
                await this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { phone }
                });
            } else {
                // Determine name
                const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');

                // Create user
                await this.prisma.user.create({
                    data: {
                        telegramId,
                        username: `user_${telegramId}`,
                        fullName: fullName || 'Foydalanuvchi',
                        phone,
                        role: 'CUSTOMER'
                    }
                });
            }

            await ctx.reply('Raqamingiz muvaffaqiyatli saqlandi! Ilovaga kirishingiz mumkin.', {
                reply_markup: { remove_keyboard: true }
            });
        });

        if (!this.pollingEnabled) {
            console.log('Telegram polling disabled; sendMessage remains available');
            return;
        }

        this.bot.launch().then(() => {
            console.log('Telegram Bot started');
            // Graceful stop listener only if started
            process.once('SIGINT', () => this.bot.stop('SIGINT'));
            process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
        }).catch((err) => {
            // Polling can fail in multi-instance environments due to getUpdates conflicts.
            // Keep bot instance alive so outgoing notifications still work.
            console.warn('Telegram polling failed; outgoing notifications are still enabled:', err.message);
        });
    }

    async sendOrderNotification(chatId: string, order: any) {
        if (!this.bot) return;

        const itemsList = order.items.map((item: any) =>
            `- ${item.product.name} x${item.quantity} (${(item.price * item.quantity).toLocaleString()} so'm)`
        ).join('\n');

        const message = `
🆕 <b>Yangi Buyurtma #${order.id}</b>

👤 <b>Mijoz:</b> ${order.customerName}
📞 <b>Tel:</b> ${order.customerPhone}
📍 <b>Manzil:</b> ${order.address || 'Belgilanmagan'}
💳 <b>To'lov:</b> ${order.paymentType}

🛒 <b>Buyurtma tarkibi:</b>
${itemsList}

📝 <b>Izoh:</b> ${order.comment || 'Yo\'q'}

💰 <b>Jami: ${order.totalAmount.toLocaleString()} so'm</b>
        `.trim();

        try {
            const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
            if (!token) {
                console.warn('TELEGRAM_BOT_TOKEN missing, skipping Telegram notification');
                return;
            }

            await axios.post(
                `https://api.telegram.org/bot${token}/sendMessage`,
                {
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                },
                {
                    timeout: this.sendTimeoutMs,
                    httpsAgent: this.telegramHttpAgent
                }
            );
        } catch (error) {
            console.error('Failed to send Telegram notification:', error);
        }
    }
}
