export default function StatusRibbon({
  label,
  live,
}: Readonly<{
  label: string;
  live?: boolean;
}>) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(5,9,18,0.74)',
        color: '#e2e8f0',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.11em',
        textTransform: 'uppercase',
        padding: '5px 10px',
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: live ? '#ef4444' : '#67e8f9',
          boxShadow: live ? '0 0 12px rgba(239,68,68,0.8)' : '0 0 12px rgba(103,232,249,0.7)',
        }}
      />
      {label}
    </div>
  );
}
