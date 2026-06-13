'use client'; 

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { 
  return (
    <html>
      <body style={{ margin: 0, padding: 0 }}>
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
            <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#FF2DAA', fontWeight: 800, marginBottom: 16 }}>
              TMI — SYSTEM INTERRUPT
            </div>
            <h1 style={{ fontSize: 48, fontWeight: 900, margin: '0 0 16px', color: '#FF2DAA', textShadow: '0 0 20px rgba(255, 45, 170, 0.4)' }}>
              SOMETHING WENT WRONG
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontSize: '14px', maxWidth: '400px', margin: '0 auto 32px' }}>
              {error?.message || "An unexpected error occurred in the platform matrix. Engineers have been notified."}
            </p>
            <button 
              onClick={reset} 
              style={{
                padding: '14px 40px', background: 'linear-gradient(135deg, #FF2DAA, #AA2DFF)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 900, letterSpacing: '0.12em', boxShadow: '0 4px 15px rgba(255,45,170,0.2)'
              }}
            >
              REBOOT SEQUENCE
            </button>
          </div>
        </main>
      </body>
    </html>
  ); 
}