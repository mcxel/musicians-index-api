/**
 * Focused assertion: checkout metadata.plan must match account family
 * (FAN vs PERFORMER) for Pro CTAs — entitlement still uses priceId → tier.
 */
import { STRIPE_PRODUCTS } from '../lib/stripe/products';
import {
  resolveCheckoutMetadataPlan,
  tierForPriceId,
} from '../lib/stripe/tierMapping';

describe('checkout metadata.plan account family', () => {
  it('Performer Pro TEST priceId → metadata.plan PERFORMER (not FAN)', () => {
    const priceId = STRIPE_PRODUCTS.PERFORMER_PRO_MONTHLY.priceId;
    expect(priceId).toBe('price_1UAj28EAwH1Fjtu9eB1IOCcN');
    expect(resolveCheckoutMetadataPlan(priceId, 'TMI Performer Pro')).toBe('PERFORMER');
    expect(tierForPriceId(priceId)).toBe('PRO');
  });

  it('Fan Pro TEST priceId → metadata.plan FAN', () => {
    const priceId = STRIPE_PRODUCTS.FAN_PRO_MONTHLY.priceId;
    expect(priceId).toBe('price_1UAj28EAwH1Fjtu9zQ4dTJv2');
    expect(resolveCheckoutMetadataPlan(priceId, 'TMI Fan Pro')).toBe('FAN');
    expect(tierForPriceId(priceId)).toBe('PRO');
  });

  it('LIVE Pro twins keep distinct account plans (never swap TEST↔LIVE globally)', () => {
    expect(resolveCheckoutMetadataPlan('price_1TcJnFEAwH1Fjtu98MhoEGqG')).toBe('FAN');
    expect(resolveCheckoutMetadataPlan('price_1TcKDBEAwH1Fjtu9fyPClyCM')).toBe('PERFORMER');
    expect(tierForPriceId('price_1TcJnFEAwH1Fjtu98MhoEGqG')).toBe('PRO');
    expect(tierForPriceId('price_1TcKDBEAwH1Fjtu9fyPClyCM')).toBe('PRO');
  });

  it('productName PERFORMER wins when priceId is unknown placeholder', () => {
    expect(
      resolveCheckoutMetadataPlan('price_performer_pro_unknown', 'TMI+Performer+Pro'),
    ).toBe('PERFORMER');
    expect(resolveCheckoutMetadataPlan('price_fan_pro_unknown', 'TMI+Fan+Pro')).toBe('FAN');
  });
});
