'use client';

/**
 * MasterControlDock — bottom Flight Deck control bar (Live HUD base #1).
 * Pass 8: chevron next to HOME opens FloatingWorkspacePanel (no layout reflow).
 * Phase 1 Universal Workspace: audio chevron → playlist-studio; Share → share-studio
 * via Living OS Command Bus (not PlaylistPanelOverlay / one-off drawers).
 * FAN quick Inventory overlay; PERFORMER opens Venue Concierge in floating slot.
 * Fake badge counts removed (Rule 20).
 */

import React, { useEffect, useState } from 'react';
import InventoryPanelOverlay from '../panels/InventoryPanelOverlay';
import MemoryWallPanelOverlay from '../panels/MemoryWallPanelOverlay';
import CameraCaptureOverlay from '../panels/CameraCaptureOverlay';
import FloatingWorkspacePanel from '@/components/workspace/FloatingWorkspacePanel';
import UniversalWorkspaceHost from '@/components/workspace/universal/UniversalWorkspaceHost';
import RoleGate from '@/components/auth/RoleGate';
import { useFloatingWorkspace } from '@/lib/workspace/floatingWorkspaceStore';
import { launchDockStore } from '@/lib/dock/launchDockStore';
import { triggerCanonicalGoLive } from '@/lib/dock/presentInstantGoLiveInPlace';
import { livingOsCommandBus } from '@/lib/os/livingOsCommandBus';
import type { PlatformRole } from '@/lib/os/universalPermissionRegistry';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/lib/design/ThemeEngine';
import { openCanonicalWorkspaceQuick, presentCanonicalWorkspace } from '@/lib/workspace/universal/openCanonicalPresentation';
import { useCompactQuickPanelStore } from '@/lib/hud/compactQuickPanelStore';

export type DockModuleId = 'lobby' | 'yopho' | 'playlist' | 'memory';

export interface MasterControlDockProps {
  role?: 'fan' | 'performer' | 'artist' | 'admin';
  onMicToggle?: () => void;
  onCamToggle?: () => void;
  onLeaveRoom?: () => void;
  onEnterStage?: () => void;
  /** Fan: open Avatar Lobby drawer. Performer: open Media Locker (not Fan Lobby). */
  onLobbyNav?: () => void;
  /**
   * When set (Command Center shell), playlist / memory / lobby open the
   * under-monitor drawer instead of floating overlays (Marcel P0 UX).
   */
  onOpenModule?: (module: DockModuleId) => void;
}

