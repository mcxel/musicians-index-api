"use client";

import type { HomeSurfaceId } from '@/components/home/system/types';

const HOME_PAGES: ReadonlyArray<{ id: HomeSurfaceId; label: string; subtitle: string; accent: string }> = [
  { id: 1, label: 'Magazine Cover', subtitle: 'Weekly Crown + Editor Pick', accent: '#ff5b8c' },
  { id: 2, label: 'Magazine Dashboard', subtitle: 'Editorial + Discovery + Marketplace', accent: '#37d3ff' },
  { id: 3, label: 'Live World', subtitle: 'Rooms + Events + Trending', accent: '#ff7a3d' },
  { id: 4, label: 'Economy Marketplace', subtitle: 'Store + Tickets + Booking + Sponsors', accent: '#ffc647' },
  { id: 5, label: 'Community Social', subtitle: 'Friends + Chat + Parties + Contests', accent: '#5fe089' },
];

interface PageSwitcherProps {
  activePage: HomeSurfaceId;
  onChange: (page: HomeSurfaceId) => void;
  autoplayPages: boolean;
  onToggleAutoplay: () => void;
  cinematicMode: boolean;
  layoutEditable: boolean;
}

export default function PageSwitcher({
  activePage,
  onChange,
  autoplayPages,
  onToggleAutoplay,
  cinematicMode,
  layoutEditable,
}: Readonly<PageSwitcherProps>) {
  return (
    <nav
      aria-label="Homepage page switcher"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        padding: '14px 12px',
        marginBottom: 14,
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(10px)',
        background: 'linear-gradient(180deg, rgba(5,7,18,0.9), rgba(5,7,18,0.72))',
      }}
    >
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {HOME_PAGES.map((page) => {
          const isActive = page.id === activePage;
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => onChange(page.id)}
              style={{
                borderRadius: 10,
                border: isActive ? `1px solid ${page.accent}` : '1px solid rgba(255,255,255,0.18)',
                background: isActive
                  ? `linear-gradient(135deg, ${page.accent}22, rgba(0,0,0,0.35))`
                  : 'rgba(255,255,255,0.02)',
                color: '#f6f8ff',
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 }}>
                Page {page.id}
              </div>
              <div style={{ marginTop: 4, fontWeight: 700 }}>{page.label}</div>
              <div style={{ marginTop: 4, fontSize: 12, opacity: 0.82 }}>{page.subtitle}</div>
            </button>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '4px 10px',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            cinematic {cinematicMode ? 'on' : 'off'}
          </span>
          <span
            style={{
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '4px 10px',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            layout edit {layoutEditable ? 'ready' : 'restricted'}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleAutoplay}
          style={{
            borderRadius: 999,
            border: `1px solid ${autoplayPages ? 'rgba(100,230,255,0.8)' : 'rgba(255,255,255,0.25)'}`,
            color: autoplayPages ? '#64e6ff' : '#f6f8ff',
            background: autoplayPages ? 'rgba(100,230,255,0.16)' : 'rgba(255,255,255,0.06)',
            padding: '5px 12px',
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          page autoplay {autoplayPages ? 'on' : 'off'}
        </button>
      </div>
    </nav>
  );
}
