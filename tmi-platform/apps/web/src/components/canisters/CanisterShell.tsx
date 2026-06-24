'use client';

/**
 * CanisterShell — universal 6-state wrapper for all canisters.
 *
 * States: Closed → Peek → Expanded → Pinned → Detached → Fullscreen
 *
 * Every canister (Playlist, MemoryWall, Booking, Messaging, Store, Avatar,
 * Inventory, Lobby, Discovery, etc.) wraps its content in this shell.
 * The shell handles all transitions, state logic, and animations.
 *
 * Animation variant is read from CanisterMotionRegistry — each canister
 * type gets its own unique open/close motion to prevent monotony.
 */

import {
  useState,
  useRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type CanisterType,
  getCanisterVariants,
  getPeekVariants,
  getCanisterMotionStyle,
} from '@/lib/motion/CanisterMotionRegistry';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CanisterState =
  | 'closed'      // icon only — minimal footprint
  | 'peek'        // small preview strip (48-200px)
  | 'expanded'    // full panel view
  | 'pinned'      // locked open, doesn't close on navigation
  | 'detached'    // floating draggable window
  | 'fullscreen'; // entire viewport

interface CanisterShellProps {
  type: CanisterType;
  icon: string;
  label: string;
  accentColor?: string;
  defaultState?: CanisterState;
  peekContent?: ReactNode;       // shown in peek state
  children: ReactNode;           // shown in expanded/pinned/detached/fullscreen
  peekHeight?: number;           // px height of peek strip, default 80
  expandedWidth?: number;        // px width of expanded panel, default 360
  expandedHeight?: number;       // px height of expanded panel, default 520
  className?: string;
  onStateChange?: (state: CanisterState) => void;
  disableFullscreen?: boolean;
  disableDetach?: boolean;
}

// ─── State machine transitions ────────────────────────────────────────────────

const STATE_CYCLE: CanisterState[] = ['closed', 'peek', 'expanded', 'fullscreen'];

function nextState(current: CanisterState, disableFullscreen: boolean): CanisterState {
  if (current === 'detached') return 'expanded';
  if (current === 'pinned') return 'closed';
  if (current === 'fullscreen') return 'closed';
  const idx = STATE_CYCLE.indexOf(current);
  const next = STATE_CYCLE[idx + 1];
  if (!next || (next === 'fullscreen' && disableFullscreen)) return 'closed';
  return next;
}

// ─── Drag logic for Detached state ───────────────────────────────────────────

function useDrag(enabled: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: 80, y: 80 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enabled || !ref.current) return;
    dragging.current = true;
    offset.current = { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !ref.current) return;
      pos.current = { x: ev.clientX - offset.current.x, y: ev.clientY - offset.current.y };
      ref.current.style.left = `${pos.current.x}px`;
      ref.current.style.top = `${pos.current.y}px`;
    };
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [enabled]);

  return { ref, onMouseDown };
}

// ─── Main shell ───────────────────────────────────────────────────────────────

