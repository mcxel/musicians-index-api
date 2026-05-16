import { listGeneratedAssets } from '@/lib/ai-visuals/AiGeneratedAssetRegistry';
import GeneratedAssetCard from '@/components/ai-visuals/GeneratedAssetCard';

export default function AdminGeneratedAssetsPage() {
  const assets = listGeneratedAssets();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: 24 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <h1 style={{ marginTop: 0 }}>Generated Assets</h1>
        <p style={{ color: 'rgba(255,255,255,0.66)' }}>Registry of AI-generated visuals routed to platform components.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
          {assets.map((asset) => <GeneratedAssetCard key={asset.assetId} asset={asset} />)}
        </div>
      </div>
    </main>
  );
}
