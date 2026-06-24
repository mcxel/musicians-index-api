'use client';

/**
 * ControlCanisterCluster — unified control system for live events.
 *
 * NOT a page. NOT a modal. A cluster of draggable, dockable, collapsible canisters
 * that sit atop the live venue runtime. Show never stops. Audio continues. Audience persists.
 *
 * Available canisters (depending on event mode):
 * - LightingCanister
 * - EffectsCanister
 * - BannerCanister
 * - CameraCanister
 * - SupportCanister
 * - StageCanister
 * - DirectorCanister (battles only)
 */

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import EventOwnerCanister from './EventOwnerCanister';
import CurtainCanister from './CurtainCanister';

export type CanisterType =
  | 'lighting'
  | 'effects'
  | 'banner'
  | 'camera'
  | 'support'
  | 'stage'
  | 'director'
  | 'sponsors'
  | 'event-owner'
  | 'curtain';

export type CanisterPosition = 'left' | 'right' | 'bottom' | 'floating';

export interface CanisterState {
  id: string;
  type: CanisterType;
  isOpen: boolean;
  isMinimized: boolean;
  position: CanisterPosition;
  x?: number; // for floating
  y?: number;
}

interface Props {
  eventId?: string;
  eventMode: 'casual' | 'release-party' | 'concert' | 'battle' | 'cypher';
  availableCanisters: CanisterType[];
  onClose?: () => void;
  className?: string;
}

// ─── Canister registry ────────────────────────────────────────────────────────

const CANISTER_INFO: Record<CanisterType, { label: string; icon: string; color: string }> = {
  'lighting':    { label: 'Lighting',  icon: '💡', color: '#FFD700' },
  'effects':     { label: 'Effects',   icon: '✨', color: '#FF2DAA' },
  'banner':      { label: 'Banners',   icon: '📢', color: '#00E5FF' },
  'camera':      { label: 'Camera',    icon: '📹', color: '#AA2DFF' },
  'support':     { label: 'Support',   icon: '💰', color: '#00FF88' },
  'stage':       { label: 'Stage',     icon: '🎪', color: '#FF6B35' },
  'director':    { label: 'Director',  icon: '🎬', color: '#FFD700' },
  'sponsors':    { label: 'Sponsors',  icon: '🤝', color: '#fff' },
  'event-owner': { label: 'Owner',     icon: '⚙️', color: '#AA2DFF' },
  'curtain':     { label: 'Curtain',   icon: '🎭', color: '#FFD700' },
};

// ─── Individual canisters (placeholder — real content imported separately) ────

function LightingCanister() {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: '#FFD700', letterSpacing: '.15em', marginBottom: 10 }}>
        LIGHTING CONSOLE
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Purple Wash', 'Blue Arena', 'Concert Red', 'Spotlight', 'Audience Glow'].map(name => (
          <button key={name} style={{
            padding: '8px 12px', borderRadius: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.3)',
            color: '#FFD700', fontSize: 10, fontWeight: 700, cursor: 'pointer',
          }}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function EffectsCanister() {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: '#FF2DAA', letterSpacing: '.15em', marginBottom: 10 }}>
        EFFECTS CONSOLE
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Fog', 'Lasers', 'Confetti', 'Fire Jets', 'Sparks'].map(name => (
          <button key={name} style={{
            padding: '8px 12px', borderRadius: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,45,170,0.3)',
            color: '#FF2DAA', fontSize: 10, fontWeight: 700, cursor: 'pointer',
          }}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function BannerCanister() {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: '#00E5FF', letterSpacing: '.15em', marginBottom: 10 }}>
        STAGE BANNERS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Tip the Artist', 'New Album Out', 'Thank You', 'Follow @', 'Book Me'].map(name => (
          <button key={name} style={{
            padding: '8px 12px', borderRadius: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,229,255,0.3)',
            color: '#00E5FF', fontSize: 10, fontWeight: 700, cursor: 'pointer',
          }}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function CameraCanister() {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: '#AA2DFF', letterSpacing: '.15em', marginBottom: 10 }}>
        CAMERA DIRECTOR
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Auto', 'Wide', 'Crowd', 'Stage', 'Performer', 'Rotate'].map(name => (
          <button key={name} style={{
            padding: '8px 12px', borderRadius: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(170,45,255,0.3)',
            color: '#AA2DFF', fontSize: 10, fontWeight: 700, cursor: 'pointer',
          }}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function SupportCanister() {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: '#00FF88', letterSpacing: '.15em', marginBottom: 10 }}>
        SUPPORT BANNERS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Join Fan Club', 'Buy Merch', 'Tip Jar', 'Book Me', 'VIP Access'].map(name => (
          <button key={name} style={{
            padding: '8px 12px', borderRadius: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,136,0.3)',
            color: '#00FF88', fontSize: 10, fontWeight: 700, cursor: 'pointer',
          }}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function DirectorCanister() {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: '#FFD700', letterSpacing: '.15em', marginBottom: 10 }}>
        BROADCAST DIRECTOR
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Split Screen', 'Voltron', 'Audience', 'Host Focus', 'Rotation Speed', 'Energy FX'].map(name => (
          <button key={name} style={{
            padding: '8px 12px', borderRadius: 6,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.3)',
            color: '#FFD700', fontSize: 10, fontWeight: 700, cursor: 'pointer',
          }}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