export default function CanisterShell({
  type,
  icon,
  label,
  accentColor = '#00E5FF',
  defaultState = 'closed',
  peekContent,
  children,
  peekHeight = 80,
  expandedWidth = 360,
  expandedHeight = 360,
  onStateChange,
  disableFullscreen = false,
  disableDetach = false,
}: CanisterShellProps) {
  const [state, setState] = useState<CanisterState>(defaultState);
  const motionStyle = getCanisterMotionStyle(type);
  const expandedVariants = getCanisterVariants(type);
  const peekVariants = getPeekVariants(type);
  const drag = useDrag(state === 'detached');

  const setAndNotify = useCallback((s: CanisterState) => {
    setState(s);
    onStateChange?.(s);
  }, [onStateChange]);

  const handleIconClick = () => setAndNotify(nextState(state, disableFullscreen));
  const handleClose = (e: React.MouseEvent) => { e.stopPropagation(); setAndNotify('closed'); };
  const handlePin = (e: React.MouseEvent) => { e.stopPropagation(); setAndNotify(state === 'pinned' ? 'expanded' : 'pinned'); };
  const handleDetach = (e: React.MouseEvent) => { e.stopPropagation(); if (!disableDetach) setAndNotify('detached'); };
  const handleFullscreen = (e: React.MouseEvent) => { e.stopPropagation(); if (!disableFullscreen) setAndNotify(state === 'fullscreen' ? 'expanded' : 'fullscreen'); };

  const isPinned = state === 'pinned';
  const isOpen = state !== 'closed';
  const isFullscreen = state === 'fullscreen';
  const isDetached = state === 'detached';

  // Shared control bar (shown in expanded/pinned/detached/fullscreen)
  function ControlBar() {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 12px',
        borderBottom: `1px solid ${accentColor}22`,
        background: `rgba(5,3,16,0.95)`,
        backdropFilter: 'blur(8px)',
        userSelect: 'none',
        cursor: isDetached ? 'grab' : 'default',
      }} onMouseDown={isDetached ? drag.onMouseDown : undefined}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: 10, fontWeight: 900, color: accentColor, letterSpacing: '.12em' }}>
          {label.toUpperCase()}
        </span>
        {isPinned && <span style={{ fontSize: 8, color: '#FFD700', fontWeight: 900, letterSpacing: '.08em' }}>📌 PINNED</span>}
        <ControlBtn title={isPinned ? 'Unpin' : 'Pin'} onClick={handlePin} active={isPinned}>📌</ControlBtn>
        {!disableDetach && <ControlBtn title="Detach" onClick={handleDetach} active={isDetached}>⧉</ControlBtn>}
        {!disableFullscreen && <ControlBtn title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={handleFullscreen} active={isFullscreen}>⛶</ControlBtn>}
        <ControlBtn title="Close" onClick={handleClose} active={false}>✕</ControlBtn>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Icon trigger (always visible) ── */}
      <button
        onClick={handleIconClick}
        title={label}
        style={{
          width: 40, height: 40, borderRadius: 10,
          background: isOpen ? `${accentColor}18` : 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${isOpen ? accentColor : 'rgba(255,255,255,0.12)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, cursor: 'pointer',
          boxShadow: isOpen ? `0 0 12px ${accentColor}44` : 'none',
          transition: 'all 0.2s',
          position: 'relative',
        }}
      >
        {icon}
        {isPinned && (
          <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 9, background: '#FFD700', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            📌
          </span>
        )}
      </button>

      {/* ── Peek state ── */}
      <AnimatePresence>
        {state === 'peek' && (
          <motion.div
            key="peek"
            variants={peekVariants}
            initial="hidden" animate="visible" exit="exit"
            style={{
              position: 'absolute', bottom: '110%', left: 0,
              width: expandedWidth,
              height: peekHeight,
              background: 'rgba(10,6,20,0.96)',
              border: `1px solid ${accentColor}44`,
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
              zIndex: 500,
            }}
          >
            {peekContent ?? (
              <div style={{
                height: '100%', display: 'flex', alignItems: 'center',
                padding: '0 14px', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 11, color: accentColor, fontWeight: 700 }}>{label}</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginLeft: 'auto' }}>Click to expand</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expanded / Pinned (overlay, anchored to trigger) ── */}
      <AnimatePresence>
        {(state === 'expanded' || state === 'pinned') && (
          <motion.div
            key="expanded"
            variants={expandedVariants}
            initial="hidden" animate="visible" exit="exit"
            style={{
              position: 'absolute', bottom: '110%', left: 0,
              width: expandedWidth,
              height: expandedHeight,
              background: 'linear-gradient(160deg,#0e0820,#0a0614)',
              border: `1.5px solid ${accentColor}44`,
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 40px ${accentColor}18`,
              zIndex: isPinned ? 600 : 501,
            }}
          >
            <ControlBar />
            <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Detached (floating window, fixed position, draggable) ── */}
      <AnimatePresence>
        {state === 'detached' && (
          <motion.div
            key="detached"
            ref={drag.ref}
            variants={expandedVariants}
            initial="hidden" animate="visible" exit="exit"
            style={{
              position: 'fixed',
              left: 80, top: 80,
              width: expandedWidth,
              height: expandedHeight,
              background: 'linear-gradient(160deg,#0e0820,#0a0614)',
              border: `1.5px solid ${accentColor}66`,
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: `0 32px 100px rgba(0,0,0,0.9), 0 0 60px ${accentColor}22`,
              zIndex: 9000,
              resize: 'both',
            }}
          >
            <ControlBar />
            <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fullscreen ── */}
      <AnimatePresence>
        {state === 'fullscreen' && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 26 } }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
            style={{
              position: 'fixed', inset: 0,
              background: '#050310',
              zIndex: 10000,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Fullscreen header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 20px',
              borderBottom: `1px solid ${accentColor}22`,
              background: 'rgba(5,3,16,0.98)',
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: accentColor, letterSpacing: '.08em' }}>
                {label.toUpperCase()}
              </span>
              <button
                onClick={handleClose}
                style={{
                  marginLeft: 'auto', padding: '6px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8, color: '#fff',
                  fontSize: 10, fontWeight: 900, cursor: 'pointer',
                  letterSpacing: '.06em',
                }}
              >
                EXIT FULLSCREEN ✕
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Small control button ─────────────────────────────────────────────────────

function ControlBtn({
  title, onClick, active, children,
}: { title: string; onClick: (e: React.MouseEvent) => void; active: boolean; children: React.ReactNode }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 22, height: 22, borderRadius: 4,
        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: active ? '#fff' : 'rgba(255,255,255,0.4)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.background = active ? 'rgba(255,255,255,0.15)' : 'transparent')}
    >
      {children}
    </button>
  );
}
