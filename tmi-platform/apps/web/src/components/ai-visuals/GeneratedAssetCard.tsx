import type { AiGeneratedAssetRecord } from '@/lib/ai-visuals/AiGeneratedAssetRegistry';
import AssetQualityMeter from './AssetQualityMeter';

type Props = { asset: AiGeneratedAssetRecord };

export default function GeneratedAssetCard({ asset }: Props) {
  return (
    <article style={{ border: '1px solid rgba(148,163,184,0.35)', borderRadius: 10, padding: 12, background: 'rgba(2,6,23,0.66)' }}>
      <div style={{ fontSize: 10, color: '#a5b4fc', marginBottom: 4 }}>{asset.assetType} · {asset.status}</div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{asset.targetRoute}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>{asset.targetComponent}</div>
      <AssetQualityMeter score={asset.qualityScore} />
    </article>
  );
}
