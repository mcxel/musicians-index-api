import BillingEmailEngine from '@/lib/email/BillingEmailEngine';
import PaymentRecoveryEngine from '@/lib/email/PaymentRecoveryEngine';
import Link from 'next/link';

export default function AdminEmailBillingPage() {
  if (PaymentRecoveryEngine.listRecoveries().length === 0) {
    PaymentRecoveryEngine.startRecovery({
      userId: 'fan-smoke',
      email: 'fan-smoke@example.com',
      tier: 'diamond',
      recoveryLink: '/account/billing/recover',
    });
    BillingEmailEngine.sendFailedCardNotice({
      userId: 'fan-smoke',
      to: 'fan-smoke@example.com',
      cardLast4: '4242',
      updateCardLink: '/account/billing',
    });
  }

  const recoveries = PaymentRecoveryEngine.listRecoveries();

  return (
    <main style={{ minHeight: '100vh', padding: 24, background: '#050510', color: '#fff' }}>
      <Link href="/admin/email" style={{ color: '#00FFFF', textDecoration: 'none' }}>
        ← Admin Email
      </Link>
      <h1 style={{ marginTop: 12 }}>Billing Email Lane</h1>
      <p>Missed payments, grace reminders, downgrade warnings, and recovery notices.</p>
      {recoveries.map((item) => (
        <div
          key={item.id}
          style={{
            marginTop: 10,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div>{item.email}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            Stage: {item.stage} | Attempts: {item.attempts} | Tier: {item.tier}
          </div>
        </div>
      ))}
    </main>
  );
}