const CANISTER_COMPONENTS: Record<CanisterType, React.ComponentType> = {
  'lighting':    LightingCanister,
  'effects':     EffectsCanister,
  'banner':      BannerCanister,
  'camera':      CameraCanister,
  'support':     SupportCanister,
  'stage':       DirectorCanister,
  'director':    DirectorCanister,
  'sponsors':    () => <div style={{ padding: 12 }}>Sponsor controls</div>,
  'event-owner': () => null,
  'curtain':     () => null,
};

// ─── Canister component ──────────────────────────────────────────────────────

function Canister({
  type,
  isOpen,
  isMinimized,
  onToggle,
  onMinimize,
  eventId,
}: {
  type: CanisterType;
  isOpen: boolean;
  isMinimized: boolean;
  onToggle: () => void;
  onMinimize: () => void;
  eventId?: string;
}) {
  const info = CANISTER_INFO[type];
  const Component = CANISTER_COMPONENTS[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        background: 'linear-gradient(160deg,#0e0820,#0a0614)',
        border: `1px solid ${info.color}44`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 12px 60px rgba(0,0,0,0.8)',
        minWidth: 220,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: `1px solid ${info.color}22`,
        background: `${info.color}08`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{info.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 900, color: info.color, letterSpacing: '.1em' }}>
            {info.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onMinimize} style={{
            width: 20, height: 20, borderRadius: 4,
            background: 'transparent', border: `1px solid ${info.color}33`,
            color: info.color, fontSize: 10, cursor: 'pointer',
          }}>
            {isMinimized ? '▢' : '−'}
          </button>
          <button onClick={onToggle} style={{
            width: 20, height: 20, borderRadius: 4,
            background: 'transparent', border: `1px solid ${info.color}33`,
            color: info.color, fontSize: 10, cursor: 'pointer',
          }}>
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {type === 'event-owner' && eventId ? (
            <EventOwnerCanister eventId={eventId} />
          ) : type === 'curtain' ? (
            <CurtainCanister />
          ) : (
            <Component />
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main cluster ────────────────────────────────────────────────────────────

export default function ControlCanisterCluster({
  eventId,
  eventMode,
  availableCanisters,
  className,
}: Props) {
  const [canisters, setCanisters] = useState<CanisterState[]>(
    availableCanisters.map((type, i) => ({
      id: `${type}-${i}`,
      type,
      isOpen: false,
      isMinimized: false,
      position: i % 2 === 0 ? 'left' : 'right',
    }))
  );

  const toggleCanister = useCallback((id: string) => {
    setCanisters(prev =>
      prev.map(c =>
        c.id === id ? { ...c, isOpen: !c.isOpen, isMinimized: false } : c
      )
    );
  }, []);

  const minimizeCanister = useCallback((id: string) => {
    setCanisters(prev =>
      prev.map(c =>
        c.id === id ? { ...c, isMinimized: !c.isMinimized } : c
      )
    );
  }, []);

  const openCanisterIds = canisters.filter(c => c.isOpen).map(c => c.id);

  return (
    <div className={className} style={{
      position: 'fixed', bottom: 20, left: 20, right: 20, zIndex: 40,
      display: 'flex', gap: 12, flexWrap: 'wrap', maxWidth: '100%',
      pointerEvents: 'auto',
    }}>
      {/* Collapsed buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {canisters
          .filter(c => !c.isOpen)
          .map(c => (
            <button
              key={c.id}
              onClick={() => toggleCanister(c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 14px', borderRadius: 10,
                background: `${CANISTER_INFO[c.type].color}14`,
                border: `1px solid ${CANISTER_INFO[c.type].color}44`,
                color: CANISTER_INFO[c.type].color,
                fontSize: 10, fontWeight: 900, cursor: 'pointer',
                letterSpacing: '.06em',
              }}
            >
              {CANISTER_INFO[c.type].icon} {CANISTER_INFO[c.type].label}
            </button>
          ))}
      </div>

      {/* Open canisters */}
      <AnimatePresence>
        {canisters
          .filter(c => c.isOpen)
          .map(c => (
            <Canister
              key={c.id}
              type={c.type}
              isOpen={c.isOpen}
              isMinimized={c.isMinimized}
              onToggle={() => toggleCanister(c.id)}
              onMinimize={() => minimizeCanister(c.id)}
              eventId={eventId}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}
