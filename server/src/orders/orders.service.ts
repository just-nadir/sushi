import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from './orders.gateway';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersGateway: OrdersGateway
  ) { }

  async create(createOrderDto: CreateOrderDto) {
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

    return order;
  }

  findAll(phone?: string) {
    return this.prisma.order.findMany({
      where: phone ? { customerPhone: phone } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
        user: true
      }
    });
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
