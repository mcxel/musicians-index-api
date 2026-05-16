import DiamondGrantEngine from '@/lib/subscriptions/DiamondGrantEngine';
import LifetimeEntitlementEngine from '@/lib/subscriptions/LifetimeEntitlementEngine';
import Link from 'next/link';

export default function AdminLifetimeSubscriptionsPage() {
  if (LifetimeEntitlementEngine.listLifetimes().length === 0) {
    DiamondGrantEngine.grantLifetimeDiamond({
      userId: 'leeanncoats-79',
      email: 'leeanncoats.79@gmail.com',
      activationLink: '/signup?tier=diamond&grant=lifetime',
      grantSource: 'admin-lifetime-superpass',
    });
    DiamondGrantEngine.grantLifetimeDiamond({
      userId: 'nacoleelmer-143',
      email: 'nacoleelmer143@gmail.com',
      activationLink: '/signup?tier=diamond&grant=lifetime',
      grantSource: 'admin-lifetime-superpass',
    });
  }

  const records = LifetimeEntitlementEngine.listLifetimes();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <Link href="/admin/subscriptions" style={{ color: '#00FFFF', textDecoration: 'none' }}>
        ← Admin Subscriptions
      </Link>
      <h1 style={{ marginTop: 12 }}>Lifetime Subscription Entitlements</h1>
      <p>Permanent pass records protected from accidental downgrade and billing overwrite.</p>

      {records.map((entry) => (
        <div
          key={entry.id}
          style={{
            marginTop: 10,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div>{entry.email}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            Tier: {entry.tier} | Source: {entry.grantSource} | Status: {entry.status}
          </div>
        </div>
      ))}
    </main>
  );
}
