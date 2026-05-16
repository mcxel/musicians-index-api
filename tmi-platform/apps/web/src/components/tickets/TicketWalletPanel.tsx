import React from "react";

export type TicketWalletItem = {
  ticketId: string;
  eventName: string;
  venueName: string;
  status: "active" | "used" | "refunded" | "transferred";
  qrValue: string;
};

export function TicketWalletPanel(props: {
  tickets: TicketWalletItem[];
  onTransfer: (ticketId: string) => void;
  onRefund: (ticketId: string) => void;
}) {
  return (
    <section aria-label="Ticket Wallet Panel">
      <h2>Ticket Wallet</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {props.tickets.map((ticket) => (
          <li key={ticket.ticketId} style={{ border: "1px solid #333", padding: 12, marginBottom: 10, borderRadius: 8 }}>
            <div><strong>{ticket.eventName}</strong></div>
            <div>Venue: {ticket.venueName}</div>
            <div>Status: {ticket.status}</div>
            <div>QR Preview: {ticket.qrValue.slice(0, 16)}...</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button onClick={() => props.onTransfer(ticket.ticketId)}>Transfer</button>
              <button onClick={() => props.onRefund(ticket.ticketId)}>Refund</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
