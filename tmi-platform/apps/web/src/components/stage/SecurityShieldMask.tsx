'use client';

interface SecurityShieldMaskProps {
  title?: string;
  reason?: string;
}

export default function SecurityShieldMask({
  title = 'SECURITY ISOLATION ACTIVE',
  reason = 'STREAM BLOCKED',
}: SecurityShieldMaskProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(26,5,13,0.98)',
        border: '1px solid rgba(255,68,68,0.55)',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          border: '1px solid rgba(255,68,68,0.5)',
          borderRadius: 10,
          background: 'rgba(255,68,68,0.08)',
          padding: '14px 16px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: '#ff4444',
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '0.14em',
            marginBottom: 8,
          }}
        >
          🔒 {title}
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 11,
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
        >
          {reason}
        </div>
      </div>
    </div>
  );
}
