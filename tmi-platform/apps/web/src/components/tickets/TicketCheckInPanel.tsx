'use client';

import { useState } from 'react';
import { checkIn } from '@/lib/ticketing/TicketCheckInEngine';

type Props = {
  ticketId: string;
  ownerId: string;
};

export default function TicketCheckInPanel({ ticketId, ownerId }: Props) {
  const [status, setStatus] = useState('');

  function onCheckIn(): void {
    const rec = checkIn(ticketId, ownerId, 'qr', { gateId: 'main-gate' });
    setStatus(`${rec.status} at ${new Date(rec.checkedInAt).toLocaleTimeString()}`);
  }

  return (
    <div style={{ border: '1px solid rgba(170,45,255,0.3)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: '#AA2DFF', marginBottom: 6, fontWeight: 700 }}>CHECK-IN</div>
      <button onClick={onCheckIn} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(170,45,255,0.6)', background: 'rgba(170,45,255,0.16)', color: '#fff', cursor: 'pointer' }}>
        Check In Ticket
      </button>
      {status && <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>{status}</div>}
    </div>
  );
}
