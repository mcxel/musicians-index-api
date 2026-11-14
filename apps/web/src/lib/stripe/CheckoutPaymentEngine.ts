/**
 * Universal Checkout Engine for TMI Platform
 * Handles: Automated Payment Collection, Ticketing, Season Passes, and Sponsor Ads.
 */

export interface CheckoutPayload {
  type: 'TICKET' | 'BEAT' | 'SUBSCRIPTION' | 'SPONSORSHIP' | 'TIP';
  itemId: string;
  amountInCents: number;
  /** Required for type: 'TIP' — the real recipient artist slug (not a venueId). */
  artistSlug?: string;
  metadata?: Record<string, string>;
}

export class CheckoutPaymentEngine {

  /**
   * Initiates an automatic payment collection flow via Stripe
   */
  static async triggerCheckout(payload: CheckoutPayload): Promise<void> {
    try {
      console.log(`[CheckoutEngine] Initiating ${payload.type} purchase for ${payload.itemId}`);

      // TIP has its own canonical authority (see TipButton.tsx):
      // POST /api/tips -> tipFulfillment -> stripe webhook grantTipFromStripeSession.
      // It is NOT a /api/stripe/checkout productType and does not accept
      // targetId/priceOverride — it requires a real artistSlug + amount.
      if (payload.type === 'TIP') {
        if (!payload.artistSlug) {
          console.error('[CheckoutEngine] TIP requires artistSlug — no recipient to tip here.');
          return;
        }
        const response = await fetch('/api/tips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            artistSlug: payload.artistSlug,
            amount: payload.amountInCents,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to generate tip checkout session');
        }
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
        return;
      }

      // In production, this targets your existing /api/stripe/checkout endpoint
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType: payload.type,
          targetId: payload.itemId,
          priceOverride: payload.amountInCents,
          ...payload.metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate checkout session');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Native routing forward to Stripe
      }
    } catch (error) {
      console.error('[CheckoutEngine] Payment Automation Error:', error);
    }
  }
}