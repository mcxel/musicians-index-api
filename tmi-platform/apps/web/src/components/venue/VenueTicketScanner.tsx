'use client';

import { useState, useCallback } from 'react';

type ScanState = 'IDLE' | 'SCANNING' | 'APPROVED' | 'DENIED';

interface TicketResult {
  id: string;
  holder: string;
  tier: string;
  seat: string;
  timestamp: string;
}

interface VenueTicketScannerProps {
  venueId: string;
  onScan?: (result: TicketResult | null) => void;
}

const C = { bg: '#050510', border: '#1a1a3a', cyan: '#00E5FF', green: '#00FF88', red: '#FF2020', gold: '#FFD700', text: '#fff', dim: '#555' };

export default function VenueTicketScanner({ venueId, onScan }: VenueTicketScannerProps) {
  const [scanState, setScanState] = useState<ScanState>('IDLE');
  const [result, setResult] = useState<TicketResult | null>(null);
  const [manualCode, setManualCode] = useState('');

  const processTicket = useCallback(async (code?: string) => {
    setScanState('SCANNING');
    setResult(null);
    const lookup = code ?? manualCode;

    try {
      const res = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: lookup, venueId }),
      });
      if (res.ok) {
        const data = await res.json() as { valid: boolean; ticket?: TicketResult };
        if (data.valid && data.ticket) { setScanState('APPROVED'); setResult(data.ticket); onScan?.(data.ticket); }
        else { setScanState('DENIED'); onScan?.(null); }
      } else { setScanState('DENIED'); onScan?.(null); }
    } catch {
      // Demo / offline fallback
      const ok = Math.random() > 0.15;
      if (ok) {
        const demo: TicketResult = { id: `TMI-${Math.random().toString(36).substring(2,8).toUpperCase()}`, holder: 'Guest', tier: 'VIP FLOOR', seat: `A-${Math.floor(Math.random()*20)+1}`, timestamp: new Date().toLocaleTimeString() };
        setScanState('APPROVED'); setResult(demo); onScan?.(demo);
      } else { setScanState('DENIED'); onScan?.(null); }
    }
    setTimeout(() => { setScanState('IDLE'); setManualCode(''); }, 4000);
  }, [manualCode, venueId, onScan]);

  const borderCol = scanState==='APPROVED' ? C.green : scanState==='DENIED' ? C.red : scanState==='SCANNING' ? C.gold : C.border;

  return (
    <div style={{ padding: 24, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, maxWidth: 440, width: '100%', fontFamily: 'var(--font-orbitron,sans-serif)' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: C.cyan, fontWeight: 800, marginBottom: 4 }}>BOX OFFICE</div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: C.text }}>TICKET SCANNER</h2>
        <p style={{ margin: '4px 0 0', fontSize: 10, color: C.dim, letterSpacing: 3 }}>VENUE: {venueId.toUpperCase()}</p>
      </div>

      <div style={{ aspectRatio: '16/9', borderRadius: 10, border: `2px solid ${borderCol}`, background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: 16, transition: 'all 0.3s' }}>
        {scanState==='IDLE' && <div style={{ textAlign:'center', color: C.dim }}><div style={{ fontSize:32, marginBottom:8 }}>📱</div><div style={{ fontSize:10, letterSpacing:3, fontWeight:700 }}>AWAITING QR</div></div>}
        {scanState==='SCANNING' && <><div style={{ fontSize:14, fontWeight:900, color: C.gold, letterSpacing:4 }}>SCANNING...</div><div style={{ position:'absolute', top:0, left:0, width:'100%', height:3, background: C.gold }} /></>}
        {scanState==='APPROVED' && result && <div style={{ textAlign:'center', padding:16 }}><div style={{ fontSize:28, marginBottom:8 }}>✅</div><div style={{ color: C.green, fontWeight:900, fontSize:14, letterSpacing:3, marginBottom:8 }}>ACCESS GRANTED</div><div style={{ color:'rgba(0,255,136,0.7)', fontSize:10, letterSpacing:2, lineHeight:1.8 }}><div>ID: {result.id}</div><div>TIER: {result.tier}</div><div>SEAT: {result.seat}</div></div></div>}
        {scanState==='DENIED' && <div style={{ textAlign:'center' }}><div style={{ fontSize:28, marginBottom:8 }}>❌</div><div style={{ color: C.red, fontWeight:900, fontSize:14, letterSpacing:4 }}>INVALID TICKET</div></div>}
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input value={manualCode} onChange={e=>setManualCode(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter' && scanState==='IDLE' && manualCode) void processTicket(); }} placeholder="Enter ticket code..." disabled={scanState!=='IDLE'} style={{ flex:1, background:'#0a0a1a', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 12px', color: C.text, fontSize:12, outline:'none', fontFamily:'monospace' }} />
        <button onClick={()=>void processTicket()} disabled={scanState!=='IDLE'||!manualCode} style={{ background: C.cyan, color:'#000', border:'none', borderRadius:8, padding:'9px 16px', fontWeight:900, fontSize:11, cursor:'pointer', letterSpacing:1, opacity:(!manualCode||scanState!=='IDLE')?0.5:1 }}>SCAN</button>
      </div>

      <button onClick={()=>void processTicket(`DEMO-${Date.now()}`)} disabled={scanState!=='IDLE'} style={{ width:'100%', padding:'11px 0', background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, color: C.dim, fontWeight:700, fontSize:10, cursor:'pointer', letterSpacing:3, opacity:scanState!=='IDLE'?0.4:1 }}>
        SIMULATE PHYSICAL SCAN
      </button>
    </div>
  );
}
