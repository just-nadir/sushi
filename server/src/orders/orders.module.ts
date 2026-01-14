import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { TelegramBotService } from '../common/services/telegram-bot.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway, TelegramBotService],
})
export class OrdersModule { }
