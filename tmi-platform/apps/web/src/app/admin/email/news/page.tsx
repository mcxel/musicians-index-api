import PlatformNewsEngine from '@/lib/email/PlatformNewsEngine';
import Link from 'next/link';

export default function AdminEmailNewsPage() {
  if (PlatformNewsEngine.listNews().length === 0) {
    PlatformNewsEngine.publishNews({
      title: 'Season Update',
      summary: 'Season boards and artist ranking updates are now live.',
      link: '/news',
    });
  }
  const items = PlatformNewsEngine.listNews();

  return (
    <main style={{ minHeight: '100vh', padding: 24, background: '#050510', color: '#fff' }}>
      <Link href="/admin/email" style={{ color: '#00FFFF', textDecoration: 'none' }}>
        ← Admin Email
      </Link>
      <h1 style={{ marginTop: 12 }}>News Email Lane</h1>
      <p>Platform news, rule updates, feature launches, and announcement sends.</p>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            marginTop: 10,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div>{item.title}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>{item.summary}</div>
        </div>
      ))}
    </main>
  );
}
