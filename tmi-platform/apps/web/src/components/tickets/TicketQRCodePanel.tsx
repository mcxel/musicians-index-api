'use client';

import { useState } from 'react';
import TicketPrintEngine from '@/lib/ticketing/TicketPrintEngine';

type Props = {
  ownerId: string;
  ownerName: string;
  venueId: string;
  venueName: string;
  eventName: string;
  eventDate: string;
};

export default function TicketQRCodePanel(props: Props) {
  const [qr, setQr] = useState('');

  async function generate(): Promise<void> {
    const ticket = await TicketPrintEngine.generatePrintableTicket(
      props.venueId,
      props.venueName,
      props.ownerId,
      props.ownerName,
      props.eventName,
      props.eventDate,
      'general'
    );
    setQr(ticket.qrCode);
  }

  return (
    <div style={{ border: '1px solid rgba(0,255,136,0.3)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: '#00FF88', marginBottom: 6, fontWeight: 700 }}>QR CODE PANEL</div>
      <button onClick={generate} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(0,255,136,0.6)', background: 'rgba(0,255,136,0.18)', color: '#fff', cursor: 'pointer' }}>
        Generate QR
      </button>
      {qr && <div style={{ marginTop: 10, fontSize: 11, wordBreak: 'break-all', color: 'rgba(255,255,255,0.78)' }}>{qr}</div>}
    </div>
  );
}
