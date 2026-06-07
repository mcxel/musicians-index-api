'use client';

// ShowcaseRoomShell — non-competitive performance shell
// Used for: DJ Showcase, Comedy Showcase, Dance Showcase, Singer Showcase,
//           Band Showcase, Producer Showcase, Actor Showcase, etc.
// Rule: no winner/loser scoring. Audience reacts, tips, and rates freely.

export type ShowcaseFormat =
  | 'dj' | 'comedy' | 'dance' | 'singer' | 'band'
  | 'producer' | 'actor' | 'spoken-word' | 'magician' | 'instrumentalist';

const FORMAT_LABELS: Record<ShowcaseFormat, string> = {
  dj: 'DJ SHOWCASE',
  comedy: 'COMEDY SHOWCASE',
  dance: 'DANCE SHOWCASE',
  singer: 'SINGER SHOWCASE',
  band: 'BAND SHOWCASE',
  producer: 'PRODUCER SHOWCASE',
  actor: 'ACTOR SHOWCASE',
  'spoken-word': 'SPOKEN WORD SHOWCASE',
  magician: 'MAGICIAN SHOWCASE',
  instrumentalist: 'INSTRUMENTALIST SHOWCASE',
};

const FORMAT_ACCENT: Record<ShowcaseFormat, string> = {
  dj: '#00FFFF',
  comedy: '#FFD700',
  dance: '#FF2DAA',
  singer: '#AA2DFF',
  band: '#FF6B35',
  producer: '#00FF88',
  actor: '#FF8C00',
  'spoken-word': '#40C4FF',
  magician: '#ADFF2F',
  instrumentalist: '#FF3B5C',
};

interface ShowcaseRoomShellProps {
  roomId: string;
  format?: ShowcaseFormat;
}

export function ShowcaseRoomShell({ roomId, format = 'singer' }: ShowcaseRoomShellProps) {
  const label = FORMAT_LABELS[format] ?? 'SHOWCASE';
  const accent = FORMAT_ACCENT[format] ?? '#00FFFF';

  return (
    <div
      className="tmi-showcase-room"
      data-room-id={roomId}
      data-format={format}
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#050510', color: '#fff' }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: `1px solid ${accent}30`,
        background: `linear-gradient(90deg, ${accent}12, transparent)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: accent, color: '#050510', fontWeight: 900,
            fontSize: 10, letterSpacing: '0.18em', padding: '4px 10px', borderRadius: 4,
          }}>
            {label}
          </div>
          <div
            data-slot="live-indicator"
            style={{ fontSize: 10, color: accent, fontWeight: 800, letterSpacing: '0.1em' }}
          >
            ● LIVE
          </div>
        </div>
        <div data-slot="audience-count" style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
          0 watching
        </div>
      </div>

      {/* Stage — main performance area */}
      <div
        data-slot="stage"
        style={{
          flex: 1, position: 'relative', minHeight: 320,
          background: `radial-gradient(ellipse at center, ${accent}18 0%, #050510 70%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Performer tile */}
        <div
          data-slot="performer-tile"
          style={{
            textAlign: 'center', padding: 24,
            border: `1px solid ${accent}40`, borderRadius: 16,
            background: `${accent}10`, minWidth: 220,
          }}
        >
          <div data-slot="performer-avatar" style={{
            width: 96, height: 96, borderRadius: '50%',
            background: `${accent}30`, margin: '0 auto 12px',
            border: `2px solid ${accent}`,
          }} />
          <div data-slot="performer-name" style={{ fontSize: 18, fontWeight: 900 }}>Performer</div>
          <div data-slot="performer-genre" style={{ fontSize: 11, color: accent, marginTop: 4, letterSpacing: '0.1em' }}>
            {format.toUpperCase()}
          </div>
          <div data-slot="tips-count" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
            $0 in tips
          </div>
        </div>

        {/* Sponsor overlay — injected by SponsorArtistDiscoveryEngine */}
        <div data-slot="sponsor-overlay" style={{ position: 'absolute', top: 12, right: 12 }} />
      </div>

      {/* Audience reaction bar */}
      <div
        data-slot="reaction-bar"
        style={{
          display: 'flex', gap: 8, padding: '10px 16px',
          borderTop: `1px solid rgba(255,255,255,0.07)`,
          background: 'rgba(0,0,0,0.4)', overflowX: 'auto',
        }}
      >
        {['🔥', '💎', '👏', '🎤', '⭐', '💰'].map((emoji) => (
          <button
            key={emoji}
            data-reaction={emoji}
            style={{
              background: 'rgba(255,255,255,0.07)', border: `1px solid rgba(255,255,255,0.12)`,
              borderRadius: 20, padding: '6px 14px', fontSize: 16,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            {emoji}
          </button>
        ))}

        {/* Tip button */}
        <button
          data-slot="tip-button"
          style={{
            marginLeft: 'auto', background: accent, color: '#050510',
            border: 'none', borderRadius: 20, padding: '6px 16px',
            fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', cursor: 'pointer', flexShrink: 0,
          }}
        >
          💰 TIP
        </button>
      </div>

      {/* Chat + audience panel */}
      <div
        data-slot="chat-panel"
        style={{
          height: 200, borderTop: `1px solid rgba(255,255,255,0.07)`,
          padding: '10px 16px', overflowY: 'auto',
          background: 'rgba(0,0,0,0.3)',
        }}
      >
        {/* RoomChatEngine injects messages here */}
      </div>

      {/* Performer controls — only shown to the performing artist */}
      <div
        data-slot="performer-controls"
        data-visible-to="performer"
        style={{
          display: 'flex', gap: 10, padding: '12px 16px',
          borderTop: `1px solid ${accent}30`,
          background: `${accent}08`,
        }}
      >
        <button data-slot="go-live-btn" style={{
          background: '#00FF88', color: '#050510', border: 'none',
          borderRadius: 8, padding: '10px 20px', fontWeight: 900, fontSize: 12, cursor: 'pointer',
        }}>
          ▶ GO LIVE
        </button>
        <button data-slot="end-show-btn" style={{
          background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8, padding: '10px 20px', fontWeight: 800, fontSize: 12, cursor: 'pointer',
        }}>
          END SHOW
        </button>
        <div data-slot="duration-counter" style={{ marginLeft: 'auto', fontSize: 13, color: accent, fontWeight: 900, alignSelf: 'center' }}>
          00:00
        </div>
      </div>
    </div>
  );
}