export default function MasterControlDock({
  role = 'fan',
  onMicToggle,
  onCamToggle,
  onLeaveRoom,
  onEnterStage,
  onLobbyNav,
  onOpenModule,
}: MasterControlDockProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const theme = useTheme();
  const [isMicActive, setIsMicActive] = useState(true);
  const [isCamActive, setIsCamActive] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  // Starts false - no real track is playing until the Playlist panel actually starts one (Rule 20).
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [waveTick, setWaveTick] = useState(0);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    if (!isPlayingAudio) return;
    const id = window.setInterval(() => setWaveTick((t) => t + 1), 120);
    return () => window.clearInterval(id);
  }, [isPlayingAudio]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isMemoryWallOpen, setIsMemoryWallOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [goLivePhase, setGoLivePhase] = useState<'idle' | 'launching' | 'error'>('idle');
  const [goLiveError, setGoLiveError] = useState('');

  const { isOpen: workspaceOpen, toggle: toggleWorkspace, open: openWorkspace, setRole } =
    useFloatingWorkspace();
  const togglePanel = useCompactQuickPanelStore((s) => s.togglePanel);

  const isPerformer = role === 'performer' || role === 'artist';

  useEffect(() => {
    if (role === 'admin') setRole('ADMIN');
    else if (isPerformer) setRole('PERFORMER');
    else setRole('FAN');
  }, [role, isPerformer, setRole]);

  const commandRole = (): PlatformRole => {
    if (role === 'admin') return 'admin';
    if (isPerformer) return 'performer';
    return 'fan';
  };

  /** Flight Deck → Universal Workspace playlist-studio (Command Bus). */
  const openPlaylistStudio = () => {
    livingOsCommandBus.executeAction('ACTION_OPEN_PLAYLIST_STUDIO', {
      role: commandRole(),
      payload: {
        workspaceId: 'playlist-studio',
        trackTitle: isPlayingAudio ? 'Playing from playlist' : undefined,
      },
    });
  };

  /** Flight Deck Share → Universal Workspace share-studio inside bottom drawer. */
  const openShareStudio = () => {
    presentCanonicalWorkspace('share-studio', 'DRAWER');
  };

  const handleMicClick = () => {
    setIsMicActive(!isMicActive);
    if (onMicToggle) onMicToggle();
  };

  const handleCamClick = () => {
    setIsCamActive(!isCamActive);
    if (onCamToggle) onCamToggle();
  };

  const openPrimaryQuickPanel = () => {
    if (isPerformer) {
      openWorkspace('venue_concierge');
      return;
    }
    setIsInventoryOpen(true);
  };

  return (
    <>
      <FloatingWorkspacePanel />
      {/* Canonical Universal Workspace Window host (playlist-studio / share-studio). */}
      <UniversalWorkspaceHost />

      <RoleGate allow={['FAN', 'ADMIN', 'STAFF']}>
        <InventoryPanelOverlay
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
          onOpenAvatarStudio={() => {
            setIsInventoryOpen(false);
            router.push('/avatar/studio');
          }}
          onViewAll={() => {
            setIsInventoryOpen(false);
            openWorkspace('avatar_inventory');
          }}
        />
      </RoleGate>

      <MemoryWallPanelOverlay
        isOpen={isMemoryWallOpen}
        onClose={() => setIsMemoryWallOpen(false)}
        onViewAll={() => {
          setIsMemoryWallOpen(false);
          openWorkspace('memory_wall');
        }}
      />
      <CameraCaptureOverlay
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
      />

      {/* ─── FLIGHT DECK OS BOTTOM CONTROL STACK — two seamless bars, no gapped cards ── */}
      {/* Row A: session / room controls */}
      <div
        style={{
          position: 'fixed',
          bottom: '104px',
          left: '16px',
          right: '16px',
          zIndex: 9000,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          fontFamily: "'Inter', sans-serif",
          color: '#fff',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(5, 5, 20, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 255, 255, 0.1)',
            borderRadius: '18px',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            onClick={onLeaveRoom}
            style={{
              padding: '6px 12px',
              borderRadius: 12,
              background: 'rgba(230, 48, 0, 0.15)',
              border: '1px solid #E63000',
              color: '#FF4D4D',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            🚪 LEAVE
          </button>

          <button
            onClick={handleMicClick}
            style={{
              padding: '6px 12px',
              borderRadius: 12,
              background: isMicActive ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255,255,255,0.05)',
              border: isMicActive ? '1px solid #00FF88' : '1px solid rgba(255,255,255,0.18)',
              color: isMicActive ? '#00FF88' : '#fff',
              fontSize: 9,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            🎙️ {isMicActive ? 'MIC ON' : 'MIC OFF'}
          </button>

          <button
            onClick={handleCamClick}
            style={{
              padding: '6px 12px',
              borderRadius: 12,
              background: isCamActive ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255,255,255,0.05)',
              border: isCamActive ? '1px solid #00FF88' : '1px solid rgba(255,255,255,0.18)',
              color: isCamActive ? '#00FF88' : '#fff',
              fontSize: 9,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            📹 {isCamActive ? 'CAM ON' : 'CAM OFF'}
          </button>

          {!isMobile && (
            <>
              <button
                onClick={() => setIsCameraOpen(true)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                📷 CAMERA
              </button>
            </>
          )}

          {isMobile && (
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              style={{
                padding: '6px 12px',
                borderRadius: 12,
                background: moreOpen ? 'rgba(0, 255, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                border: moreOpen ? '1px solid #00FFFF' : '1px solid rgba(255,255,255,0.18)',
                color: moreOpen ? '#00FFFF' : '#fff',
                fontSize: 9,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {moreOpen ? '✕ CLOSE' : '⋯ MORE'}
            </button>
          )}

          <button
            disabled={goLivePhase === 'launching'}
            onClick={() => {
              if (goLivePhase === 'launching') return;
              const dockRole = isPerformer ? 'PERFORMER' : 'FAN';
              launchDockStore.setRole(dockRole);
              setGoLivePhase('launching');
              setGoLiveError('');
              // Instant Go Live — calls executeInstantGoLive() directly, same
              // as QuickLiveButton/InstantGoLiveLauncher. Previously gated on
              // launchDockStore.isReady() and fell back to
              // launchDockStore.open(), but LaunchDock never mounts on
              // /admin, /hub, or /dashboard routes — that fallback silently
              // flipped a store flag nothing on screen could render.
              void triggerCanonicalGoLive({
                role: dockRole,
                preferredExperience: 'live',
                publishSession: true,
              }).then((r) => {
                if (r.ok) {
                  setGoLivePhase('idle');
                  return;
                }
                setGoLivePhase('error');
                setGoLiveError(r.error ?? 'Failed to start broadcast.');
              });
            }}
            style={{
              padding: '6px 16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg,#AA2DFF,#FF2DAA)',
              border: '1px solid #FF2DAA',
              color: '#fff',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.08em',
              cursor: goLivePhase === 'launching' ? 'default' : 'pointer',
              opacity: goLivePhase === 'launching' ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 0 15px rgba(170,45,255,0.5)',
            }}
          >
            {goLivePhase === 'launching' ? '● GOING LIVE…' : '🔴 GO LIVE'}
          </button>
          {goLivePhase === 'error' && goLiveError && (
            <span style={{ fontSize: 9, color: '#FF4444', fontWeight: 700 }}>{goLiveError}</span>
          )}

          <button
            onClick={() => onLobbyNav?.() ?? togglePanel("lobbies", "bottom-left")}
            style={{
              padding: '6px 16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg,#AA2DFF,#FF2DAA)',
              border: '1px solid #FF2DAA',
              color: '#fff',
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 0 15px rgba(170,45,255,0.5)',
            }}
          >
            🏠 LOBBIES
          </button>
        </div>
      </div>

      {/* MORE tray — mobile secondary controls, floats above Row A */}
      {isMobile && moreOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '160px',
            left: '16px',
            right: '16px',
            zIndex: 9001,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div
            style={{
              pointerEvents: 'auto',
              background: 'rgba(5, 5, 20, 0.96)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9)',
              borderRadius: '16px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => { setIsCameraOpen(true); setMoreOpen(false); }}
              style={{
                padding: '6px 12px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#fff',
                fontSize: 9,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              📷 CAMERA
            </button>
          </div>
        </div>
      )}

      {/* Row B: one continuous Now Playing + Nav + Tools bar (no gaps between sections) */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          right: '16px',
          zIndex: 9000,
          display: isMobile ? 'none' : 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          fontFamily: "'Inter', sans-serif",
          color: '#fff',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(5, 5, 20, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 255, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: 1400,
          }}
        >
          {/* Now Playing segment */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingRight: 16,
              marginRight: 16,
              borderRight: '1px solid rgba(255,255,255,0.12)',
              minWidth: 240,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={openPlaylistStudio}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg,${theme.primary},${theme.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 0 12px ${theme.primary}66`,
                flexShrink: 0,
              }}
              aria-label="Open Playlist Studio"
            >
              🎵
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isPlayingAudio ? 'Playing from playlist' : 'No track — open playlist'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <button type="button" onClick={() => setIsPlayingAudio(false)} style={transportBtn} aria-label="Previous">⏮</button>
                <button
                  type="button"
                  onClick={() => {
                    openPlaylistStudio();
                    setIsPlayingAudio((p) => !p);
                  }}
                  style={{ ...transportBtn, color: theme.primary }}
                  aria-label={isPlayingAudio ? 'Pause' : 'Play'}
                >
                  {isPlayingAudio ? '⏸' : '▶'}
                </button>
                <button type="button" onClick={openPlaylistStudio} style={transportBtn} aria-label="Next">⏭</button>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
                  {isPlayingAudio ? 'Live EQ' : '—:— / —:—'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 18 }} aria-hidden>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const h = isPlayingAudio
                  ? 4 + ((Math.sin(waveTick * 0.7 + i * 0.9) + 1) * 0.5) * 13
                  : 3;
                return (
                  <span
                    key={i}
                    style={{
                      width: 3,
                      height: h,
                      background: `linear-gradient(180deg, ${theme.primary}, #AA2DFF)`,
                      borderRadius: 1,
                      boxShadow: isPlayingAudio ? `0 0 6px ${theme.primary}` : 'none',
                      transition: 'height 0.1s ease',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Nav segment */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              flex: 1,
              minWidth: 0,
              paddingRight: 16,
              marginRight: 16,
              borderRight: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              <a
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  padding: '2px 4px',
                }}
              >
                <span>🏠</span>
                <span>HOME</span>
              </a>
              <button
                type="button"
                aria-label={workspaceOpen ? 'Close floating workspace' : 'Open floating workspace'}
                aria-expanded={workspaceOpen}
                onClick={() => toggleWorkspace()}
                style={{
                  border: workspaceOpen ? '1px solid rgba(170,45,255,0.65)' : '1px solid rgba(255,255,255,0.18)',
                  background: workspaceOpen
                    ? 'linear-gradient(135deg, rgba(255,45,170,0.35), rgba(170,45,255,0.3))'
                    : 'rgba(255,255,255,0.05)',
                  color: '#d6b5ff',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: 'pointer',
                  padding: '2px 7px',
                  lineHeight: 1,
                }}
              >
                {workspaceOpen ? '▼' : '▲'}
              </button>
            </div>

            {[
              { label: 'DISCOVER', icon: '🧭', moduleId: 'lobby' as const },
              { label: 'LIVE NOW', icon: '📹', moduleId: 'lobby' as const },
              { label: 'LOBBY', icon: '👥', moduleId: 'lobby' as const },
              { label: 'MESSAGES', icon: '💬', moduleId: 'messaging' as const },
              { label: 'NOTIFICATIONS', icon: '🔔', moduleId: 'notifications' as const },
            ].map((nav) => (
              <button
                key={nav.label}
                type="button"
                onClick={() => openCanonicalWorkspaceQuick(nav.moduleId, 'DRAWER')}
                aria-label={`Open ${nav.label} workspace drawer`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: 'rgba(255,255,255,0.8)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '2px 4px',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{nav.icon}</span>
                <span>{nav.label}</span>
              </button>
            ))}
          </div>

          {/* Tools + honest connection segment (Rule 20 — no fake ms/ping) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <button
              type="button"
              disabled
              title="Screenshot — not wired yet"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: 9, fontWeight: 800, cursor: 'not-allowed', whiteSpace: 'nowrap' }}
            >
              📷 Shot
            </button>
            <button
              type="button"
              disabled
              title="Record — not wired yet"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: 9, fontWeight: 800, cursor: 'not-allowed', whiteSpace: 'nowrap' }}
            >
              ⏺ Rec
            </button>
            <button
              type="button"
              onClick={openShareStudio}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
              aria-label="Open Share Studio"
            >
              ↗ Share
            </button>
            <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>
              AUTO
            </span>
            <div style={{ fontSize: 9, fontWeight: 900, color: online ? '#00FF88' : '#FF6666', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: online ? '#00FF88' : '#FF6666', boxShadow: online ? '0 0 8px #00FF88' : 'none' }} />
              {online ? 'ONLINE' : 'OFFLINE'}
            </div>
            <button
              type="button"
              onClick={() => {
                if (onOpenModule) onOpenModule('memory');
                else setIsMemoryWallOpen(true);
              }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}
              aria-label="Open Memory Wall"
            >
              🧠
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const transportBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'rgba(255,255,255,0.7)',
  fontSize: 11,
  cursor: 'pointer',
  padding: 0,
  lineHeight: 1,
};
