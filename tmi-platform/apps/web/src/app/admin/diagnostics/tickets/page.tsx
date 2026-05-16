'use client';

import React, { useState, useCallback, useEffect } from 'react';

type TicketStatus = 'issued' | 'printed' | 'validated' | 'refunded' | 'failed' | 'expired' | 'transferred';
type TicketType = 'venue' | 'digital' | 'nft' | 'season_pass' | 'sponsor_gift';

interface TicketEvent {
  id: string;
  ticketId: string;
  eventName: string;
  type: TicketType;
  status: TicketStatus;
  holder: string;
  seatInfo: string | null;
  qrHash: string | null;
  ts: number;
  errorMsg: string | null;
  venueId: string | null;
  printReady: boolean;
}

const STATUS_COLOR: Record<TicketStatus, string> = {
  issued:      'text-cyan-400 bg-cyan-900/20 border-cyan-700/40',
  printed:     'text-blue-400 bg-blue-900/20 border-blue-700/40',
  validated:   'text-emerald-400 bg-emerald-900/20 border-emerald-700/40',
  refunded:    'text-amber-400 bg-amber-900/20 border-amber-700/40',
  failed:      'text-red-400 bg-red-900/20 border-red-700/40',
  expired:     'text-orange-400 bg-orange-900/20 border-orange-700/40',
  transferred: 'text-purple-400 bg-purple-900/20 border-purple-700/40',
};

const TYPE_LABEL: Record<TicketType, string> = {
  venue:        'Venue',
  digital:      'Digital',
  nft:          'NFT Ticket',
  season_pass:  'Season Pass',
  sponsor_gift: 'Sponsor Gift',
};

