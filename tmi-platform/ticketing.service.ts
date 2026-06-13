import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketingService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(skuId: string, userId: string, tier: 'vip' | 'standard', price: number, seatId?: string) {
    try {
      // Generate checkout session linked to the specific 3D Venue SKU and Tier
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `TMI 3D Venue Ticket - ${skuId} (${tier.toUpperCase()})`,
                metadata: {
                  skuId,
                  tier,
                  seatId: seatId || 'unreserved',
                },
              },
              unit_amount: price, // Stripe uses cents e.g., 5000 = $50.00
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          skuId,
          tier,
          seatId: seatId || 'unreserved',
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&sku=${skuId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?sku=${skuId}`,
      });

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      console.error('Stripe Session Error:', error);
      throw new InternalServerErrorException('Failed to generate secure ticketing checkout session');
    }
  }
}