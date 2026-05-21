// ════════════════════════════════════════════════════════
// COMPONENT SHELLS — TMI Design Language
// All components use PDF/TMI visual system:
//   - Deep navy/purple background
//   - Neon orange-red (#FF4800) primary accent
//   - Gold (#F4A800) secondary
//   - Cyan (#00E5D0) tertiary  
//   - Scattered triangle decorations
//   - Rounded panels with glowing borders
//   - Bold display typography
// ════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/room/ArenaRoomShell.tsx
// PURPOSE: Arena room visual shell — ready for Copilot wiring
// ─────────────────────────────────────────────────────────
export function ArenaRoomShell({ roomId, venueId }: { roomId: string; venueId?: string }) {
  return (
    <div className="arena-room-shell" data-room-id={roomId} data-venue-id={venueId}>
      {/* STAGE AREA */}
      <div className="arena-stage">
        <div className="arena-preview-dock" data-slot="shared-preview">
          {/* SharedPreviewWindow mounts here */}
          <div className="preview-placeholder">Preview Stage</div>
        </div>
        <div className="arena-performer-tiles" data-slot="performer-tiles">
          {/* Performer video tiles */}
        </div>
      </div>

      {/* AUDIENCE AREA */}
      <div className="arena-audience" data-slot="audience">
        {/* AudienceReactionRail mounts here */}
      </div>

      {/* CONTROLS */}
      <div className="arena-controls" data-slot="controls">
        {/* TurnQueueDock + LiveControlPanel mounts here */}
      </div>

      {/* CHAT */}
      <div className="arena-chat" data-slot="chat">
        {/* CommentaryPanel mounts here */}
      </div>

      {/* WATCHDOG */}
      <div data-slot="watchdog">
        {/* RoomWatchdogBadge mounts here */}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/room/CypherRoomShell.tsx
// PURPOSE: Cypher room with mic queue and beat preview
// ─────────────────────────────────────────────────────────
export function CypherRoomShell({ roomId }: { roomId: string }) {
  return (
    <div className="cypher-room-shell" data-room-id={roomId}>
      <div className="cypher-stage" data-slot="stage">
        <div className="cypher-performer" data-slot="current-performer">
          {/* Current performer tile */}
        </div>
        <div className="cypher-beat-display" data-slot="beat-preview">
          {/* BeatPreviewPanel mounts here */}
          <div className="beat-placeholder">Beat Preview</div>
        </div>
      </div>
      <div className="cypher-queue" data-slot="queue">
        {/* TurnQueueDock mounts here */}
      </div>
      <div className="cypher-audience" data-slot="audience">
        {/* Audience tiles and reactions */}
      </div>
      <div className="cypher-controls" data-slot="controls">
        {/* Request mic · View queue · React */}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/room/MiniCypherRoomShell.tsx
// PURPOSE: Open drop-in cypher — anyone can join/leave
// ─────────────────────────────────────────────────────────
export function MiniCypherRoomShell({ roomId }: { roomId: string }) {
  return (
    <div className="mini-cypher-shell" data-room-id={roomId}>
      <div className="mini-cypher-info">
        <div className="drop-in-badge">Open · Drop In Anytime</div>
        <div className="mini-cypher-genre" data-slot="genre">{/* Genre tag */}</div>
        <div className="mini-cypher-bpm" data-slot="bpm">{/* BPM */}</div>
      </div>
      <div className="mini-cypher-performers" data-slot="performers">
        {/* Performer tiles — ordered by join time */}
      </div>
      <div className="mini-cypher-controls" data-slot="controls">
        <button className="tmi-btn-primary">Jump In</button>
        <button className="tmi-btn-ghost">Watch</button>
        <button className="tmi-btn-ghost">Request Beat</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/room/BackstageRoomShell.tsx
// PURPOSE: Pre-live staging area for performers
// ─────────────────────────────────────────────────────────
export function BackstageRoomShell({ eventId }: { eventId: string }) {
  return (
    <div className="backstage-shell" data-event-id={eventId}>
      <div className="backstage-header">
        <div className="backstage-label">Backstage — Pre-Live Only</div>
        <div className="event-countdown" data-slot="countdown">
          {/* Countdown to show start */}
        </div>
      </div>
      <div className="backstage-lineup" data-slot="lineup">
        {/* Ordered performer list with ready/not-ready status */}
      </div>
      <div className="backstage-soundcheck" data-slot="soundcheck">
        {/* Quick soundcheck panel */}
        <div className="soundcheck-status">Mic · Beat Preview · Video Test</div>
      </div>
      <div className="backstage-host-notes" data-slot="host-notes">
        {/* Show notes from host */}
      </div>
      <div className="backstage-ready-action">
        <button className="tmi-btn-primary">Mark Ready</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/lobby/LobbyWallPanel.tsx
// PURPOSE: The 8-grid live room wall — sorted discovery-first
// ─────────────────────────────────────────────────────────
export function LobbyWallPanel() {
  // CRITICAL: sorted by viewers ASCENDING — 0 viewers = position 1
  // Copilot wires: useRoomList({ sort: 'viewers_asc' })
  return (
    <div className="lobby-wall-panel">
      <div className="lobby-wall-header">
        <span className="lobby-wall-label">Live Now</span>
        <span className="lobby-wall-sub">Discover new artists first</span>
      </div>
      <div className="lobby-wall-grid">
        {/* 8 room cards — rendered by Copilot from live API */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="lobby-wall-tile" data-position={i + 1}>
            <div className="lobby-tile-img-placeholder" />
            <div className="lobby-tile-info">
              <div className="lobby-tile-name">Artist Name</div>
              <div className="lobby-tile-viewers">0 viewers</div>
              <div className="lobby-live-badge">● LIVE</div>
            </div>
          </div>
        ))}
      </div>
      <button className="tmi-btn-ghost lobby-wall-more">See All Live Rooms</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/lobby/CountdownCard.tsx
// PURPOSE: Live countdown timer card — numbers move in real-time
// ─────────────────────────────────────────────────────────
interface CountdownCardProps {
  targetDate: Date;
  title: string;
  subtitle?: string;
  albumArtUrl?: string;
  onExpire?: () => void;
  variant?: 'premiere' | 'event' | 'battle' | 'cypher' | 'sponsor';
}

export function CountdownCard({ targetDate, title, subtitle, albumArtUrl, onExpire, variant = 'premiere' }: CountdownCardProps) {
  // Copilot wires: useCountdown(targetDate, onExpire)
  // Numbers must animate on each tick
  return (
    <div className={`countdown-card countdown-card--${variant}`}>
      {albumArtUrl && <div className="countdown-art" style={{ backgroundImage: `url(${albumArtUrl})` }} />}
      <div className="countdown-content">
        <div className="countdown-label">{variant === 'premiere' ? 'World Premiere' : 'Event Starts'}</div>
        <div className="countdown-title">{title}</div>
        {subtitle && <div className="countdown-subtitle">{subtitle}</div>}
        <div className="countdown-digits" data-slot="countdown-digits">
          {/* Format: HH:MM:SS:MS — animated by Copilot */}
          <div className="countdown-display">01:14:32:05</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/artist/ArtistHeroPanel.tsx
// PURPOSE: Top of artist profile hub — photo, name, tier, stats
// ─────────────────────────────────────────────────────────
export function ArtistHeroPanel({ slug }: { slug: string }) {
  // Copilot wires: useArtistProfile(slug)
  return (
    <div className="artist-hero-panel">
      {/* Background photo bleeds into panel */}
      <div className="artist-hero-bg" data-slot="hero-bg" />
      
      <div className="artist-hero-content">
        {/* Avatar */}
        <div className="artist-avatar-frame" data-slot="avatar">
          <div className="artist-avatar-placeholder" />
        </div>

        {/* Identity */}
        <div className="artist-hero-identity">
          <div className="artist-rank" data-slot="rank">#3 Overall</div>
          <h1 className="artist-name" data-slot="name">Artist Name</h1>
          <div className="artist-handle" data-slot="handle">@artisthandle</div>
          
          {/* Tier badge */}
          <div className="artist-tier" data-slot="tier">
            <DiamondTierBadge tier="diamond" />
          </div>

          {/* Genre tags */}
          <div className="artist-genres" data-slot="genres">
            <span className="genre-tag">Hip Hop</span>
            <span className="genre-tag">Trap</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="artist-hero-stats" data-slot="stats">
          <div className="stat"><span className="stat-num">1.4K</span><span className="stat-label">Followers</span></div>
          <div className="stat"><span className="stat-num">12</span><span className="stat-label">Cypher Wins</span></div>
          <div className="stat"><span className="stat-num">$1,870</span><span className="stat-label">Revenue</span></div>
        </div>

        {/* Actions */}
        <div className="artist-hero-actions">
          <button className="tmi-btn-primary">Follow</button>
          <button className="tmi-btn-ghost">Go Live</button>
          <button className="tmi-btn-ghost">Book</button>
          <button className="tmi-btn-ghost">Upload Link</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/artist/DiamondTierBadge.tsx  
// PURPOSE: Shows tier with TMI visual styling — Diamond glows
// ─────────────────────────────────────────────────────────
interface DiamondTierBadgeProps {
  tier: 'free' | 'bronze' | 'gold' | 'diamond' | 'signature';
}

const TIER_STYLES = {
  free:      { label: 'Free',      color: '#4CAF50', glow: '#4CAF5044' },
  bronze:    { label: 'Bronze',    color: '#CD7F32', glow: '#CD7F3244' },
  gold:      { label: 'Gold',      color: '#FFD700', glow: '#FFD70044' },
  diamond:   { label: 'Diamond',   color: '#00E5FF', glow: '#00E5FF66' },
  signature: { label: 'Signature', color: '#FF4800', glow: '#FF480066' },
};

export function DiamondTierBadge({ tier }: DiamondTierBadgeProps) {
  const style = TIER_STYLES[tier];
  return (
    <div
      className="tier-badge"
      style={{
        color: style.color,
        border: `1px solid ${style.color}`,
        boxShadow: `0 0 12px ${style.glow}`,
        padding: '4px 12px',
        fontSize: '10px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      }}
    >
      {tier === 'diamond' && '💎 '}
      {style.label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/venue/VenueHeroPanel.tsx
// PURPOSE: Top of venue page — identity, schedule, rooms
// ─────────────────────────────────────────────────────────
export function VenueHeroPanel({ slug }: { slug: string }) {
  // Copilot wires: useVenueProfile(slug)
  return (
    <div className="venue-hero-panel">
      <div className="venue-hero-bg" data-slot="venue-bg" />
      <div className="venue-hero-content">
        <div className="venue-identity">
          <div className="venue-type-badge" data-slot="type">Club · Hip Hop</div>
          <h1 className="venue-name" data-slot="name">Venue Name</h1>
          <div className="venue-location" data-slot="location">Atlanta, GA</div>
          <div className="venue-digital-badge">Digital Venue Twin Active</div>
        </div>
        <div className="venue-stats" data-slot="stats">
          <div className="stat"><span className="stat-num">24</span><span className="stat-label">Shows This Month</span></div>
          <div className="stat"><span className="stat-num">3</span><span className="stat-label">Live Now</span></div>
        </div>
        <div className="venue-actions">
          <button className="tmi-btn-primary">Join Active Room</button>
          <button className="tmi-btn-ghost">View Schedule</button>
          <button className="tmi-btn-ghost">Book This Venue</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/preview/SharedPreviewStagePanel.tsx
// PURPOSE: The staple preview feature — appears in all rooms
// ─────────────────────────────────────────────────────────
interface SharedPreviewStagePanelProps {
  mode?: 'artist' | 'producer' | 'sponsor' | 'prize' | 'venue' | 'event';
  isOpen?: boolean;
  ownerName?: string;
  mediaTitle?: string;
  mediaThumbnail?: string;
  sourceType?: string;
}

export function SharedPreviewStagePanel({
  mode = 'artist',
  isOpen = false,
  ownerName,
  mediaTitle,
  mediaThumbnail,
  sourceType,
}: SharedPreviewStagePanelProps) {
  if (!isOpen) return null;
  
  return (
    <div className={`preview-stage-panel preview-stage--${mode}`}>
      {/* Mode badge */}
      <div className="preview-mode-badge">
        {mode === 'sponsor' ? '📢 Sponsored' : 
         mode === 'prize' ? '🏆 Prize' :
         mode === 'producer' ? '🎵 Beat Preview' :
         '🎤 Artist Preview'}
      </div>

      {/* Owner */}
      {ownerName && (
        <div className="preview-owner">
          Shared by <strong>{ownerName}</strong>
        </div>
      )}

      {/* Media area */}
      <div className="preview-media-area">
        {mediaThumbnail ? (
          <img src={mediaThumbnail} alt={mediaTitle} className="preview-thumbnail" />
        ) : (
          <div className="preview-media-placeholder">
            <div className="preview-play-icon">▶</div>
          </div>
        )}
        {/* Actual embed rendered by Copilot based on sourceType */}
        <div data-slot="embed-target" data-source-type={sourceType} />
      </div>

      {/* Title */}
      {mediaTitle && <div className="preview-title">{mediaTitle}</div>}

      {/* Non-interference note: preview docked to side, not over performer */}
      {/* Visual positioning handled by ADAPTIVE_PREVIEW_LAYOUT_ENGINE */}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FILE: apps/web/src/components/operator/GlobalCommandCenterShell.tsx
// PURPOSE: Big Ace's command center — sees everything
// ─────────────────────────────────────────────────────────
export function GlobalCommandCenterShell() {
  return (
    <div className="command-center-shell">
      <div className="command-center-header">
        <h1 className="command-title">GLOBAL ADMIN COMMAND</h1>
        <div className="command-brand">THE MUSICIAN'S INDEX · BERNTOUTGLOBAL</div>
        <div className="command-live-status">● SYSTEM LIVE</div>
      </div>

      <div className="command-grid">
        {/* Health panels */}
        <div data-slot="watchdog-grid">
          {/* WatchdogGridPanel */}
        </div>

        {/* Bot status */}
        <div data-slot="bot-status">
          {/* BotStatusPanel */}
        </div>

        {/* Runtime contracts */}
        <div data-slot="runtime-contracts">
          {/* RuntimeContractStatusPanel */}
        </div>

        {/* Feature flags */}
        <div data-slot="feature-flags">
          {/* FeatureFlagPanel */}
        </div>

        {/* Incident timeline */}
        <div data-slot="incidents">
          {/* IncidentTimelinePanel */}
        </div>

        {/* Recovery actions */}
        <div data-slot="recovery">
          {/* RecoveryActionsPanel */}
        </div>
      </div>

      <div className="command-actions">
        <button className="tmi-btn-danger">Emergency Broadcast</button>
        <button className="tmi-btn-warning">Emergency Read-Only Mode</button>
        <button className="tmi-btn-ghost">Override Crown</button>
      </div>
    </div>
  );
}
