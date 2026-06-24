'use client';

/**
 * GoLiveRuntime — persistent live show wrapper.
 *
 * The show never stops. The runtime never unloads. Modes switch, nothing reloads.
 *
 * Mode A — FULL_VENUE: stage fills screen (audience, reactions, performers, effects)
 * Mode B — DASHBOARD: venue shrinks to background; dashboard overlay slides in
 * Mode C — canisters pop over the venue via CanisterDock (never a page nav)
 *
 * Control booth canisters (all draggable, all dockable via CanisterShell):
 *   Lighting · Effects · Camera · Banner · Sponsor · Director
 *
 * Rule 21: this is a mode of the ONE Venue Runtime, not a separate system.
 */

import {
  useState, useCallback, type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import UniversalVenueRenderer from '@/components/live/UniversalVenueRenderer';
import CanisterShell from '@/components/canisters/CanisterShell';
import EventOwnerControls from '@/components/live/EventOwnerControls';

// ─── Mode types ───────────────────────────────────────────────────────────────

type ViewMode = 'FULL_VENUE' | 'DASHBOARD' | 'BACKSTAGE';

// ─── Control canister content ─────────────────────────────────────────────────

function LightingContent({ accentColor }: { accentColor: string }) {
  const [active, setActive] = useState('purple-wash');
  const PRESETS = [
    { id: 'purple-wash',   label: 'Purple Wash',    color: '#AA2DFF' },
    { id: 'blue-arena',    label: 'Blue Arena',     color: '#00E5FF' },
    { id: 'concert-red',   label: 'Concert Red',    color: '#FF2020' },
    { id: 'spotlight',     label: 'Spotlight',      color: '#FFD700' },
    { id: 'audience-glow', label: 'Audience Glow',  color: '#FF2DAA' },
    { id: 'strobe',        label: 'Strobe',         color: '#fff' },
    { id: 'blackout',      label: 'Blackout',       color: '#111' },
    { id: 'rainbow',       label: 'Rainbow Cycle',  color: '#FF6B35' },
  ];
  return (
    <div style={{ padding: 14 }}>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '.15em', marginBottom: 10 }}>LIGHTING PRESET</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PRESETS.map(p => (
          <button
            key={p.id}
            onClick={() => setActive(p.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px',
              background: active === p.id ? `${p.color}18` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active === p.id ? p.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8, cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.color, flexShrink: 0, boxShadow: active === p.id ? `0 0 8px ${p.color}` : 'none' }} />
            <span style={{ fontSize: 11, fontWeight: active === p.id ? 900 : 600, color: active === p.id ? p.color : 'rgba(255,255,255,0.6)' }}>{p.label}</span>
            {active === p.id && <span style={{ marginLeft: 'auto', fontSize: 8, color: p.color, fontWeight: 900 }}>ACTIVE</span>}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 8, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
        Lighting changes apply to your venue in real time. Audience sees the effect immediately.
      </div>
    </div>
  );
}

function DirectorContent({ accentColor }: { accentColor: string }) {
  const [layout, setLayout] = useState('THREE_EQUAL');
  const [speed, setSpeed] = useState(90);
  const LAYOUTS = [
    { id: 'THREE_EQUAL', label: 'Three Equal', icon: '⊟' },
    { id: 'VS_MODE', label: 'VS Mode', icon: '⚔️' },
    { id: 'A_FEATURED', label: 'Feature A', icon: '◧' },
    { id: 'B_FEATURED', label: 'Feature B', icon: '◨' },
    { id: 'HOST_FEATURED', label: 'Host Center', icon: '◻' },
    { id: 'HOST_LEFT', label: 'Host Left', icon: '▷◻' },
  ];
  return (
    <div style={{ padding: 14 }}>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '.15em', marginBottom: 10 }}>SPLIT LAYOUT</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
        {LAYOUTS.map(l => (
          <button
            key={l.id}
            onClick={() => setLayout(l.id)}
            style={{
              padding: '8px 6px',
              background: layout === l.id ? `${accentColor}18` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${layout === l.id ? accentColor : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 8, cursor: 'pointer',
              fontSize: 10, color: layout === l.id ? accentColor : 'rgba(255,255,255,0.5)',
              fontWeight: layout === l.id ? 900 : 600,
            }}
          >
            {l.icon} {l.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '.15em', marginBottom: 6 }}>ROTATION SPEED</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Fast</span>
        <input
          type="range" min={20} max={180} value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          style={{ flex: 1, accentColor }}
        />
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Slow</span>
        <span style={{ fontSize: 10, fontWeight: 900, color: accentColor, minWidth: 36 }}>{speed}s</span>
      </div>
    </div>
  );
}

function BannerContent() {
  const [bannerText, setBannerText] = useState('');
  return (
    <div style={{ padding: 14 }}>
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '.15em', marginBottom: 8 }}>BANNER TEXT</div>
      <input
        value={bannerText}
        onChange={e => setBannerText(e.target.value)}
        placeholder="Your message to the audience…"
        maxLength={80}
        style={{
          width: '100%', padding: '9px 12px', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none', marginBottom: 10,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['💸 SEND A TIP', '🛍️ MERCH AVAILABLE NOW', '⭐ JOIN MY FAN CLUB', '🔥 BATTLE ME', '📀 NEW TRACK DROPPING'].map(t => (
          <button key={t} onClick={() => setBannerText(t)} style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: 'rgba(255,255,255,0.55)', fontSize: 10, cursor: 'pointer', textAlign: 'left' }}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Canister dock ────────────────────────────────────────────────────────────

type DockItem = { id: string; icon: string; label: string; content: ReactNode };

function CanisterDock({ accentColor, eventId, onOwnerAction }: { accentColor: string; eventId: string; onOwnerAction?: () => void }) {
  const DOCK_ITEMS: DockItem[] = [
    {
      id: 'lighting', icon: '💡', label: 'Lighting',
      content: <LightingContent accentColor={accentColor} />,
    },
    {
      id: 'director', icon: '🎬', label: 'Director',
      content: <DirectorContent accentColor={accentColor} />,
    },
    {
      id: 'banner', icon: '📢', label: 'Banner',
      content: <BannerContent />,
    },
    {
      id: 'owner', icon: '⚙️', label: 'Controls',
      content: <EventOwnerControls eventId={eventId} inline />,
    },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 12px',
      background: 'rgba(5,3,16,0.92)',
      backdropFilter: 'blur(10px)',
      borderTop: `1px solid ${accentColor}22`,
    }}>
      <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '.15em', marginRight: 4 }}>
        CONTROL BOOTH
      </span>
      {DOCK_ITEMS.map(item => (
        <CanisterShell
          key={item.id}
          type={item.id === 'banner' ? 'messaging' : item.id === 'owner' ? 'activity' : 'playlist'}
          icon={item.icon}
          label={item.label}
          accentColor={accentColor}
          expandedWidth={300}
          expandedHeight={380}
          disableFullscreen
        >
          {item.content}
        </CanisterShell>
      ))}
    </div>
  );
}

