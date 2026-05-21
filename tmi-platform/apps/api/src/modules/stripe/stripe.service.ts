import { Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly secretKey = process.env.STRIPE_SECRET_KEY ?? '';
  private readonly webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

  constructor(private readonly prisma: PrismaService) {}

  // ─── Raw Stripe API helper ─────────────────────────────────────────────────

  private async stripeRequest<T = unknown>(
    path: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, string>,
  ): Promise<T> {
    const url = `${STRIPE_API_BASE}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
      'Stripe-Version': '2024-04-10',
    };
    let bodyString: string | undefined;
    if (body) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      bodyString = new URLSearchParams(body).toString();
    }
    const res = await fetch(url, { method, headers, body: bodyString });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Stripe API ${method} ${path} → ${res.status}: ${err}`);
    }
    return res.json() as Promise<T>;
  }

  // ─── Checkout Session ──────────────────────────────────────────────────────

  async createCheckoutSession(params: {
    priceId: string;
    mode: 'payment' | 'subscription';
    quantity?: number;
    userId?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }) {
    const body: Record<string, string> = {
      'line_items[0][price]': params.priceId,
      'line_items[0][quantity]': String(params.quantity ?? 1),
      mode: params.mode,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    };
    if (params.userId) {
      body['client_reference_id'] = params.userId;
    }
    if (params.metadata) {
      for (const [k, v] of Object.entries(params.metadata)) {
        body[`metadata[${k}]`] = v;
      }
    }
    return this.stripeRequest<{ id: string; url: string }>('/checkout/sessions', 'POST', body);
  }

  // ─── Products & Prices ─────────────────────────────────────────────────────

  async listProducts() {
    return this.stripeRequest<{ data: unknown[] }>('/products?active=true&limit=100');
  }

  async listPrices() {
    return this.stripeRequest<{ data: unknown[] }>('/prices?active=true&limit=100');
  }

  // ─── Customer ──────────────────────────────────────────────────────────────

  async getOrCreateCustomer(email: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (user?.stripeCustomerId) return { id: user.stripeCustomerId };

    const customer = await this.stripeRequest<{ id: string }>('/customers', 'POST', {
      email,
      metadata_user_id: userId,
    });
    await this.prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customer.id } });
    return customer;
  }

  // ─── Webhook Signature Verification ────────────────────────────────────────

  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature check');
      return true;
    }
    try {
      const parts = signature.split(',').reduce<Record<string, string>>((acc, part) => {
        const [k, v] = part.split('=');
        acc[k] = v;
        return acc;
      }, {});
      const timestamp = parts['t'];
      const sigV1 = parts['v1'];
      if (!timestamp || !sigV1) return false;

      const payload = `${timestamp}.${rawBody.toString('utf8')}`;
      const expected = createHmac('sha256', this.webhookSecret).update(payload).digest('hex');
      const expectedBuf = Buffer.from(expected, 'hex');
      const receivedBuf = Buffer.from(sigV1, 'hex');
      if (expectedBuf.length !== receivedBuf.length) return false;
      return timingSafeEqual(expectedBuf, receivedBuf);
    } catch {
      return false;
    }
  }

  // ─── Webhook Event Handlers ────────────────────────────────────────────────

  async handleWebhookEvent(event: { type: string; data: { object: Record<string, unknown> } }) {
    this.logger.log(`Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.onSubscriptionChange(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.onInvoicePaymentSucceeded(event.data.object);
        break;
      case 'product.created':
      case 'product.updated':
        await this.syncProduct(event.data.object);
        break;
      case 'price.created':
      case 'price.updated':
        await this.syncPrice(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }

  private async onCheckoutCompleted(session: Record<string, unknown>) {
    const paymentIntentId = session['payment_intent'] as string | undefined;
    const userId = session['client_reference_id'] as string | undefined;
    const amountTotal = session['amount_total'] as number | undefined;
    const currency = session['currency'] as string | undefined;
    const mode = session['mode'] as string | undefined;

    if (!paymentIntentId && mode === 'payment') return;

    // Persist order record
    await this.prisma.order.create({
      data: {
        buyerUserId: userId ?? null,
        provider: 'STRIPE',
        providerPaymentId: paymentIntentId ?? (session['id'] as string),
        currency: currency?.toUpperCase() ?? 'USD',
        amountCents: amountTotal ?? 0,
        status: 'PAID',
      },
    });

    // For subscriptions, sync subscription object
    if (mode === 'subscription' && session['subscription']) {
      const subId = session['subscription'] as string;
      await this.syncSubscriptionById(subId, userId);
    }
  }

  private async onSubscriptionChange(sub: Record<string, unknown>) {
    const subId = sub['id'] as string;
    const status = sub['status'] as string;
    const userId = (sub['metadata'] as Record<string, string> | undefined)?.['user_id'];

    if (!subId || !status) return;

    await this.prisma.subscription
      .update({
        where: { id: subId },
        data: { status: status as never },
      })
      .catch(() => {
        this.logger.warn(`Subscription ${subId} not found for update`);
      });
  }

  private async onInvoicePaymentSucceeded(invoice: Record<string, unknown>) {
    const subId = invoice['subscription'] as string | undefined;
    if (subId) {
      await this.syncSubscriptionById(subId);
    }
  }

  private async syncSubscriptionById(subId: string, fallbackUserId?: string) {
    try {
      const sub = await this.stripeRequest<Record<string, unknown>>(`/subscriptions/${subId}`);
      await this.syncSubscription(sub, fallbackUserId);
    } catch (err) {
      this.logger.error(`Failed to sync subscription ${subId}:`, err);
    }
  }

  private async syncSubscription(sub: Record<string, unknown>, fallbackUserId?: string) {
    const priceId = ((sub['items'] as Record<string, unknown>)?.['data'] as Array<Record<string, unknown>>)?.[0]?.['price']?.['id'] as string | undefined;
    const userId = (sub['metadata'] as Record<string, string> | undefined)?.['user_id'] ?? fallbackUserId;
    if (!userId || !priceId) return;

    const now = new Date();
    await this.prisma.subscription.upsert({
      where: { id: sub['id'] as string },
      create: {
        id: sub['id'] as string,
        userId,
        status: sub['status'] as never,
        priceId,
        cancelAtPeriodEnd: (sub['cancel_at_period_end'] as boolean) ?? false,
        created: new Date((sub['created'] as number) * 1000),
        currentPeriodStart: new Date(((sub['current_period_start'] as number) ?? Math.floor(now.getTime() / 1000)) * 1000),
        currentPeriodEnd: new Date(((sub['current_period_end'] as number) ?? Math.floor(now.getTime() / 1000)) * 1000),
        metadata: sub['metadata'] as never ?? {},
      },
      update: {
        status: sub['status'] as never,
        cancelAtPeriodEnd: (sub['cancel_at_period_end'] as boolean) ?? false,
        currentPeriodEnd: new Date(((sub['current_period_end'] as number) ?? 0) * 1000),
      },
    });
  }

  private async syncProduct(product: Record<string, unknown>) {
    await this.prisma.product.upsert({
      where: { id: product['id'] as string },
      create: {
        id: product['id'] as string,
        active: product['active'] as boolean,
        name: product['name'] as string,
        description: (product['description'] as string) ?? null,
        image: ((product['images'] as string[]) ?? [])[0] ?? null,
        metadata: (product['metadata'] as never) ?? {},
      },
      update: {
        active: product['active'] as boolean,
        name: product['name'] as string,
        description: (product['description'] as string) ?? null,
        image: ((product['images'] as string[]) ?? [])[0] ?? null,
      },
    });
  }

  private async syncPrice(price: Record<string, unknown>) {
    const productId = typeof price['product'] === 'string' ? price['product'] : (price['product'] as Record<string, unknown>)?.['id'] as string;
    if (!productId) return;
    // Ensure product exists before upsert (Stripe sometimes sends price before product)
    await this.prisma.product.upsert({
      where: { id: productId },
      create: { id: productId, active: true, name: 'Unknown Product' },
      update: {},
    });
    await this.prisma.price.upsert({
      where: { id: price['id'] as string },
      create: {
        id: price['id'] as string,
        productId,
        active: price['active'] as boolean,
        currency: price['currency'] as string,
        type: price['type'] as string,
        unitAmount: (price['unit_amount'] as number) ?? null,
        interval: (price['recurring'] as Record<string, string> | null)?.['interval'] ?? null,
        metadata: (price['metadata'] as never) ?? {},
      },
      update: {
        active: price['active'] as boolean,
        unitAmount: (price['unit_amount'] as number) ?? null,
      },
    });
  }
}
