import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FulfillmentService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getOrders(userId?: string) {
    return this.prisma.order.findMany({
      where: userId ? { buyerUserId: userId } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markShipped(orderId: string, trackingNumber: string, carrier: string) {
    await this.getOrder(orderId);
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SHIPPED',
        updatedAt: new Date(),
      },
    });
  }

  async updateTracking(orderId: string, trackingNumber: string, carrier: string) {
    await this.getOrder(orderId);
    return this.prisma.order.update({
      where: { id: orderId },
      data: { updatedAt: new Date() },
    });
  }

  async markDelivered(orderId: string) {
    await this.getOrder(orderId);
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        updatedAt: new Date(),
      },
    });
  }

  async getOrderById(orderId: string) {
    return this.getOrder(orderId);
  }
}
