import Link from 'next/link';

export default function DeleteAccountPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/account" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>← Account</Link>
        <div style={{ marginTop: 24, fontSize: 10, letterSpacing: '0.2em', fontWeight: 800, color: '#FF2DAA' }}>ACCOUNT SAFETY</div>
        <h1 style={{ margin: '8px 0 10px', fontSize: 'clamp(26px,5vw,42px)', fontWeight: 900 }}>Delete Account</h1>
        <p style={{ marginTop: 0, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
          Deleting your account permanently removes access to profile, messages, playlists, and platform-linked entitlements.
          If you are certain, continue with the secure deactivation flow.
        </p>

        <div style={{ marginTop: 26, padding: '16px 18px', borderRadius: 10, border: '1px solid rgba(255,45,170,0.35)', background: 'rgba(255,45,170,0.08)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#FF2DAA', marginBottom: 8 }}>Before You Continue</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
            <li>Export or save any content you need first.</li>
            <li>Cancel active subscriptions to avoid recurring charges.</li>
            <li>If this is account recovery related, contact Support before deleting.</li>
          </ul>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/account/deactivate" style={{ padding: '10px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', color: '#050510', background: '#FF2DAA' }}>
            CONTINUE TO SECURE DEACTIVATION
          </Link>
          <Link href="/support" style={{ padding: '10px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 11, fontWeight: 800, color: '#00FFFF', border: '1px solid rgba(0,255,255,0.35)', background: 'rgba(0,255,255,0.08)' }}>
            CONTACT SUPPORT
          </Link>
        </div>
      </div>
    </main>
  );
}
