import NewsSubscriptionEngine from '@/lib/email/NewsSubscriptionEngine';
import Link from 'next/link';

export default function AccountNotificationsPage() {
  const preferences =
    NewsSubscriptionEngine.getPreferences('fan-smoke') ??
    NewsSubscriptionEngine.upsertSubscription({
      userId: 'fan-smoke',
      email: 'fan-smoke@example.com',
    });

  const entries = Object.entries(preferences.channels);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Notification Preferences</h1>
      <p style={{ color: 'rgba(255,255,255,0.72)' }}>
        Billing, security, ticketing, and account notifications are always required.
      </p>

      <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
        {entries.map(([channel, enabled]) => (
          <div
            key={channel}
            style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: 10 }}
          >
            {channel}: {enabled ? 'enabled' : 'disabled'}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/news/subscribe" style={{ color: '#00FFFF', textDecoration: 'none' }}>
          Subscribe
        </Link>
        <Link href="/news/unsubscribe" style={{ color: '#FF2DAA', textDecoration: 'none' }}>
          Unsubscribe
        </Link>
      </div>
    </main>
  );
}
