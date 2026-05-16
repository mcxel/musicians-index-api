type Props = {
  variations: string[];
};

export default function AssetVariationPanel({ variations }: Props) {
  return (
    <div style={{ border: '1px solid rgba(255,215,0,0.35)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: '#FFD700', marginBottom: 8, fontWeight: 700 }}>VARIATIONS</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {variations.map((v) => (
          <span key={v} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 999, border: '1px solid rgba(255,215,0,0.5)', color: '#fde68a' }}>{v}</span>
        ))}
      </div>
    </div>
  );
}
