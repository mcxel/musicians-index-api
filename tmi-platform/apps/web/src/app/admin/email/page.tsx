import EmailAuditEngine from '@/lib/email/EmailAuditEngine';
import EmailFailureEngine from '@/lib/email/EmailFailureEngine';
import EmailQueueEngine from '@/lib/email/EmailQueueEngine';
import Link from 'next/link';

export default function AdminEmailPage() {
  const metrics = EmailAuditEngine.getMetrics();
  const queued = EmailQueueEngine.listJobs('queued').length;
  const failed = EmailFailureEngine.listFailures().length;

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>Admin Email Command</h1>
      <p style={{ color: 'rgba(255,255,255,0.7)' }}>
        Central visibility for sent, queued, failed, retried, unsubscribed, and support-linked email
        traffic.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10,
          marginTop: 18,
        }}
      >
        <div style={{ border: '1px solid rgba(0,255,255,0.35)', borderRadius: 8, padding: 10 }}>
          Total {metrics.total}
        </div>
        <div style={{ border: '1px solid rgba(255,215,0,0.35)', borderRadius: 8, padding: 10 }}>
          Queued {queued}
        </div>
        <div style={{ border: '1px solid rgba(255,45,170,0.35)', borderRadius: 8, padding: 10 }}>
          Failed {failed}
        </div>
        <div style={{ border: '1px solid rgba(0,255,136,0.35)', borderRadius: 8, padding: 10 }}>
          Sent {metrics.sent}
        </div>
        <div style={{ border: '1px solid rgba(170,45,255,0.35)', borderRadius: 8, padding: 10 }}>
          Unsubscribed {metrics.unsubscribed}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
        <Link href="/admin/email/billing" style={{ color: '#00FFFF', textDecoration: 'none' }}>
          Billing
        </Link>
        <Link href="/admin/email/news" style={{ color: '#FFD700', textDecoration: 'none' }}>
          News
        </Link>
        <Link href="/admin/email/support" style={{ color: '#FF2DAA', textDecoration: 'none' }}>
          Support
        </Link>
        <Link href="/admin/email/failed" style={{ color: '#FF6B6B', textDecoration: 'none' }}>
          Failed
        </Link>
        <Link href="/admin/email/templates" style={{ color: '#AA2DFF', textDecoration: 'none' }}>
          Templates
        </Link>
        <Link href="/admin/email/subscribers" style={{ color: '#00FF88', textDecoration: 'none' }}>
          Subscribers
        </Link>
        <Link href="/admin/email/audit" style={{ color: '#8EC5FF', textDecoration: 'none' }}>
          Audit
        </Link>
      </div>
    </main>
  );
}
