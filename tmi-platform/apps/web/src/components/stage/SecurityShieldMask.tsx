'use client';

export default function SecurityShieldMask() {
  return (
    <div
      role="status"
      aria-label="Stream blocked — custodian approval required"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background:
          'radial-gradient(ellipse at 50% 50%, rgba(80,0,20,0.98) 0%, rgba(26,5,13,0.98) 100%)',
        border: '2px solid rgba(220,0,60,0.6)',
        boxShadow: 'inset 0 0 60px rgba(220,0,60,0.12)',
      }}
    >
      {/* Geometric accent bars */}
      <div aria-hidden="true" style={{ display: 'flex', gap: 6 }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 32 + i * 8,
              background: `rgba(220,0,60,${0.3 + i * 0.12})`,
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            letterSpacing: '0.2em',
            color: 'rgba(220,0,60,0.9)',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          SECURITY ISOLATION ACTIVE
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 13,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
          }}
        >
          STREAM BLOCKED // CUSTODIAN CONSENSUS PENDING
        </div>
      </div>

      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '2px solid rgba(220,0,60,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
        }}
        aria-hidden="true"
      >
        🔒
      </div>
    </div>
  );
}
