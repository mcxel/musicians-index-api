'use client';

/**
 * UniversalPlatformShell — THE canonical layout wrapper for every page on TMI.
 *
 * Architecture principle (locked 2026-06-30):
 *   No new page, dashboard, or feature may define its own layout, navigation,
 *   window system, or shell. All work registers into this shell through named
 *   layout slots. Visual redesigns happen through ThemeProvider — this file
 *   and the named slots are the only layout contract that ever needs to change.
 *
 * Named slots:
 *   leftNav       — DrawerShell (collapsible left nav rail)
 *   topBar        — Search + currency + notifications + membership + user menu
 *   centerStage   — Changes per page: live room / battle / magazine / marketplace
 *   rightRail     — Chat / People / Friends / Nearby Rooms (swapped per page)
 *   bottomHud     — HudRegistry controls (mic/cam/emotes, or bookmark/like/share, etc.)
 *   floatingWindows — Inventory / Memory Wall / Playlist / Messages (via WindowManagerRuntime)
 *   notificationLayer — Toast / notification overlay
 *   assistantLayer — OnboardingMissionDock today; Julius when ready
 *
 * Backed by:
 *   - RoomContainer (context + DrawerProvider + RoomInfrastructureProvider)
 *   - WindowManagerRuntime (localStorage-persisted floating window positions)
 *   - DrawerProvider (active drawer state + URL listener)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomContainer from '@/components/room/RoomContainer';
import type { RoomType } from '@/components/room/RoomInfrastructureProvider';
import { WindowManagerRuntime } from '@/lib/runtime/window/WindowManagerRuntime';
import type { LayoutPreset } from '@/lib/runtime/window';
import { useTheme, type ThemeTokens } from '@/lib/design/ThemeEngine';
import LiveLobbyDrawer from '@/components/lobby/LiveLobbyDrawer';

// ── Drawer collapse state ─────────────────────────────────────────────────────

type DrawerMode = 'expanded' | 'compact' | 'hidden';

const DRAWER_EXPANDED_W = 200;
const DRAWER_COMPACT_W  = 56;

// ── Shell props ───────────────────────────────────────────────────────────────

export interface UniversalPlatformShellProps {
  // Required
  centerStage: React.ReactNode;

  // Named layout slots — all optional; omit what a page doesn't need
  leftNav?:           React.ReactNode;
  topBar?:            React.ReactNode;
  rightRail?:         React.ReactNode;
  bottomHud?:         React.ReactNode;
  /** Pass canister panels here; they render as draggable floating windows */
  floatingWindows?:   React.ReactNode;
  notificationLayer?: React.ReactNode;
  /** OnboardingMissionDock today; Julius layer tomorrow — slot never changes */
  assistantLayer?:    React.ReactNode;

  // Shell identity (passed to RoomContainer for context)
  roomId?:       string;
  title?:        string;
  accentColor?:  string;
  bpm?:          number;
  roomType?:     RoomType;
  layoutPreset?: LayoutPreset;

  // Visual
  className?: string;
  style?:     React.CSSProperties;

  /** Initial drawer mode. Default: 'expanded' on desktop, 'hidden' on mobile. */
  defaultDrawerMode?: DrawerMode;
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function UniversalPlatformShell({
  centerStage,
  leftNav,
  topBar,
  rightRail,
  bottomHud,
  floatingWindows,
  notificationLayer,
  assistantLayer,
  roomId       = 'platform',
  title        = 'TMI',
  accentColor  = '#00FFFF',
  bpm          = 120,
  roomType     = 'watch',
  className,
  style,
  defaultDrawerMode = 'expanded',
}: UniversalPlatformShellProps) {

  const [drawerMode, setDrawerMode] = useState<DrawerMode>(defaultDrawerMode);
  const theme = useTheme();

  // Page accent wins when given; fall back to live theme primary
  const activeAccent = accentColor !== '#00FFFF' ? accentColor : theme.primary;

  const cycleDrawer = useCallback(() => {
    setDrawerMode(m => m === 'expanded' ? 'compact' : m === 'compact' ? 'hidden' : 'expanded');
  }, []);

  const drawerW = drawerMode === 'expanded' ? DRAWER_EXPANDED_W : drawerMode === 'compact' ? DRAWER_COMPACT_W : 0;
  const hasTopBar    = Boolean(topBar);
  const hasDrawer    = Boolean(leftNav);
  const hasRightRail = Boolean(rightRail);
  const hasBottomHud = Boolean(bottomHud);

  // Top bar height is known at layout time; bottom HUD height is variable —
  // we use padding so the center stage isn't obscured.
  const TOP_H    = hasTopBar    ? 52 : 0;
  const BOTTOM_H = hasBottomHud ? 64 : 0;

  return (
    <ShellContext.Provider value={{ drawerMode, cycleDrawer, accentColor: activeAccent, theme }}>
    <RoomContainer
      roomId={roomId}
      title={title}
      accentColor={accentColor}
      bpm={bpm}
      roomType={roomType}
      className={className}
      style={style}
    >
      {/* ── Accent line ────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 9999,
        background: `linear-gradient(90deg, transparent, ${activeAccent}99, transparent)`,
        pointerEvents: 'none',
        transition: 'background 0.6s ease',
      }} />

      {/* ── TOP BAR ────────────────────────────────────────────────────── */}
      {hasTopBar && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: TOP_H, zIndex: 900,
          background: theme.bgGlass, borderBottom: `1px solid ${activeAccent}18`,
          backdropFilter: `blur(${theme.glassBlur ?? 16}px)`,
          transition: 'background 0.6s ease, border-color 0.6s ease',
        }}>
          {/* Drawer toggle chevron embedded in top bar */}
          {hasDrawer && (
            <button
              onClick={cycleDrawer}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeAccent, fontSize: 14, padding: 4,
                transition: 'color 0.6s ease',
              }}
              aria-label={`${drawerMode === 'hidden' ? 'Open' : 'Close'} navigation`}
            >
              {drawerMode === 'hidden' ? '☰' : drawerMode === 'expanded' ? '◀' : '▶'}
            </button>
          )}
          <div style={{ paddingLeft: hasDrawer ? 40 : 16, height: '100%' }}>
            {topBar}
          </div>
        </div>
      )}

      {/* ── MAIN BODY ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        paddingTop: TOP_H,
        paddingBottom: BOTTOM_H,
        minHeight: '100vh',
        position: 'relative',
      }}>

        {/* ── LEFT DRAWER ──────────────────────────────────────────────── */}
        {hasDrawer && (
          <motion.div
            animate={{ width: drawerW }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            style={{
              flexShrink: 0,
              overflow: 'hidden',
              background: theme.bgGlass,
              borderRight: drawerW > 0 ? `1px solid ${activeAccent}14` : 'none',
              position: 'sticky', top: TOP_H,
              height: `calc(100vh - ${TOP_H}px)`,
              zIndex: 800,
              transition: 'background 0.6s ease, border-color 0.6s ease',
              boxShadow: drawerW > 0 ? `2px 0 16px ${theme.glowColor}${Math.round(theme.glowIntensity * 20).toString(16).padStart(2,'0')}` : 'none',
            }}
          >
            <AnimatePresence>
              {drawerW > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ width: DRAWER_EXPANDED_W, height: '100%', overflowY: 'auto' }}
                  data-drawer-mode={drawerMode}
                >
                  {leftNav}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── CENTER STAGE ─────────────────────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          {centerStage}
        </main>

        {/* ── RIGHT RAIL ───────────────────────────────────────────────── */}
        {hasRightRail && (
          <aside style={{
            flexShrink: 0,
            width: 300,
            background: theme.bgGlass,
            borderLeft: `1px solid ${activeAccent}14`,
            position: 'sticky', top: TOP_H,
            height: `calc(100vh - ${TOP_H}px)`,
            overflowY: 'auto',
            zIndex: 800,
            transition: 'background 0.6s ease, border-color 0.6s ease',
          }}>
            {rightRail}
          </aside>
        )}
      </div>

      {/* ── BOTTOM HUD ─────────────────────────────────────────────────── */}
      {hasBottomHud && (
        <div style={{
          position: 'fixed', bottom: 0, left: drawerW, right: hasRightRail ? 300 : 0,
          height: BOTTOM_H, zIndex: 900,
          background: theme.bgGlass,
          borderTop: `1px solid ${activeAccent}18`,
          backdropFilter: `blur(${theme.glassBlur ?? 16}px)`,
          display: 'flex', alignItems: 'center', paddingInline: 16,
          transition: 'left 0.3s cubic-bezier(0.32,0,0.67,0), background 0.6s ease, border-color 0.6s ease',
          boxShadow: `0 -4px 24px ${theme.drawerGlow}22`,
        }}>
          {bottomHud}
        </div>
      )}

      {/* ── FLOATING WINDOWS (WindowManagerRuntime layer) ─────────────── */}
      {floatingWindows && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          pointerEvents: 'none',
        }}>
          {/* children inside must set pointerEvents:'auto' */}
          {floatingWindows}
        </div>
      )}

      {/* ── NOTIFICATION LAYER ─────────────────────────────────────────── */}
      {notificationLayer && (
        <div style={{
          position: 'fixed', top: TOP_H + 8, right: 12, zIndex: 9800,
          pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
        }}>
          {notificationLayer}
        </div>
      )}

      {/* ── ASSISTANT LAYER (onboarding cards today; Julius tomorrow) ──── */}
      {assistantLayer && (
        <div style={{ position: 'fixed', zIndex: 9000, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            {assistantLayer}
          </div>
        </div>
      )}

      {/* ── GLOBAL LIVE LOBBY DRAWER ────────────────────────────────── */}
      <LiveLobbyDrawer />
    </RoomContainer>
    </ShellContext.Provider>
  );
}

