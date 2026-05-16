'use client';

import type { TicketOwnership } from '@/lib/ticketing/TicketOwnershipEngine';

type Props = {
  ticket: TicketOwnership;
};

export default function TicketOwnershipCard({ ticket }: Props) {
  return (
    <div style={{ border: '1px solid rgba(0,255,255,0.3)', borderRadius: 10, padding: 12, background: 'rgba(0,255,255,0.06)' }}>
      <div style={{ fontSize: 10, color: '#00FFFF', fontWeight: 700, marginBottom: 6 }}>OWNERSHIP PROOF</div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{ticket.ticketId}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{ticket.eventId} · {ticket.tier}</div>
      <div style={{ marginTop: 8, fontSize: 11 }}>Owner: {ticket.ownerId}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>Transfers: {ticket.transferHistory.length}</div>
    </div>
  );
}
