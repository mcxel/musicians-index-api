'use client';

import { useState } from 'react';
import { detectAndCreateVisual } from '@/lib/bots/VisualCreatorBotEngine';

export default function PlaceholderReplacementPanel() {
  const [route, setRoute] = useState('/tickets');
  const [component, setComponent] = useState('TicketHero');
  const [message, setMessage] = useState('');

  function replacePlaceholder(): void {
    const asset = detectAndCreateVisual({
      ownerSystem: 'ticketing',
      targetRoute: route,
      targetComponent: component,
      subject: 'high-energy ticket hero visual',
      assetType: 'ticket-design',
    });
    setMessage(`Generated replacement asset: ${asset.assetId}`);
  }

  return (
    <section style={{ border: '1px solid rgba(255,45,170,0.35)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: '#FF2DAA', marginBottom: 8, fontWeight: 700 }}>PLACEHOLDER REPLACEMENT</div>
      <input value={route} onChange={(e) => setRoute(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.3)', background: '#0a0f1a', color: '#fff' }} />
      <input value={component} onChange={(e) => setComponent(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.3)', background: '#0a0f1a', color: '#fff' }} />
      <button onClick={replacePlaceholder} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.6)', background: 'rgba(255,45,170,0.15)', color: '#fff', cursor: 'pointer' }}>Generate Replacement</button>
      {message && <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>{message}</div>}
    </section>
  );
}