// ── Context hook so child components can read drawer/shell state ──────────────

interface ShellContextValue {
  drawerMode: DrawerMode;
  cycleDrawer: () => void;
  accentColor: string;
  layoutPreset?: LayoutPreset;
  /** Live theme tokens from ThemeEngine — update without page reload */
  theme: ThemeTokens;
}

const FALLBACK_THEME: ThemeTokens = {
  id: 'neon-royal', name: 'Neon Royal', tier: 'free',
  primary: '#AA2DFF', secondary: '#00FFFF', tertiary: '#FFD700',
  bgBase: '#030310', bgSurface: '#05050f', bgGlass: 'rgba(5,5,22,0.88)',
  glowColor: '#AA2DFF', glowIntensity: 0.7,
  particleShapes: ['orb'], particleColors: ['#AA2DFF'], particleSpeed: 1,
  particleDensity: 1, beatReactivity: 1, spawnPattern: 'rise', fadeStyle: 'fade',
  drawerGlow: '#AA2DFF', transitionStyle: 'smooth', motionSpeed: 1,
};

export const ShellContext = createContext<ShellContextValue>({
  drawerMode: 'expanded',
  cycleDrawer: () => {},
  accentColor: '#00FFFF',
  theme: FALLBACK_THEME,
});

export const useShell = () => useContext(ShellContext);
