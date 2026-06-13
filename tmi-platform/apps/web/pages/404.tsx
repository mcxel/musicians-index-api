import Link from 'next/link';

export default function Custom404() {
  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, #0a0025 0%, #050510 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: '#fff', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 'clamp(64px,16vw,120px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, background: 'linear-gradient(135deg,#00FFFF,#AA2DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</div>
        <div style={{ fontSize: 'clamp(14px,3vw,20px)', fontWeight: 900, letterSpacing: '0.3em', color: '#00FFFF', textTransform: 'uppercase', margin: '12px 0 8px' }}>SIGNAL LOST</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 32 }}>This frequency doesn&apos;t exist on TMI. The page may have moved or the link is broken.</p>
        <Link href="/home/1" style={{ display: 'inline-block', padding: '12px 32px', background: 'linear-gradient(90deg,#00FFFF,#AA2DFF)', color: '#050510', fontWeight: 900, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', borderRadius: 6, textDecoration: 'none' }}>
          RETURN TO LOBBY
        </Link>
      </div>
    </main>
  );
}
