'use client';

import { useState } from 'react';
import TicketPrintEngine from '@/lib/ticketing/TicketPrintEngine';
import TicketBrandingEngine from '@/lib/ticketing/TicketBrandingEngine';

type Props = {
  venueId: string;
  venueName: string;
  ownerId: string;
  ownerName: string;
};

export default function PrintableTicketPreview({ venueId, venueName, ownerId, ownerName }: Props) {
  const [preview, setPreview] = useState('');

  async function buildPreview(): Promise<void> {
    const ticket = await TicketPrintEngine.generatePrintableTicket(
      venueId,
      venueName,
      ownerId,
      ownerName,
      'TMI Showcase',
      new Date(Date.now() + 3 * 86400000).toISOString(),
      'vip'
    );
    const format = await TicketPrintEngine.generatePrintableFormat(ticket.id, {
      format: 'PDF',
      pageSize: 'A4',
      includeVenueInfo: true,
      includeBranding: true,
      includeOwnerInfo: true,
    });
    const branded = await TicketBrandingEngine.applyBrandingToTicket(ticket.id, format.html, venueId);
    setPreview(branded.htmlWithBranding.slice(0, 260));
  }

  return (
    <div style={{ border: '1px solid rgba(148,163,184,0.45)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: '#cbd5e1', marginBottom: 6, fontWeight: 700 }}>PRINTABLE PREVIEW</div>
      <button onClick={buildPreview} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.7)', background: 'rgba(148,163,184,0.2)', color: '#fff', cursor: 'pointer' }}>
        Build Preview
      </button>
      {preview && <pre style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-wrap' }}>{preview}...</pre>}
    </div>
  );
}
