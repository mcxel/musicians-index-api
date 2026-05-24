import EmailAuditEngine from '@/lib/email/EmailAuditEngine';
import EmailFailureEngine from '@/lib/email/EmailFailureEngine';
import EmailQueueEngine from '@/lib/email/EmailQueueEngine';
import { EmailProviderEngine } from '@/lib/email/EmailProviderEngine';
import Link from 'next/link';
import AdminEmailBlast from '@/components/admin/AdminEmailBlast';

export default function AdminEmailPage() {
  const metrics  = EmailAuditEngine.getMetrics();
  const queued   = EmailQueueEngine.listJobs('queued').length;
  const failed   = EmailFailureEngine.listFailures().length;
  const provider = EmailProviderEngine.getProviderConfig();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '24px 28px', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 6 }}>ADMIN · EMAIL COMMAND</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>Email System</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 6, marginBottom: 0 }}>
          Live delivery via <strong style={{ color: '#00FFFF' }}>{provider.primary.toUpperCase()}</strong>
          {provider.fallback !== 'dev-stub' && ` · fallback ${provider.fallback.toUpperCase()}`}
          {provider.primary === 'dev-stub' && <span style={{ color: '#FF6B6B' }}> · NO API KEY — dev mode only</span>}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Total Sent',    value: metrics.total,        color: '#00FFFF' },
          { label: 'Delivered',     value: metrics.sent,         color: '#00FF88' },
          { label: 'Queued',        value: queued,               color: '#FFD700' },
          { label: 'Failed',        value: failed,               color: '#FF6B6B' },
          { label: 'Unsubscribed',  value: metrics.unsubscribed, color: '#AA2DFF' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${s.color}20`, borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sub-section links */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {[
          { href: '/admin/email/billing',     label: 'Billing',     color: '#00FFFF' },
          { href: '/admin/email/news',        label: 'News',        color: '#FFD700' },
          { href: '/admin/email/support',     label: 'Support',     color: '#FF2DAA' },
          { href: '/admin/email/failed',      label: 'Failed',      color: '#FF6B6B' },
          { href: '/admin/email/templates',   label: 'Templates',   color: '#AA2DFF' },
          { href: '/admin/email/subscribers', label: 'Subscribers', color: '#00FF88' },
          { href: '/admin/email/audit',       label: 'Audit',       color: '#8EC5FF' },
        ].map(l => (
          <Link key={l.href} href={l.href} style={{ fontSize: 10, color: l.color, border: `1px solid ${l.color}30`, padding: '5px 14px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.08em' }}>
            {l.label.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* Interactive blast panel (client component) */}
      <AdminEmailBlast />
    </main>
  );
}
