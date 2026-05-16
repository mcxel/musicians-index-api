import NewsSubscriptionEngine from '@/lib/email/NewsSubscriptionEngine';
import Link from 'next/link';

export default function AdminEmailSubscribersPage() {
  if (NewsSubscriptionEngine.listSubscribers().length === 0) {
    NewsSubscriptionEngine.upsertSubscription({
      userId: 'fan-smoke',
      email: 'fan-smoke@example.com',
      updates: { promos: true, news: true },
    });
  }

  const subscribers = NewsSubscriptionEngine.listSubscribers();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <Link href="/admin/email" style={{ color: '#00FFFF', textDecoration: 'none' }}>
        ← Admin Email
      </Link>
      <h1 style={{ marginTop: 12 }}>Email Subscribers</h1>
      <p>Subscription preferences and unsubscribe-aware delivery visibility.</p>
      {subscribers.map((subscriber) => (
        <div
          key={subscriber.userId}
          style={{
            marginTop: 10,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div>{subscriber.email}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            News: {subscriber.channels.news ? 'on' : 'off'} | Promos:{' '}
            {subscriber.channels.promos ? 'on' : 'off'}
          </div>
        </div>
      ))}
    </main>
  );
}
