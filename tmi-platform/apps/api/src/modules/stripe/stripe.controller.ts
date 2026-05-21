import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  Query,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly stripe: StripeService) {}

  // POST /stripe/checkout — create a checkout session
  @Post('checkout')
  async createCheckout(@Body() body: {
    priceId: string;
    mode?: 'payment' | 'subscription';
    quantity?: number;
    userId?: string;
    successUrl?: string;
    cancelUrl?: string;
  }) {
    if (!body.priceId) throw new BadRequestException('priceId is required');
    const origin = process.env.WEB_ORIGIN ?? 'https://themusiciansindex.com';
    const session = await this.stripe.createCheckoutSession({
      priceId: body.priceId,
      mode: body.mode ?? 'payment',
      quantity: body.quantity ?? 1,
      userId: body.userId,
      successUrl: body.successUrl ?? `${origin}/shop?success=1`,
      cancelUrl: body.cancelUrl ?? `${origin}/shop?canceled=1`,
    });
    return { checkoutUrl: session.url, sessionId: session.id };
  }

  // GET /stripe/products — list active Stripe products
  @Get('products')
  async listProducts() {
    return this.stripe.listProducts();
  }

  // GET /stripe/prices — list active Stripe prices
  @Get('prices')
  async listPrices() {
    return this.stripe.listPrices();
  }

  // GET /stripe/customer — get or create Stripe customer for a user
  @Get('customer')
  async getCustomer(@Query('userId') userId: string, @Query('email') email: string) {
    if (!userId || !email) throw new BadRequestException('userId and email are required');
    return this.stripe.getOrCreateCustomer(email, userId);
  }

  // POST /stripe/webhook — Stripe-signed webhook endpoint
  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'];
    if (!sig || typeof sig !== 'string') {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    // raw body must be provided as Buffer (configured in main.ts)
    const rawBody: Buffer = (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from([]);

    const isValid = this.stripe.verifyWebhookSignature(rawBody, sig);
    if (!isValid) {
      this.logger.warn('Stripe webhook signature verification failed');
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    let event: { type: string; data: { object: Record<string, unknown> } };
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }

    try {
      await this.stripe.handleWebhookEvent(event);
    } catch (err) {
      this.logger.error('Webhook handler error', err);
      // Still respond 200 to prevent Stripe from retrying an unhandled event type
    }

    res.status(200).json({ received: true });
  }
}
