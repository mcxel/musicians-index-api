import EmailAuditEngine from '@/lib/email/EmailAuditEngine';
import Link from 'next/link';

export default function AdminEmailAuditPage() {
  const entries = EmailAuditEngine.list(150);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <Link href="/admin/email" style={{ color: '#00FFFF', textDecoration: 'none' }}>
        ← Admin Email
      </Link>
      <h1 style={{ marginTop: 12 }}>Email Audit</h1>
      <p>Every queued, sent, failed, and unsubscribed email event.</p>
      {entries.map((entry) => (
        <div
          key={entry.id}
          style={{
            marginTop: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div>{entry.to}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            {entry.templateKey} | {entry.state} | {entry.channel} | attempt {entry.attempt}
          </div>
        </div>
      ))}
    </main>
  );
}
