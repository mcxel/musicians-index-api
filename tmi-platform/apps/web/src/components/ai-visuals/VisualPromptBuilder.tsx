'use client';

import { useState } from 'react';
import { createAiVisual } from '@/lib/ai-visuals/AiVisualCreatorEngine';
import AssetPlacementPicker from './AssetPlacementPicker';
import AssetVariationPanel from './AssetVariationPanel';

export default function VisualPromptBuilder() {
  const [subject, setSubject] = useState('Neon battle banner with performer silhouettes');
  const [assetType, setAssetType] = useState<'poster' | 'ticket-design' | 'nft-artwork' | 'venue-skin' | 'magazine-spread'>('poster');
  const [targetRoute, setTargetRoute] = useState('/song-battle/live');
  const [targetComponent, setTargetComponent] = useState('BattleHero');
  const [created, setCreated] = useState('');

  function build(): void {
    const record = createAiVisual({
      assetType,
      subject,
      ownerSystem: 'visual-creator',
      targetRoute,
      targetComponent,
      style: 'TMI neon editorial',
    });
    setCreated(record.assetId);
  }

  return (
    <section style={{ border: '1px solid rgba(0,255,255,0.35)', borderRadius: 12, padding: 14 }}>
      <h3 style={{ marginTop: 0 }}>Visual Prompt Builder</h3>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(0,255,255,0.3)', background: '#0a0f1a', color: '#fff' }} />
      <select value={assetType} onChange={(e) => setAssetType(e.target.value as 'poster' | 'ticket-design' | 'nft-artwork' | 'venue-skin' | 'magazine-spread')} style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(0,255,255,0.3)', background: '#0a0f1a', color: '#fff' }}>
        <option value='poster'>poster</option>
        <option value='ticket-design'>ticket-design</option>
        <option value='nft-artwork'>nft-artwork</option>
        <option value='venue-skin'>venue-skin</option>
        <option value='magazine-spread'>magazine-spread</option>
      </select>

      <AssetPlacementPicker onPick={(route, component) => {
        setTargetRoute(route);
        setTargetComponent(component);
      }} />

      <div style={{ marginTop: 8, marginBottom: 8, fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>
        Target: {targetRoute} · {targetComponent}
      </div>

      <button onClick={build} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(0,255,255,0.6)', background: 'rgba(0,255,255,0.16)', color: '#fff', cursor: 'pointer' }}>
        Generate Visual
      </button>

      {created && <div style={{ marginTop: 8, fontSize: 11, color: '#22d3ee' }}>Created asset: {created}</div>}

      <div style={{ marginTop: 10 }}>
        <AssetVariationPanel variations={['v1 editorial', 'v2 cinematic', 'v3 glossy', 'v4 retro-future']} />
      </div>
    </section>
  );
}
