import NewsSubscriptionEngine from '@/lib/email/NewsSubscriptionEngine';
import Link from 'next/link';

export default function NewsUnsubscribePage() {
  const updated = NewsSubscriptionEngine.unsubscribe({
    userId: 'fan-smoke',
    email: 'fan-smoke@example.com',
    channels: ['news', 'promos', 'artist-alerts', 'venue-alerts', 'event-alerts'],
  });

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1>Marketing Preferences Updated</h1>
      <p>
        News and promo channels disabled for {updated.email}. Required transactional channels remain
        enabled.
      </p>
      <Link href="/account/notifications" style={{ color: '#00FFFF', textDecoration: 'none' }}>
        Open Notification Preferences
      </Link>
    </main>
  );
}
