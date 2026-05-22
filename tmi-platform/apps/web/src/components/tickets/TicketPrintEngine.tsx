'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export type TicketData = {
  ticketId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  holderName: string;
  seat?: string;
  section?: string;
  tier: 'general' | 'vip' | 'backstage';
  price: string;
  qrCode?: string;
  logoUrl?: string;
  accentColor?: string;
};

const TIER_LABEL: Record<string, string> = {
  general: 'GENERAL ADMISSION', vip: 'VIP ACCESS', backstage: 'BACKSTAGE PASS',
};
const TIER_COLOR: Record<string, string> = {
  general: '#00FFFF', vip: '#FFD700', backstage: '#AA2DFF',
};

export default function TicketPrintEngine({ ticket }: { ticket: TicketData }) {
  const [printing, setPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const accent = ticket.accentColor ?? TIER_COLOR[ticket.tier] ?? '#00FFFF';

  function handlePrint() {
    setPrinting(true);
    const printContent = printRef.current?.innerHTML ?? '';
    const win = window.open('', '_blank', 'width=700,height=500');
    if (!win) { setPrinting(false); return; }
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>TMI Ticket — ${ticket.eventName}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; font-family: 'Courier New', monospace; }
        @media print { body { background: #fff !important; } }
      </style></head>
      <body>${printContent}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); setPrinting(false); }, 400);
  }

  return (
    <div>
      {/* Ticket preview */}
      <div ref={printRef}>
        <div style={{
          maxWidth: 600, margin: '0 auto',
          background: `linear-gradient(135deg, #0d0020, #050510)`,
          border: `2px solid ${accent}`,
          borderRadius: 16, overflow: 'hidden',
          fontFamily: "'Courier New', monospace",
          color: '#fff',
        }}>
          {/* Header stripe */}
          <div style={{ background: accent, padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 900, fontSize: 13, color: '#000', letterSpacing: '0.2em' }}>THE MUSICIAN'S INDEX</span>
            <span style={{ fontWeight: 900, fontSize: 12, color: '#000', letterSpacing: '0.15em' }}>{TIER_LABEL[ticket.tier]}</span>
          </div>

          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: accent, letterSpacing: '0.25em', marginBottom: 6 }}>EVENT</div>
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.15, marginBottom: 14 }}>{ticket.eventName}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', fontSize: 12 }}>
                {[
                  { label: 'DATE', value: ticket.eventDate },
                  { label: 'TIME', value: ticket.eventTime },
                  { label: 'VENUE', value: ticket.venueName },
                  { label: 'ADDRESS', value: ticket.venueAddress },
                  ...(ticket.seat ? [{ label: 'SEAT', value: ticket.seat }] : []),
                  ...(ticket.section ? [{ label: 'SECTION', value: ticket.section }] : []),
                  { label: 'HOLDER', value: ticket.holderName },
                  { label: 'PRICE', value: ticket.price },
                ].map((row) => (
                  <div key={row.label}>
                    <div style={{ fontSize: 9, color: accent, letterSpacing: '0.2em', marginBottom: 2 }}>{row.label}</div>
                    <div style={{ fontWeight: 700 }}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR / barcode section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ width: 90, height: 90, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#000', textAlign: 'center', padding: 6, fontWeight: 700 }}>
                {ticket.qrCode ?? ticket.ticketId}
              </div>
              <div style={{ fontSize: 9, color: accent, letterSpacing: '0.12em' }}>SCAN AT DOOR</div>
            </div>
          </div>

          {/* Perforation line */}
          <div style={{ borderTop: `1.5px dashed ${accent}50`, margin: '0 24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -6, left: -24, width: 12, height: 12, borderRadius: '50%', background: '#050510', border: `1.5px solid ${accent}50` }} />
            <div style={{ position: 'absolute', top: -6, right: -24, width: 12, height: 12, borderRadius: '50%', background: '#050510', border: `1.5px solid ${accent}50` }} />
          </div>

          {/* Footer stub */}
          <div style={{ padding: '10px 24px 14px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            <span>TICKET ID: {ticket.ticketId}</span>
            <span>themusiciansindex.com</span>
          </div>
        </div>
      </div>

      {/* Print button */}
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePrint}
          disabled={printing}
          style={{
            padding: '12px 32px', background: accent, color: '#000',
            border: 'none', borderRadius: 8, fontWeight: 900, fontSize: 14,
            cursor: 'pointer', letterSpacing: '0.1em',
          }}
        >
          {printing ? 'Opening Print...' : '🖨️ PRINT TICKET'}
        </motion.button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
          Venue can scan QR code or check ticket ID at the door
        </div>
      </div>
    </div>
  );
}
