'use client';

import { useState } from 'react';
import TicketBrandingEngine from '@/lib/ticketing/TicketBrandingEngine';

type Props = {
  venueId: string;
};

export default function VenueTicketBrandingPanel({ venueId }: Props) {
  const [theme, setTheme] = useState<'modern' | 'classic' | 'neon' | 'minimal'>('neon');
  const [status, setStatus] = useState('');

  async function apply(): Promise<void> {
    await TicketBrandingEngine.applyTheme(venueId, theme);
    setStatus(`Theme applied: ${theme}`);
  }

  return (
    <div style={{ border: '1px solid rgba(255,45,170,0.3)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: '#FF2DAA', marginBottom: 6, fontWeight: 700 }}>VENUE BRANDING</div>
      <select value={theme} onChange={(e) => setTheme(e.target.value as 'modern' | 'classic' | 'neon' | 'minimal')} style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.3)', background: '#0a0f1a', color: '#fff' }}>
        <option value='modern'>modern</option>
        <option value='classic'>classic</option>
        <option value='neon'>neon</option>
        <option value='minimal'>minimal</option>
      </select>
      <button onClick={apply} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.6)', background: 'rgba(255,45,170,0.16)', color: '#fff', cursor: 'pointer' }}>
        Apply Branding
      </button>
      {status && <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>{status}</div>}
    </div>
  );
}
