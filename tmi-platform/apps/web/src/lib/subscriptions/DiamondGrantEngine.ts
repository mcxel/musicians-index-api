import SubscriptionStatusEmailEngine from '@/lib/email/SubscriptionStatusEmailEngine';
import LifetimeEntitlementEngine from '@/lib/subscriptions/LifetimeEntitlementEngine';

export class DiamondGrantEngine {
  static grantLifetimeDiamond(input: {
    userId: string;
    email: string;
    activationLink: string;
    grantSource?: string;
  }) {
    const entitlement = LifetimeEntitlementEngine.grantLifetime({
      userId: input.userId,
      email: input.email,
      tier: 'diamond',
      grantSource: input.grantSource ?? 'admin-manual-grant',
    });

    SubscriptionStatusEmailEngine.sendLifetimePassConfirmation({
      userId: input.userId,
      to: input.email,
      tier: 'Diamond Fan Pass',
      activationLink: input.activationLink,
    });

    return entitlement;
  }
}

export default DiamondGrantEngine;
