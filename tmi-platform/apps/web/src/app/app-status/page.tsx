import Link from 'next/link';

export default function AppStatusPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #050510 0%, #0c1226 50%, #150d24 100%)',
        color: '#f7f5ee',
        padding: '40px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-block',
            marginBottom: 16,
            padding: '7px 12px',
            border: '1px solid rgba(0,255,255,0.35)',
            background: 'rgba(0,255,255,0.08)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#00FFFF',
          }}
        >
          Mobile App Status
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(34px, 7vw, 72px)',
            lineHeight: 0.95,
            textTransform: 'uppercase',
            color: '#fff4d6',
            textShadow: '2px 0 #FF2DAA, -2px 0 #00FFFF',
          }}
        >
          Not Yet In Google Play
        </h1>

        <p style={{ marginTop: 18, fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
          Short answer: not yet. What you have right now is a live website, not a Google Play Store app.
        </p>

        <section style={{ marginTop: 28, display: 'grid', gap: 14 }}>
          {[
            'You already have a live website at themusiciansindex.com.',
            'Payments and email can work on the web without being in the Play Store.',
            'Google Play requires an Android app bundle, not just a browser-based Next.js site.',
            'The fastest path is to keep the web app live, test mobile users, then wrap the site into an Android shell with Capacitor.',
            'If you want app-like behavior immediately, install it from the browser using Add to Home Screen.',
          ].map((line) => (
            <div
              key={line}
              style={{
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(8,10,18,0.72)',
                padding: '14px 16px',
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                lineHeight: 1.5,
                boxShadow: '0 14px 28px rgba(0,0,0,0.35)',
              }}
            >
              {line}
            </div>
          ))}
        </section>

        <section style={{ marginTop: 34, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <div style={{ border: '1px solid rgba(255,215,0,0.2)', background: 'rgba(255,215,0,0.08)', padding: 16 }}>
            <h2 style={{ margin: 0, fontSize: 22, color: '#FFD700', textTransform: 'uppercase' }}>What Google Needs</h2>
            <p style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
              An Android app package such as an AAB or APK, Play Store metadata, screenshots, and a production-ready mobile shell.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(0,255,255,0.2)', background: 'rgba(0,255,255,0.08)', padding: 16 }}>
            <h2 style={{ margin: 0, fontSize: 22, color: '#00FFFF', textTransform: 'uppercase' }}>Fastest Path</h2>
            <p style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
              Keep the website live, confirm mobile flows, then wrap the site with Capacitor and upload the signed Android bundle to Google Play.
            </p>
          </div>

          <div style={{ border: '1px solid rgba(255,45,170,0.2)', background: 'rgba(255,45,170,0.08)', padding: 16 }}>
            <h2 style={{ margin: 0, fontSize: 22, color: '#FF2DAA', textTransform: 'uppercase' }}>Instant App Feel</h2>
            <p style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
              Use the browser install prompt or Add to Home Screen now. That gives users an installable icon without waiting for the Play Store.
            </p>
          </div>
        </section>

        <section style={{ marginTop: 34, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/home/1" style={{ padding: '12px 20px', background: 'linear-gradient(135deg,#00FFFF,#00AABB)', color: '#050510', textDecoration: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Back To Home
          </Link>
          <Link href="/magazine" style={{ padding: '12px 20px', background: 'linear-gradient(135deg,#FFD700,#FF9F1C)', color: '#050510', textDecoration: 'none', borderRadius: 10, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Open Magazine
          </Link>
        </section>
      </div>
    </main>
  );
}
