'use client';

import { useState } from 'react';
import TicketRefundEngine from '@/lib/ticketing/TicketRefundEngine';

type Props = {
  ticketId: string;
  ownerId: string;
  amountUSD: number;
};

export default function TicketRefundModal({ ticketId, ownerId, amountUSD }: Props) {
  const [reason, setReason] = useState('Unable to attend');
  const [message, setMessage] = useState('');

  function requestRefund(): void {
    const request = TicketRefundEngine.requestRefund(ticketId, ownerId, reason, amountUSD);
    setMessage(`Refund requested: ${request.id}`);
  }

  return (
    <div style={{ border: '1px solid rgba(255,215,0,0.3)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: '#FFD700', marginBottom: 6, fontWeight: 700 }}>REFUND</div>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,215,0,0.3)', background: '#0a0f1a', color: '#fff' }}
      />
      <button onClick={requestRefund} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,215,0,0.6)', background: 'rgba(255,215,0,0.16)', color: '#fff', cursor: 'pointer' }}>
        Request Refund
      </button>
      {message && <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{message}</div>}
    </div>
  );
}
