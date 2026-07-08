import Link from 'next/link';

export default function CookiesPolicyPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/home/1" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>← Home</Link>
        <div style={{ marginTop: 24, fontSize: 10, letterSpacing: '0.2em', fontWeight: 800, color: '#00FFFF' }}>LEGAL</div>
        <h1 style={{ margin: '8px 0 10px', fontSize: 'clamp(26px,5vw,42px)', fontWeight: 900 }}>Cookie Policy</h1>
        <p style={{ marginTop: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Last updated: July 2026</p>

        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, color: '#00FFFF' }}>What We Use Cookies For</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
            TMI uses first-party cookies for authentication, session continuity, role routing, security checks, and basic product preferences.
            We do not use third-party behavioral advertising cookies for account tracking.
          </p>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 16, color: '#00FFFF' }}>Core Cookie Categories</h2>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            <li>Essential: sign-in, session protection, CSRF/security posture.</li>
            <li>Functional: UI preferences, routing context, quality-of-life settings.</li>
            <li>Operational: short-lived telemetry and diagnostics for reliability.</li>
          </ul>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 16, color: '#00FFFF' }}>Managing Cookies</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
            You can clear cookies from your browser at any time. Clearing essential cookies signs you out and resets session continuity.
            For account deletion or data rights requests, use the Delete Account and Support routes below.
          </p>
        </section>

        <div style={{ marginTop: 30, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/privacy" style={{ color: '#00FFFF', fontSize: 12, textDecoration: 'none' }}>Privacy Policy →</Link>
          <Link href="/terms" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, textDecoration: 'none' }}>Terms</Link>
          <Link href="/delete-account" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, textDecoration: 'none' }}>Delete Account</Link>
          <Link href="/support" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, textDecoration: 'none' }}>Support</Link>
        </div>
      </div>
    </main>
  );
}