// ─── Dashboard overlay content (shown in DASHBOARD mode) ─────────────────────

function DashboardOverlay({ onReturn, accentColor }: { onReturn: () => void; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, rgba(10,6,20,0.97) 0%, rgba(5,3,16,0.98) 100%)',
        backdropFilter: 'blur(24px)',
        zIndex: 100,
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px',
        borderBottom: `1px solid ${accentColor}22`,
      }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: accentColor, letterSpacing: '.12em' }}>
          PERFORMER DASHBOARD
        </span>
        <span style={{ fontSize: 8, color: 'rgba(0,255,136,0.7)', background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 4, padding: '2px 8px', fontWeight: 900 }}>
          🔴 SHOW RUNNING
        </span>
        <button
          onClick={onReturn}
          style={{
            marginLeft: 'auto',
            padding: '7px 16px',
            background: accentColor,
            border: 'none', borderRadius: 8,
            fontSize: 10, fontWeight: 900, color: '#050310',
            cursor: 'pointer', letterSpacing: '.06em',
            boxShadow: `0 0 16px ${accentColor}44`,
          }}
        >
          ← RETURN TO VENUE
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, alignContent: 'start' }}>
        {[
          { icon: '📊', label: 'Analytics', href: '#', color: '#00E5FF' },
          { icon: '💸', label: 'Tips Received', href: '#', color: '#FFD700' },
          { icon: '📢', label: 'Announcements', href: '#', color: '#FF2DAA' },
          { icon: '🎵', label: 'Setlist', href: '#', color: '#AA2DFF' },
          { icon: '👥', label: 'Audience', href: '#', color: '#00FF88' },
          { icon: '🤝', label: 'Sponsors', href: '#', color: '#FF6B35' },
          { icon: '🛒', label: 'Merch Store', href: '#', color: '#C0A0FF' },
          { icon: '💬', label: 'Messages', href: '#', color: accentColor },
        ].map(item => (
          <div key={item.label} style={{
            background: `${item.color}08`,
            border: `1px solid ${item.color}22`,
            borderRadius: 12, padding: '16px',
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main persistent runtime ──────────────────────────────────────────────────

interface GoLiveRuntimeProps {
  roomId: string;
  eventId?: string;
  eventType?: 'concert' | 'battle' | 'cypher' | 'challenge' | 'live-show' | 'dance-party';
  accentColor?: string;
  initialMode?: ViewMode;
}

export default function GoLiveRuntime({
  roomId,
  eventId = roomId,
  accentColor = '#00E5FF',
  initialMode = 'FULL_VENUE',
}: GoLiveRuntimeProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  const enterVenue   = useCallback(() => setViewMode('FULL_VENUE'), []);
  const enterDash    = useCallback(() => setViewMode('DASHBOARD'), []);

  const isVenueShrunk = viewMode !== 'FULL_VENUE';

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      background: '#050310',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── Top bar — always visible ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 16px',
        background: 'rgba(5,3,16,0.96)',
        borderBottom: `1px solid ${accentColor}22`,
        zIndex: 200, flexShrink: 0,
      }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 8, fontWeight: 900, color: '#FF2020', letterSpacing: '.12em',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF2020', animation: 'grtBlink 1s step-end infinite' }} />
          LIVE
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>
          Room {roomId}
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {viewMode === 'FULL_VENUE' ? (
            <button
              onClick={enterDash}
              style={{
                padding: '6px 14px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8, fontSize: 9, fontWeight: 900,
                color: 'rgba(255,255,255,0.65)', cursor: 'pointer', letterSpacing: '.06em',
              }}
            >
              📊 DASHBOARD
            </button>
          ) : (
            <button
              onClick={enterVenue}
              style={{
                padding: '6px 14px', background: `${accentColor}18`,
                border: `1px solid ${accentColor}44`,
                borderRadius: 8, fontSize: 9, fontWeight: 900,
                color: accentColor, cursor: 'pointer', letterSpacing: '.06em',
                boxShadow: `0 0 12px ${accentColor}33`,
              }}
            >
              🎭 RETURN TO VENUE
            </button>
          )}
        </div>
      </div>

      {/* ── Venue viewport — ALWAYS mounted, just opacity changes ── */}
      <div style={{
        flex: 1,
        opacity: isVenueShrunk ? 0.3 : 1,
        filter: isVenueShrunk ? 'blur(3px) scale(0.98)' : 'none',
        transition: 'opacity 0.4s ease, filter 0.4s ease',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <UniversalVenueRenderer roomId={roomId} mode="performer" venueIndex={1} />
      </div>

      {/* ── Dashboard overlay — slides over venue when active ── */}
      <AnimatePresence>
        {viewMode === 'DASHBOARD' && (
          <DashboardOverlay onReturn={enterVenue} accentColor={accentColor} />
        )}
      </AnimatePresence>

      {/* ── Canister Dock — ALWAYS visible at bottom ── */}
      <CanisterDock accentColor={accentColor} eventId={eventId} />

      <style>{`
        @keyframes grtBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}
