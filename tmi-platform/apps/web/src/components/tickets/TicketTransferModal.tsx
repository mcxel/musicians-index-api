'use client';

import { useState } from 'react';
import { createTransferRequest } from '@/lib/ticketing/TicketTransferEngine';

type Props = {
  ticketId: string;
  fromUserId: string;
};

export default function TicketTransferModal({ ticketId, fromUserId }: Props) {
  const [toUserId, setToUserId] = useState('');
  const [status, setStatus] = useState('');

  function onTransfer(): void {
    const result = createTransferRequest(ticketId, fromUserId, toUserId, {
      message: 'Gift transfer from wallet',
    });
    setStatus(result.ok ? 'Transfer request sent' : `Transfer failed: ${result.reason}`);
  }

  return (
    <div style={{ border: '1px solid rgba(255,45,170,0.3)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: '#FF2DAA', marginBottom: 6, fontWeight: 700 }}>TRANSFER</div>
      <input
        value={toUserId}
        onChange={(e) => setToUserId(e.target.value)}
        placeholder='recipient user id'
        style={{ width: '100%', marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.3)', background: '#0a0f1a', color: '#fff' }}
      />
      <button onClick={onTransfer} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,45,170,0.6)', background: 'rgba(255,45,170,0.2)', color: '#fff', cursor: 'pointer' }}>
        Send Transfer
      </button>
      {status && <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{status}</div>}
    </div>
  );
}
