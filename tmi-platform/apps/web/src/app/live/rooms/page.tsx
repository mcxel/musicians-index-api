'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useDiscoveryBus } from '@/lib/discovery/useDiscoveryBus';
import type { LiveDiscoveryCategory, LiveDiscoveryRecord } from '@/lib/discovery/LiveDiscoveryRecord';

export const dynamic = 'force-dynamic';

const FILTERS = [
  { id: 'ALL', label: 'ALL' },
  { id: 'battles', label: 'BATTLE' },
  { id: 'cyphers', label: 'CYPHER' },
  { id: 'concerts', label: 'CONCERT' },
  { id: 'games', label: 'GAME SHOW' },
  { id: 'lounges', label: 'SESSION' },
  { id: 'dance', label: 'DANCE' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

function matchesFilter(record: LiveDiscoveryRecord, filter: FilterId): boolean {
  if (filter === 'ALL') return true;
  return record.category === filter || record.categories.includes(filter as LiveDiscoveryCategory);
}

export default function BillboardLobbyWallPage() {
  const records = useDiscoveryBus(null);
  const [filter, setFilter] = useState<FilterId>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((record) => {
      if (!matchesFilter(record, filter)) return false;
      if (!q) return true;
      return record.title.toLowerCase().includes(q) || record.hostName.toLowerCase().includes(q);
    });
  }, [records, filter, searchQuery]);

  const roomsLive = records.filter((record) => record.isLive).length;
  const watching = records.reduce((sum, record) => sum + Math.max(0, record.humanViewerCount), 0);
  const battles = records.filter((record) => record.isLive && (record.category === 'battles' || record.categories.includes('battles'))).length;
  const cyphers = records.filter((record) => record.isLive && (record.category === 'cyphers' || record.categories.includes('cyphers'))).length;

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(5,5,16,0.92)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: '#00FFFF', textDecoration: 'none', letterSpacing: '0.14em', flexShrink: 0 }}>TMI</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 900, color: '#fff', letterSpacing: '0.12em' }}>LIVE ROOMS</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>· {watching.toLocaleString()} watching</span>
        </div>
        <input
          type="search"
          placeholder="Search rooms…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          style={{ flex: 1, minWidth: 140, maxWidth: 280, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, outline: 'none' }}
        />
        <Link href="/live/go" style={{ marginLeft: 'auto', padding: '7px 16px', borderRadius: 8, background: 'linear-gradient(90deg,#FF2DAA,#AA2DFF)', color: '#fff', fontSize: 10, fontWeight: 900, textDecoration: 'none', letterSpacing: '0.1em', whiteSpace: 'nowrap', flexShrink: 0 }}>
          GO LIVE
        </Link>
      </nav>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {FILTERS.map((item) => {
            const count = item.id === 'ALL'
              ? records.length
              : records.filter((record) => matchesFilter(record, item.id)).length;
            return (
              <button key={item.id} type="button" onClick={() => setFilter(item.id)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 9, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.08em', background: filter === item.id ? 'rgba(0,255,255,0.18)' : 'rgba(255,255,255,0.05)', color: filter === item.id ? '#00FFFF' : 'rgba(255,255,255,0.45)', outline: filter === item.id ? '1px solid rgba(0,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)', border: 'none' }}>
                {item.label} <span style={{ opacity: 0.6 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <div data-testid="live-rooms-empty" style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
            No live rooms.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {visible.map((record) => (
              <Link
                key={record.id}
                href={record.joinRoute}
                data-room-id={record.roomId}
                style={{ textDecoration: 'none', color: 'inherit', minWidth: 0 }}
              >
                <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: 10, overflow: 'hidden', background: '#050510', border: '1px solid rgba(0,255,255,0.25)' }}>
                  {record.previewUrl ? (
                    <video src={record.previewUrl} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                      No preview
                    </div>
                  )}
                  <div style={{ position: 'absolute', left: 8, right: 8, bottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{record.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                      {record.isLive ? 'LIVE' : 'OFFLINE'} · {Math.max(0, record.humanViewerCount).toLocaleString()} watching
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'ROOMS LIVE', value: String(roomsLive), color: '#00FFFF' },
            { label: 'TOTAL WATCHING', value: watching.toLocaleString(), color: '#FF2DAA' },
            { label: 'BATTLES ACTIVE', value: String(battles), color: '#FFD700' },
            { label: 'CYPHERS OPEN', value: String(cyphers), color: '#AA2DFF' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
