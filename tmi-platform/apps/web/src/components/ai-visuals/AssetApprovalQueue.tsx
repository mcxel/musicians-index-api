'use client';

import { useMemo, useState } from 'react';
import { listGeneratedAssets, updateGeneratedAssetStatus } from '@/lib/ai-visuals/AiGeneratedAssetRegistry';

type Props = { status?: 'draft' | 'approved' | 'active' | 'archived' | 'replaced' };

export default function AssetApprovalQueue({ status = 'draft' }: Props) {
  const [nonce, setNonce] = useState(0);
  const assets = useMemo(() => listGeneratedAssets({ status }), [status, nonce]);

  function approve(id: string): void {
    updateGeneratedAssetStatus(id, 'approved');
    setNonce((n) => n + 1);
  }

  function reject(id: string): void {
    updateGeneratedAssetStatus(id, 'archived');
    setNonce((n) => n + 1);
  }

  return (
    <section style={{ border: '1px solid rgba(148,163,184,0.35)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: '#cbd5e1', marginBottom: 8, fontWeight: 700 }}>APPROVAL QUEUE ({assets.length})</div>
      {assets.map((asset) => (
        <div key={asset.assetId} style={{ border: '1px solid rgba(148,163,184,0.2)', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 11, marginBottom: 6 }}>{asset.assetType} · {asset.targetRoute}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => approve(asset.assetId)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.6)', background: 'rgba(34,197,94,0.15)', color: '#fff', cursor: 'pointer' }}>Approve</button>
            <button onClick={() => reject(asset.assetId)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.15)', color: '#fff', cursor: 'pointer' }}>Reject</button>
          </div>
        </div>
      ))}
      {assets.length === 0 && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>No assets waiting for this state.</div>}
    </section>
  );
}
