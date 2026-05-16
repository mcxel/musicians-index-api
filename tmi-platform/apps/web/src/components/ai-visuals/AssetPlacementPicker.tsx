'use client';

import { useState } from 'react';

type Props = {
  onPick: (route: string, component: string) => void;
};

export default function AssetPlacementPicker({ onPick }: Props) {
  const [route, setRoute] = useState('/home/1');
  const [component, setComponent] = useState('HeroSection');

  return (
    <div style={{ border: '1px solid rgba(0,255,255,0.3)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: '#00FFFF', marginBottom: 6, fontWeight: 700 }}>PLACEMENT</div>
      <input value={route} onChange={(e) => setRoute(e.target.value)} placeholder='target route' style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(0,255,255,0.3)', background: '#0a0f1a', color: '#fff' }} />
      <input value={component} onChange={(e) => setComponent(e.target.value)} placeholder='target component' style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(0,255,255,0.3)', background: '#0a0f1a', color: '#fff' }} />
      <button onClick={() => onPick(route, component)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(0,255,255,0.5)', background: 'rgba(0,255,255,0.15)', color: '#fff', cursor: 'pointer' }}>Apply Placement</button>
    </div>
  );
}
