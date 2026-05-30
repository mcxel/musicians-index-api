export interface TicketEmailDetails {
  eventName: string;
  venueName: string;
  date: string;
  seat?: string;
  ticketId: string;
  printUrl?: string;
}

export function ticketDeliveryHtml(name: string, tickets: TicketEmailDetails[]): string {
  const ticketRows = tickets.map((t) => `
    <div style="border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:16px;margin-bottom:12px;">
      <div style="font-size:18px;font-weight:900;color:#FFD700;">${t.eventName}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px;">${t.venueName} · ${t.date}</div>
      ${t.seat ? `<div style="font-size:12px;color:#AA2DFF;margin-top:4px;">Seat: ${t.seat}</div>` : ""}
      <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:6px;">Ticket ID: ${t.ticketId}</div>
      ${t.printUrl ? `<a href="${t.printUrl}" style="display:inline-block;margin-top:10px;color:#00FFFF;font-size:12px;font-weight:700;">🖨 Print Ticket →</a>` : ""}
    </div>
  `).join("");

  return `<!DOCTYPE html><html><body style="background:#060410;color:#fff;font-family:sans-serif;padding:40px;">
    <h2 style="color:#FFD700;">🎟 Your Tickets Are Ready</h2>
    <p>Hey ${name}, here are your tickets:</p>
    ${ticketRows}
    <p style="color:rgba(255,255,255,0.4);font-size:12px;">The Musician's Index · tmi.live</p>
  </body></html>`;
}
