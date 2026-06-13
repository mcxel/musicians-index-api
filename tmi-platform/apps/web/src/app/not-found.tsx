export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, #1a0a2e 0%, #050510 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#fff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#00FFFF', fontWeight: 800, marginBottom: 16 }}>
          TMI — THE MUSICIAN'S INDEX
        </div>
        <h1 style={{ fontSize: 96, fontWeight: 900, margin: '0 0 8px', color: '#00FFFF', textShadow: '0 0 20px rgba(0, 255, 255, 0.4)' }}>
          404
        </h1>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.2em', marginBottom: 12, color: '#AA2DFF' }}>
          SIGNAL LOST
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 40, maxWidth: 320 }}>
          This route doesn't exist in the index. It may have been removed or the URL is incorrect.
        </p>
        <a
          href="/home/1"
          style={{
            background: 'linear-gradient(135deg, #00FFFF, #AA2DFF)', color: '#050510', padding: '14px 40px', borderRadius: 8, fontWeight: 900, textDecoration: 'none', fontSize: 12, letterSpacing: '0.12em', display: 'inline-block', boxShadow: '0 4px 15px rgba(0,255,255,0.2)'
          }}
        >
          RETURN TO LOBBY
        </a>
      </div>
    </main>
  );
}