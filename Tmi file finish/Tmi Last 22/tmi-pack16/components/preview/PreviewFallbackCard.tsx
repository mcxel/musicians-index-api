'use client';
// PreviewFallbackCard.tsx — Shows when media source fails to load
// Must always render something — never show empty broken box
// Copilot wires: triggered by SharedPreviewProvider on source error
// Proof: if embed fails, fallback card shows with track info
export function PreviewFallbackCard({ title, artistName, accentColor }: { title?: string; artistName?: string; accentColor?: string }) {
  return (
    <div className="tmi-preview-fallback" style={{ borderColor: accentColor || 'var(--tmi-orange)' }}>
      <div className="tmi-preview-fallback__icon">🎵</div>
      {title && <div className="tmi-preview-fallback__title">{title}</div>}
      {artistName && <div className="tmi-preview-fallback__artist">{artistName}</div>}
      <div className="tmi-preview-fallback__status">Preview unavailable — audio only</div>
    </div>
  );
}
