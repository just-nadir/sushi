import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from './orders.gateway';
import { OrderStatus } from '@prisma/client';
import { TelegramBotService } from '../common/services/telegram-bot.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway,
    private telegramBotService: TelegramBotService
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    // 0. Validate Store Status
    const settings = await this.prisma.setting.findMany({
      where: {
        key: { in: ['work_start', 'work_end', 'break_start', 'break_end', 'store_mode'] }
      }
    });

    const config = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const mode = config['store_mode'] || 'AUTO';

    if (mode === 'CLOSED') {
      throw new BadRequestException("Uzr, do'kon vaqtinchalik yopiq.");
    }

    if (mode !== 'OPEN') { // Check AUTO logic
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      const workStart = config['work_start'] || "09:00";
      const workEnd = config['work_end'] || "23:59";
      const breakStart = config['break_start'] || "20:00";
      const breakEnd = config['break_end'] || "22:00";

      // Check working hours
      let isWorkingHours = false;
      if (workEnd < workStart) {
        isWorkingHours = currentTime >= workStart || currentTime <= workEnd;
      } else {
        isWorkingHours = currentTime >= workStart && currentTime <= workEnd;
      }

      if (!isWorkingHours) {
        throw new BadRequestException(`Uzr, ish vaqti tugadi (${workStart}-${workEnd}).`);
      }

      // Check break time
      let isBreakTime = false;
      if (breakEnd < breakStart) {
        isBreakTime = currentTime >= breakStart || currentTime <= breakEnd;
      } else {
        isBreakTime = currentTime >= breakStart && currentTime <= breakEnd;
      }

      if (isBreakTime) {
        throw new BadRequestException(`Uzr, hozir tanaffus (${breakStart}-${breakEnd}).`);
      }
    }

    // 1. Calculate Total Amount
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of createOrderDto.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (product) {
        totalAmount += product.price * item.quantity;
        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      }
    }

    // Delivery Fee Logic
    let deliveryPrice = 0;
    if (createOrderDto.type === 'DELIVERY') {
      const deliverySetting = await this.prisma.setting.findUnique({ where: { key: 'delivery_price' } });
      if (deliverySetting?.value) {
        deliveryPrice = parseFloat(deliverySetting.value);
        totalAmount += deliveryPrice;
      }
    }

    // 2. Create Order
    const order = await this.prisma.order.create({
      data: {
        type: createOrderDto.type,
        address: createOrderDto.address,
        locationLat: createOrderDto.locationLat,
        locationLon: createOrderDto.locationLon,
        comment: createOrderDto.comment,
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone,
        paymentType: createOrderDto.paymentType,
        totalAmount,
        deliveryPrice,
        status: OrderStatus.NEW,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    // Notify Admins via Socket
    // this.ordersGateway.server.emit('newOrder', order); // Move to Controller or use EventEmmiter

    this.ordersGateway.emitNewOrder(order);

    // Notify Admin via Telegram
    try {
      const adminSetting = await this.prisma.setting.findUnique({ where: { key: 'admin_chat_id' } });
      if (adminSetting?.value) {
        const chatIds = adminSetting.value.split(',').map(id => id.trim()).filter(Boolean);
        await Promise.all(chatIds.map(chatId =>
          this.telegramBotService.sendOrderNotification(chatId, order)
        ));
      }
    } catch (e) {
      console.error("Failed to notify telegram", e);
    }

    return order;
  }

  async findAll(phone?: string) {
    const fs = require('fs');
    fs.appendFileSync('debug.log', `OrdersService.findAll called with phone: ${phone}\n`);
    try {
      const orders = await this.prisma.order.findMany({
        where: phone ? { customerPhone: { contains: phone } } : {},
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: true } },
          user: true
        }
      });
      fs.appendFileSync('debug.log', `OrdersService.findAll result count: ${orders.length}\n`);
      return orders;
    } catch (error) {
      fs.appendFileSync('debug.log', `OrdersService.findAll PRISMA ERROR: ${error}\n`);
      console.error("OrdersService.findAll PRISMA ERROR:", error);
      throw error;
    }
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
    });
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true } } }
    });

    this.ordersGateway.emitOrderStatusUpdate(order);
    return order;
  }

  // Standard update method from partial dto
  async update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.updateStatus(id, updateOrderDto.status as OrderStatus);
  }

  remove(id: number) {
    return this.prisma.order.delete({ where: { id } });
  }
}
