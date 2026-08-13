'use client';

/**
 * LobbyCategoryPillRow — horizontal category filter matching the Lobbies wall
 * reference design (Live Now / Games / Challenges / Cypher / Lounges / Avatars /
 * Playlists). Purely presentational — the parent owns what each pill means and
 * what data backs it. No fake counts, no hardcoded categories baked in here.
 */

export type LobbyCategoryPill = {
  id: string;
  label: string;
  icon?: string;
  accentColor?: string;
};

type LobbyCategoryPillRowProps = {
  items: LobbyCategoryPill[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function LobbyCategoryPillRow({ items, activeId, onSelect }: LobbyCategoryPillRowProps) {
  return (
    <div
      role="tablist"
      aria-label="Lobby content categories"
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '4px 2px 10px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {items.map((pill) => {
        const active = pill.id === activeId;
        const accent = pill.accentColor ?? '#00FFFF';
        return (
          <button
            key={pill.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(pill.id)}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 999,
              border: `1px solid ${active ? accent : 'rgba(255,255,255,0.14)'}`,
              background: active ? `${accent}22` : 'rgba(255,255,255,0.04)',
              color: active ? accent : 'rgba(255,255,255,0.6)',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 150ms ease',
            }}
          >
            {pill.icon && <span aria-hidden="true">{pill.icon}</span>}
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
