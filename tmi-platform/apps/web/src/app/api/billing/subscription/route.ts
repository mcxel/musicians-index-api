export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export async function GET(req: NextRequest) {
  const email = req.cookies.get('tmi_user_email')?.value;
  const tier  = req.cookies.get('tmi_tier')?.value ?? 'FREE';

  const stripe = getStripe();
  if (!stripe || !email) {
    return NextResponse.json({ plan: null, paymentMethod: null, invoices: [], tier });
  }

  try {
    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) {
      return NextResponse.json({ plan: null, paymentMethod: null, invoices: [], tier });
    }

    // Active subscription
    const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'active', limit: 1, expand: ['data.default_payment_method'] });
    const sub = subs.data[0] ?? null;

    let plan = null;
    let paymentMethod = null;

    if (sub) {
      const item = sub.items.data[0];
      const price = item?.price;
      const product = typeof price?.product === 'string'
        ? await stripe.products.retrieve(price.product)
        : price?.product as { name?: string } | null;

      plan = {
        name: (product as { name?: string } | null)?.name ?? 'TMI Subscription',
        price: price?.unit_amount ? price.unit_amount / 100 : 0,
        interval: price?.recurring?.interval ?? 'month',
        nextBillingDate: typeof (sub as unknown as Record<string, unknown>).current_period_end === 'number'
          ? formatDate((sub as unknown as Record<string, number>).current_period_end)
          : 'N/A',
        status: sub.status,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      };

      // Payment method from subscription or customer default
      const pm = typeof sub.default_payment_method === 'object' && sub.default_payment_method !== null
        ? sub.default_payment_method
        : null;

      if (pm && 'card' in pm && pm.card) {
        paymentMethod = {
          brand: pm.card.brand ?? 'card',
          last4: pm.card.last4 ?? '????',
          expiry: `${pm.card.exp_month}/${String(pm.card.exp_year).slice(-2)}`,
        };
      }
    }

    // Recent invoices
    const invoiceList = await stripe.invoices.list({ customer: customer.id, limit: 10 });
    const invoices = invoiceList.data.map((inv) => ({
      id: inv.id,
      date: inv.created ? formatDate(inv.created) : '',
      amount: inv.amount_paid / 100,
      status: inv.status ?? 'paid',
      desc: inv.lines.data[0]?.description ?? 'TMI Subscription',
      pdfUrl: inv.invoice_pdf ?? null,
    }));

    return NextResponse.json({ plan, paymentMethod, invoices, tier });
  } catch (err) {
    console.error('[billing/subscription]', err);
    return NextResponse.json({ plan: null, paymentMethod: null, invoices: [], tier }, { status: 500 });
  }
}
