import NewsSubscriptionEngine from '@/lib/email/NewsSubscriptionEngine';
import Link from 'next/link';

export default function NewsSubscribePage() {
  const subscription = NewsSubscriptionEngine.upsertSubscription({
    userId: 'fan-smoke',
    email: 'fan-smoke@example.com',
    updates: {
      news: true,
      promos: true,
      'artist-alerts': true,
      'venue-alerts': true,
      'event-alerts': true,
    },
  });

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1>News Subscription Activated</h1>
      <p>{subscription.email} is subscribed to platform and alert channels.</p>
      <Link href="/account/notifications" style={{ color: '#00FFFF', textDecoration: 'none' }}>
        Open Notification Preferences
      </Link>
    </main>
  );
}
