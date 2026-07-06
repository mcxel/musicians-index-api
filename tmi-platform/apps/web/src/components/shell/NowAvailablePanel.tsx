'use client';

import { useMemo, useState } from 'react';

export type NowAvailableCategory =
  | 'all'
  | 'music'
  | 'videos'
  | 'magazine'
  | 'events'
  | 'store'
  | 'features'
  | 'trending';

export interface NowAvailableItem {
  id: string;
  title: string;
  kind: 'song' | 'video' | 'magazine' | 'event' | 'merch' | 'feature' | 'trend';
  subtitle?: string;
  href?: string;
  isNew?: boolean;
}

interface NowAvailablePanelProps {
  accentColor?: string;
  items?: NowAvailableItem[];
  onSelect?: (item: NowAvailableItem) => void;
}

const DEFAULT_ITEMS: NowAvailableItem[] = [
  { id: 'song-1', title: 'Big Kazhdog - New Single', kind: 'song', subtitle: 'World Release' , isNew: true },
  { id: 'video-1', title: 'Queen Brii - New Video', kind: 'video', subtitle: 'Live in Thunder Dome', isNew: true },
  { id: 'mag-1', title: 'July Magazine Issue', kind: 'magazine', subtitle: 'Cover Story + Interviews', isNew: true },
  { id: 'event-1', title: 'Thunder Dome Tickets', kind: 'event', subtitle: '12 events now open' },
  { id: 'merch-1', title: 'Limited Neon Merch Drop', kind: 'merch', subtitle: 'Store update' },
  { id: 'feat-1', title: 'New Monitor Feed: NOW AVAILABLE', kind: 'feature', subtitle: 'Runtime update' },
  { id: 'trend-1', title: 'Trending Releases This Week', kind: 'trend', subtitle: 'Music + Video + Magazine' },
];

export default function NowAvailablePanel({
  accentColor = '#00FFFF',
  items = DEFAULT_ITEMS,
  onSelect,
}: NowAvailablePanelProps) {
  const [category, setCategory] = useState<NowAvailableCategory>('all');

  const filtered = useMemo(() => {
    if (category === 'all') return items;
    const map: Record<Exclude<NowAvailableCategory, 'all'>, NowAvailableItem['kind'][]> = {
      music: ['song'],
      videos: ['video'],
      magazine: ['magazine'],
      events: ['event'],
      store: ['merch'],
      features: ['feature'],
      trending: ['trend'],
    };
    return items.filter((item) => map[category].includes(item.kind));
  }, [category, items]);

  const tabs: Array<{ id: NowAvailableCategory; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'music', label: 'Music' },
    { id: 'videos', label: 'Videos' },
    { id: 'magazine', label: 'Magazine' },
    { id: 'events', label: 'Events' },
    { id: 'store', label: 'Store' },
    { id: 'features', label: 'Features' },
    { id: 'trending', label: 'Trending' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tabs.map((tab) => {
          const active = tab.id === category;
          return (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              style={{
                background: active ? `${accentColor}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? `${accentColor}66` : 'rgba(255,255,255,0.12)'}`,
                color: active ? accentColor : 'rgba(255,255,255,0.65)',
                borderRadius: 999,
                padding: '4px 8px',
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.06em',
                cursor: 'pointer',
              }}
            >
              {tab.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect?.(item)}
            style={{
              textAlign: 'left',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '8px 10px',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, color: accentColor, fontWeight: 700 }}>{kindLabel(item.kind)}</span>
              {item.isNew && (
                <span style={{
                  fontSize: 7,
                  color: '#00FF88',
                  background: 'rgba(0,255,136,0.14)',
                  border: '1px solid rgba(0,255,136,0.32)',
                  padding: '1px 5px',
                  borderRadius: 999,
                  letterSpacing: '0.08em',
                  fontWeight: 800,
                }}>
                  NEW
                </span>
              )}
            </div>
            <div style={{ marginTop: 3, fontSize: 10, fontWeight: 700 }}>{item.title}</div>
            {item.subtitle && (
              <div style={{ marginTop: 2, fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>{item.subtitle}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function kindLabel(kind: NowAvailableItem['kind']): string {
  switch (kind) {
    case 'song': return '🎵 MUSIC';
    case 'video': return '🎥 VIDEO';
    case 'magazine': return '📰 MAGAZINE';
    case 'event': return '🎟 EVENT';
    case 'merch': return '🛍 STORE';
    case 'feature': return '🎮 FEATURE';
    case 'trend': return '🔥 TRENDING';
  }
}
