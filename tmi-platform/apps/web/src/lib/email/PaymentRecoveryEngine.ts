import BillingEmailEngine from '@/lib/email/BillingEmailEngine';

export type PaymentRecoveryStage =
  | 'payment-failed'
  | 'grace-reminder'
  | 'final-warning'
  | 'restriction-notice'
  | 'recovery-success';

export interface PaymentRecoveryCase {
  id: string;
  userId: string;
  email: string;
  tier: string;
  attempts: number;
  stage: PaymentRecoveryStage;
  recoveryLink: string;
  graceEndsAt: number;
  recovered: boolean;
  updatedAt: number;
}

const recoveryCases = new Map<string, PaymentRecoveryCase>();

function nextRecoveryId(): string {
  return `recovery-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

export class PaymentRecoveryEngine {
  static startRecovery(input: {
    userId: string;
    email: string;
    tier: string;
    recoveryLink: string;
    gracePeriodDays?: number;
  }): PaymentRecoveryCase {
    const record: PaymentRecoveryCase = {
      id: nextRecoveryId(),
      userId: input.userId,
      email: normalize(input.email),
      tier: input.tier,
      attempts: 1,
      stage: 'payment-failed',
      recoveryLink: input.recoveryLink,
      graceEndsAt: Date.now() + (input.gracePeriodDays ?? 7) * 24 * 60 * 60 * 1000,
      recovered: false,
      updatedAt: Date.now(),
    };

    recoveryCases.set(record.id, record);
    BillingEmailEngine.sendPaymentFailedNotice({
      userId: record.userId,
      to: record.email,
      amount: 'pending balance',
      recoveryLink: record.recoveryLink,
    });

    return record;
  }

  static advanceStage(recoveryId: string): PaymentRecoveryCase | null {
    const existing = recoveryCases.get(recoveryId);
    if (!existing || existing.recovered) return existing ?? null;

    const nextStage: PaymentRecoveryStage =
      existing.stage === 'payment-failed'
        ? 'grace-reminder'
        : existing.stage === 'grace-reminder'
        ? 'final-warning'
        : existing.stage === 'final-warning'
        ? 'restriction-notice'
        : 'restriction-notice';

    const next: PaymentRecoveryCase = {
      ...existing,
      attempts: existing.attempts + 1,
      stage: nextStage,
      updatedAt: Date.now(),
    };
    recoveryCases.set(recoveryId, next);

    BillingEmailEngine.sendPaymentFailedNotice({
      userId: next.userId,
      to: next.email,
      amount: next.stage,
      recoveryLink: next.recoveryLink,
    });
    return next;
  }

  static markRecovered(recoveryId: string): PaymentRecoveryCase | null {
    const existing = recoveryCases.get(recoveryId);
    if (!existing) return null;

    const next: PaymentRecoveryCase = {
      ...existing,
      stage: 'recovery-success',
      recovered: true,
      updatedAt: Date.now(),
    };
    recoveryCases.set(recoveryId, next);

    BillingEmailEngine.sendReceipt({
      userId: next.userId,
      to: next.email,
      invoiceId: `recovery-${recoveryId}`,
      amount: 'recovered account balance',
    });
    return next;
  }

  static listRecoveries(): PaymentRecoveryCase[] {
    return Array.from(recoveryCases.values());
  }
}

export default PaymentRecoveryEngine;
