type Props = { score: number };

export default function AssetQualityMeter({ score }: Props) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span>Quality</span>
        <span style={{ color }}>{score}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
        <div style={{ width: `${Math.max(0, Math.min(score, 100))}%`, height: 6, borderRadius: 4, background: color }} />
      </div>
    </div>
  );
}
