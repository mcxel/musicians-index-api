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

import { useState, useCallback, type ComponentType } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import EventOwnerCanister from './EventOwnerCanister';
import VenueToolsShellHint from '@/components/hud/VenueToolsShellHint';

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
  'lighting':    { label: 'VENUE TOOLS', icon: '🎛', color: '#FFD700' },
  'effects':     { label: 'Effects',   icon: '✨', color: '#FF2DAA' },
  'banner':      { label: 'Banners',   icon: '📢', color: '#00E5FF' },
  'camera':      { label: 'Camera',    icon: '📹', color: '#AA2DFF' },
  'support':     { label: 'Support',   icon: '💰', color: '#00FF88' },
  'stage':       { label: 'Stage',     icon: '🎪', color: '#FF6B35' },
  'director':    { label: 'Director',  icon: '🎬', color: '#FFD700' },
  'sponsors':    { label: 'Sponsors',  icon: '🤝', color: '#fff' },
  'event-owner': { label: 'Owner',     icon: '⚙️', color: '#AA2DFF' },
  /** @deprecated Use lighting (VENUE TOOLS) — do not mount both on one surface */
  'curtain':     { label: 'VENUE TOOLS', icon: '🎛', color: '#FFD700' },
};

// ─── Individual canisters ───────────────────────────────────────────────────
// Mutation stubs (effects/banner/camera/…) retired — open VENUE TOOLS instead.
// Do not remount dead no-op buttons on production surfaces (Rule 14 / orphan law).

function EffectsCanister({ roomId }: { roomId?: string }) {
  return (
    <div style={{ padding: 12 }}>
      <VenueToolsShellHint accent="#FF2DAA" roomId={roomId} compact />
    </div>
  );
}

function BannerCanister({ roomId }: { roomId?: string }) {
  return (
    <div style={{ padding: 12 }}>
      <VenueToolsShellHint accent="#00E5FF" roomId={roomId} compact />
    </div>
  );
}

function CameraCanister({ roomId }: { roomId?: string }) {
  return (
    <div style={{ padding: 12 }}>
      <VenueToolsShellHint accent="#AA2DFF" roomId={roomId} compact />
    </div>
  );
}

function SupportCanister({ roomId }: { roomId?: string }) {
  return (
    <div style={{ padding: 12 }}>
      <VenueToolsShellHint accent="#00FF88" roomId={roomId} compact />
    </div>
  );
}

function DirectorCanister({ roomId }: { roomId?: string }) {
  return (
    <div style={{ padding: 12 }}>
      <VenueToolsShellHint accent="#FFD700" roomId={roomId} compact />
    </div>
  );
}

const CANISTER_COMPONENTS: Record<
  Exclude<CanisterType, "event-owner" | "curtain" | "lighting">,
  ComponentType<{ roomId?: string }>
> = {
  effects: EffectsCanister,
  banner: BannerCanister,
  camera: CameraCanister,
  support: SupportCanister,
  stage: DirectorCanister,
  director: DirectorCanister,
  sponsors: ({ roomId }) => (
    <div style={{ padding: 12 }}>
      <VenueToolsShellHint accent="#fff" roomId={roomId} compact />
    </div>
  ),
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
          ) : type === 'curtain' || type === 'lighting' ? (
            <div style={{ padding: 12 }}>
              <VenueToolsShellHint accent="#FFD700" roomId={eventId} compact />
            </div>
          ) : (
            (() => {
              const Component = CANISTER_COMPONENTS[type as keyof typeof CANISTER_COMPONENTS];
              return Component ? <Component roomId={eventId} /> : null;
            })()
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
  // ONE VENUE TOOLS entry per surface — lighting owns the hint; drop duplicate curtain
  const uniqueCanisters = availableCanisters.filter((type, i, arr) => {
    if (type === "curtain" && arr.includes("lighting")) return false;
    return arr.indexOf(type) === i;
  });

  const [canisters, setCanisters] = useState<CanisterState[]>(
    uniqueCanisters.map((type, i) => ({
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
