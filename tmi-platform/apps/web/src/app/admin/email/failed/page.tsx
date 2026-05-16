import EmailFailureEngine from '@/lib/email/EmailFailureEngine';
import Link from 'next/link';

export default function AdminEmailFailedPage() {
  const failures = EmailFailureEngine.listFailures();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <Link href="/admin/email" style={{ color: '#00FFFF', textDecoration: 'none' }}>
        ← Admin Email
      </Link>
      <h1 style={{ marginTop: 12 }}>Failed Email Queue</h1>
      <p>Failures, retries, and escalations for email delivery.</p>
      {failures.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,0.65)' }}>No failures logged yet.</p>
      )}
      {failures.map((item) => (
        <div
          key={item.id}
          style={{
            marginTop: 10,
            border: '1px solid rgba(255,80,80,0.35)',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div>{item.email}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            {item.templateKey} | attempts: {item.attempts} | escalated:{' '}
            {item.escalated ? 'yes' : 'no'}
          </div>
        </div>
      ))}
    </main>
  );
}
