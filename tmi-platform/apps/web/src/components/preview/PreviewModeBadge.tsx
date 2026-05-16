'use client';
// PreviewModeBadge.tsx — Shows what type of content is in the preview window
export type PreviewMode = 'artist'|'producer'|'sponsor'|'prize'|'venue'|'event';
const MODE_CONFIG: Record<PreviewMode, { label: string; icon: string; color: string }> = {
  artist:   { label: 'Artist Preview',  icon: '🎤', color: 'var(--tmi-orange)' },
  producer: { label: 'Beat Preview',    icon: '🎵', color: 'var(--tmi-gold)' },
  sponsor:  { label: 'Sponsored',       icon: '📢', color: 'var(--tmi-cyan)' },
  prize:    { label: 'Prize',           icon: '🏆', color: 'var(--tmi-gold)' },
  venue:    { label: 'Venue',           icon: '🏟️', color: 'var(--tmi-cyan)' },
  event:    { label: 'Event',           icon: '📅', color: 'var(--tmi-orange)' },
};
export function PreviewModeBadge({ mode }: { mode: PreviewMode }) {
  const cfg = MODE_CONFIG[mode];
  return (
    <div className="tmi-preview-mode-badge" style={{ borderColor: cfg.color, color: cfg.color }}>
      {cfg.icon} {cfg.label}
    </div>
  );
}
