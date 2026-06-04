export default function Custom404() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050815', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', padding: 40, border: '1px solid rgba(0,229,255,0.2)', borderRadius: 12, background: 'rgba(5,8,21,0.8)' }}>
        <h1 style={{ fontSize: 64, color: '#00E5FF', margin: '0 0 16px', textShadow: '0 0 12px rgba(0,229,255,0.4)' }}>404</h1>
        <h2 style={{ fontSize: 18, margin: '0 0 24px', color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>Signal Lost — Room Not Found</h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 32, letterSpacing: '0.1em' }}>
          The venue or article you are looking for does not exist on the TMI network.
        </p>
        <a href="/home/1" style={{ display: 'inline-block', padding: '12px 28px', background: '#FF2DAA', color: '#fff', textDecoration: 'none', borderRadius: 24, fontWeight: 900, fontSize: 12, letterSpacing: '0.1em' }}>
          RETURN TO LOBBY
        </a>
      </div>
    </main>
  );
}
