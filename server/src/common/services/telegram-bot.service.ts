import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TelegramBotService implements OnModuleInit {
    private bot: Telegraf;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
    ) {
        const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (token) {
            this.bot = new Telegraf(token);
        }
    }

    async onModuleInit() {
        if (!this.bot) return;

        this.bot.command('start', (ctx) => {
            ctx.reply(`Sizning ID: ${ctx.chat.id}\nBu ID ni sozlamalarga kiriting.`);
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

        this.bot.launch().then(() => {
            console.log('Telegram Bot started');
        }).catch(err => {
            console.error('Bot launch error:', err);
        });

        // Graceful stop
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
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
            await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
        } catch (error) {
            console.error('Failed to send Telegram notification:', error);
        }
    }
}