function fmt(ts: number): string {
  return new Date(ts).toLocaleString('en-US', { hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const MOCK_TICKETS: TicketEvent[] = [
  { id: 't1', ticketId: 'TMI-VEN-001', eventName: 'Crown Night Vol.3', type: 'venue', status: 'issued', holder: 'antoineking@gmail.com', seatInfo: 'Section A · Row 3 · Seat 12', qrHash: 'qr-a1b2c3d4', ts: Date.now() - 300000, errorMsg: null, venueId: 'venue-atlanta-01', printReady: true },
  { id: 't2', ticketId: 'TMI-DIG-002', eventName: 'Cypher Arena Live', type: 'digital', status: 'validated', holder: 'fan@example.com', seatInfo: null, qrHash: 'qr-e5f6g7h8', ts: Date.now() - 120000, errorMsg: null, venueId: null, printReady: false },
  { id: 't3', ticketId: 'TMI-NFT-003', eventName: 'Battle Royale Season 1', type: 'nft', status: 'issued', holder: 'collector@example.com', seatInfo: null, qrHash: null, ts: Date.now() - 60000, errorMsg: null, venueId: null, printReady: false },
  { id: 't4', ticketId: 'TMI-VEN-004', eventName: 'Crown Night Vol.3', type: 'venue', status: 'failed', holder: 'user@example.com', seatInfo: 'Section B · Row 1 · Seat 5', qrHash: null, ts: Date.now() - 30000, errorMsg: 'Payment authorization failed', venueId: 'venue-atlanta-01', printReady: false },
  { id: 't5', ticketId: 'TMI-SEA-005', eventName: 'TMI Season 1 Pass', type: 'season_pass', status: 'issued', holder: 'berntmusic33@gmail.com', seatInfo: null, qrHash: 'qr-i9j0k1l2', ts: Date.now() - 10000, errorMsg: null, venueId: null, printReady: false },
];

export default function TicketsDiagnosticsPage() {
  const [tickets, setTickets] = useState<TicketEvent[]>(MOCK_TICKETS);
  const [filter, setFilter] = useState<string>('all');

  const displayed = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);

  const counts = tickets.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  const failedCount = counts['failed'] ?? 0;
  const printReadyCount = tickets.filter((t) => t.printReady).length;

  function simulateValidate(id: string) {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: 'validated' as TicketStatus } : t));
  }

  function simulatePrint(id: string) {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: 'printed' as TicketStatus } : t));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono">
      <div className="max-w-5xl mx-auto">

        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Ticket Diagnostics</h1>
          <p className="text-xs text-gray-400 mt-1">
            Venue tickets · digital tickets · NFT tickets · season passes · QR validation · print status · ownership · refunds
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-400">Total Tickets</div>
            <div className="text-2xl font-bold text-white">{tickets.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-400">Validated</div>
            <div className="text-2xl font-bold text-emerald-400">{counts['validated'] ?? 0}</div>
          </div>
          <div className={`border rounded p-3 ${failedCount > 0 ? 'bg-red-900/20 border-red-700/40' : 'bg-gray-900 border-gray-800'}`}>
            <div className="text-xs text-gray-400">Failed</div>
            <div className={`text-2xl font-bold ${failedCount > 0 ? 'text-red-400' : 'text-white'}`}>{failedCount}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded p-3">
            <div className="text-xs text-gray-400">Print Ready</div>
            <div className="text-2xl font-bold text-blue-400">{printReadyCount}</div>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={`text-xs px-2 py-1 rounded border ${filter === 'all' ? 'border-white/30 text-white bg-white/10' : 'border-gray-700 text-gray-400'}`}>all</button>
          {Object.entries(counts).map(([status, count]) => (
            <button key={status} onClick={() => setFilter(filter === status ? 'all' : status)}
              className={`text-xs px-2 py-1 rounded border ${STATUS_COLOR[status as TicketStatus] ?? ''} ${filter === status ? 'ring-1 ring-white/30' : ''}`}>
              {status} · {count}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div className="bg-gray-900 border border-gray-800 rounded mb-6">
          <div className="divide-y divide-gray-800/60 max-h-[500px] overflow-y-auto">
            {displayed.map((t) => (
              <div key={t.id} className="px-4 py-3 hover:bg-gray-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${STATUS_COLOR[t.status]}`}>{t.status}</span>
                  <span className="text-xs text-gray-300 font-semibold shrink-0">{t.ticketId}</span>
                  <span className="text-xs text-white flex-1 truncate">{t.eventName}</span>
                  <span className="text-xs text-gray-500 shrink-0">{TYPE_LABEL[t.type]}</span>
                  <div className="flex gap-1 shrink-0">
                    {t.status === 'issued' && (
                      <button onClick={() => simulateValidate(t.id)} className="text-xs px-2 py-0.5 rounded bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/50">Validate</button>
                    )}
                    {t.printReady && t.status !== 'printed' && (
                      <button onClick={() => simulatePrint(t.id)} className="text-xs px-2 py-0.5 rounded bg-blue-900/30 border border-blue-700/40 text-blue-400 hover:bg-blue-900/50">Print</button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>{t.holder}</span>
                  {t.seatInfo && <span>{t.seatInfo}</span>}
                  {t.qrHash && <span>QR: {t.qrHash}</span>}
                  {t.venueId && <span>Venue: {t.venueId}</span>}
                  <span>{fmt(t.ts)}</span>
                  {t.errorMsg && <span className="text-red-400">{t.errorMsg}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-gray-900 border border-gray-800 rounded p-4">
          <div className="text-xs text-gray-400 mb-3">Ticket System — Launch Checklist</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Venue ticket builder',
              'Printable venue tickets (PDF)',
              'QR code generation',
              'QR validation / scan',
              'Seat map integration',
              'Ticket ownership propagation',
              'Transfer flow',
              'Refund flow',
              'NFT ticket minting',
              'Season pass creation',
              'Sponsor gift tickets',
              'Brick-and-mortar box office mode',
              'Venue-branded ticket printing',
              'Ticket receipt email',
              'Ticket diagnostics API',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-gray-600">○</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
