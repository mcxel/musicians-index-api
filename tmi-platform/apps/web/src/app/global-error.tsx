'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ maxWidth: '500px', width: '100%', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '12px', padding: '24px', background: 'rgba(20,0,0,0.8)' }}>
            <h1 style={{ color: '#ff4444', fontSize: '24px', margin: '0 0 12px 0' }}>Critical System Error</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: '0 0 20px 0' }}>
              The Musician&apos;s Index encountered a fatal runtime exception.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '6px', overflowX: 'auto', marginBottom: '24px' }}>
              <code style={{ color: '#ff8888', fontSize: '12px' }}>{error.message || 'Unknown exception'}</code>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => reset()}
                style={{ padding: '10px 20px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Attempt Recovery
              </button>
              <button
                onClick={() => { window.location.href = '/home/1'; }}
                style={{ padding: '10px 20px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
