import EmailTemplateEngine from '@/lib/email/EmailTemplateEngine';
import Link from 'next/link';

export default function AdminEmailTemplatesPage() {
  if (EmailTemplateEngine.listTemplateVersions().length === 0) {
    EmailTemplateEngine.upsertTemplate({
      templateKey: 'ticket.delivery',
      subject: 'Your ticket is ready: {{eventName}}',
      html: '<p>{{message}}</p>',
      text: '{{message}}',
      safeTransactional: true,
    });
  }

  const versions = EmailTemplateEngine.listTemplateVersions();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <Link href="/admin/email" style={{ color: '#00FFFF', textDecoration: 'none' }}>
        ← Admin Email
      </Link>
      <h1 style={{ marginTop: 12 }}>Email Templates</h1>
      <p>Versioned templates with safe transactional flags.</p>
      {versions.map((item) => (
        <div
          key={`${item.templateKey}-${item.version}`}
          style={{
            marginTop: 10,
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: 10,
          }}
        >
          <div>{item.templateKey}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
            v{item.version} | safe transactional: {item.safeTransactional ? 'yes' : 'no'}
          </div>
        </div>
      ))}
    </main>
  );
}
