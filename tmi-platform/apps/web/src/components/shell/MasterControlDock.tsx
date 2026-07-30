'use client';

/**
 * MasterControlDock — bottom Flight Deck control bar (Live HUD base #1).
 * Pass 8: chevron next to HOME opens FloatingWorkspacePanel (no layout reflow).
 * FAN quick Inventory overlay; PERFORMER opens Venue Concierge in floating slot.
 * Fake badge counts removed (Rule 20).
 */

import React, { useEffect, useState } from 'react';
import YoPhoStudioDrawer from '../studio/YoPhoStudioDrawer';
import InventoryPanelOverlay from '../panels/InventoryPanelOverlay';
import MemoryWallPanelOverlay from '../panels/MemoryWallPanelOverlay';
import PlaylistPanelOverlay from '../panels/PlaylistPanelOverlay';
import CameraCaptureOverlay from '../panels/CameraCaptureOverlay';
import FloatingWorkspacePanel from '@/components/workspace/FloatingWorkspacePanel';
import RoleGate from '@/components/auth/RoleGate';
import { useFloatingWorkspace } from '@/lib/workspace/floatingWorkspaceStore';
import { useLiveDiscoveryOverlay } from '@/lib/discovery/liveDiscoveryOverlayStore';
import { launchDockStore } from '@/lib/dock/launchDockStore';
import { executeInstantGoLive } from '@/lib/dock/executeInstantGoLive';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/design/ThemeEngine';

export interface MasterControlDockProps {
  role?: 'fan' | 'performer' | 'artist' | 'admin';
  onMicToggle?: () => void;
  onCamToggle?: () => void;
  onLeaveRoom?: () => void;
  onEnterStage?: () => void;
  /** Fan: open Avatar Lobby drawer. Performer: open Media Locker (not Fan Lobby). */
  onLobbyNav?: () => void;
}

export default function MasterControlDock({
  role = 'fan',
  onMicToggle,
  onCamToggle,
  onLeaveRoom,
  onEnterStage,
  onLobbyNav,
}: MasterControlDockProps) {
  const router = useRouter();
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

  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isMemoryWallOpen, setIsMemoryWallOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const { isOpen: workspaceOpen, toggle: toggleWorkspace, open: openWorkspace, setRole } =
    useFloatingWorkspace();
  const { open: openLiveLobbyWalls } = useLiveDiscoveryOverlay();

  const isPerformer = role === 'performer' || role === 'artist';

  useEffect(() => {
    if (role === 'admin') setRole('ADMIN');
    else if (isPerformer) setRole('PERFORMER');
    else setRole('FAN');
  }, [role, isPerformer, setRole]);

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

      <RoleGate allow={['FAN', 'ADMIN', 'STAFF']}>
        <InventoryPanelOverlay
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
          onOpenAvatarStudio={() => {
            setIsInventoryOpen(false);
            setIsStudioOpen(true);
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
      <PlaylistPanelOverlay
        isOpen={isPlaylistOpen}
        onClose={() => setIsPlaylistOpen(false)}
      />
      <YoPhoStudioDrawer
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        role={role === 'admin' ? 'performer' : role}
      />
      <CameraCaptureOverlay
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
      />

      {/* ─── FLIGHT DECK OS SPLIT BOTTOM BROADCAST CONTROL BAR ───────────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          right: '16px',
          zIndex: 9000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 16,
          pointerEvents: 'none',
          fontFamily: "'Inter', sans-serif",
          color: '#fff',
        }}
      >
        {/* 1. LEFT CARD: Now Playing + purple neon waves */}
        <div
          style={{
            pointerEvents: 'auto',
            background: theme.bgGlass,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.primary}44`,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px ${theme.drawerGlow}22`,
            borderRadius: '16px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 280,
          }}
        >
          <button
            type="button"
            onClick={() => setIsPlaylistOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `linear-gradient(135deg,${theme.primary},${theme.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
              boxShadow: `0 0 12px ${theme.primary}66`,
            }}
          >
            🎵
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', fontWeight: 800 }}>
              NOW PLAYING
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {isPlayingAudio ? 'Playing from playlist' : 'No track — open playlist'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <button type="button" onClick={() => setIsPlayingAudio(false)} style={transportBtn} aria-label="Previous">⏮</button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaylistOpen(true);
                  setIsPlayingAudio((p) => !p);
                }}
                style={{ ...transportBtn, color: theme.primary }}
                aria-label={isPlayingAudio ? 'Pause' : 'Play'}
              >
                {isPlayingAudio ? '⏸' : '▶'}
              </button>
              <button type="button" onClick={() => setIsPlaylistOpen(true)} style={transportBtn} aria-label="Next">⏭</button>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
                {isPlayingAudio ? 'Live EQ' : '—:— / —:—'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 22 }} aria-hidden>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const h = isPlayingAudio
                ? 4 + ((Math.sin(waveTick * 0.7 + i * 0.9) + 1) * 0.5) * 16
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

        {/* 2. CENTER CARD: Unified Command Controls & Navigation */}
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(5, 5, 20, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 255, 255, 0.1)',
            borderRadius: '18px',
            padding: '10px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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

            <button
              onClick={() => setIsHandRaised(!isHandRaised)}
              style={{
                padding: '6px 12px',
                borderRadius: 12,
                background: isHandRaised ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.05)',
                border: isHandRaised ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.18)',
                color: isHandRaised ? '#FFD700' : '#fff',
                fontSize: 9,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              ✋ HAND
            </button>

            <button
              onClick={openPrimaryQuickPanel}
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
              {isPerformer ? '🗺️ CONCIERGE' : '😃 EMOTES'}
            </button>

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

            <button
              onClick={() => {
                const dockRole = isPerformer ? 'PERFORMER' : 'FAN';
                launchDockStore.setRole(dockRole);
                if (launchDockStore.isReady()) {
                  void executeInstantGoLive({ role: dockRole }).then((r) => {
                    if (r.ok && r.href) router.push(r.href);
                    else launchDockStore.open();
                  });
                  return;
                }
                launchDockStore.open();
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
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 0 15px rgba(170,45,255,0.5)',
              }}
            >
              🔴 GO LIVE
            </button>

            <button
              onClick={onEnterStage}
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
              ⭐ STAGE
            </button>
          </div>

          <div style={{ display: 'flex', gap: 14, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            {/* HOME + chevron — opens floating workspace (no reflow) */}
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
              { label: 'DISCOVER', icon: '🧭', path: '/explore' as string | null },
              { label: 'LIVE NOW', icon: '📹', path: '/live' },
              { label: 'LOBBY', icon: '👥', path: null as string | null, lobby: true },
              { label: 'MESSAGES', icon: '💬', path: '/messages' },
              { label: 'NOTIFICATIONS', icon: '🔔', path: '/notifications' },
            ].map((nav) =>
              nav.path === null ? (
                <button
                  key={nav.label}
                  type="button"
                  onClick={() => {
                    if ('lobby' in nav && nav.lobby && onLobbyNav) onLobbyNav();
                    else openLiveLobbyWalls();
                  }}
                  aria-label={nav.label === 'LOBBY' ? (isPerformer ? 'Open Media Locker drawer' : 'Open Avatar Fan Lobby') : 'Open Live Lobby Walls'}
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
                  }}
                >
                  <span>{nav.icon}</span>
                  <span>{nav.label}</span>
                </button>
              ) : (
                <a
                  key={nav.label}
                  href={nav.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    position: 'relative',
                    padding: '2px 4px',
                  }}
                >
                  <span>{nav.icon}</span>
                  <span>{nav.label}</span>
                </a>
              ),
            )}
          </div>
        </div>

        {/* 3. RIGHT CARD: Tools + honest connection (Rule 20 — no fake ms/ping) */}
        <div
          style={{
            pointerEvents: 'auto',
            background: theme.bgGlass,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.primary}44`,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px ${theme.drawerGlow}22`,
            borderRadius: '16px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            disabled
            title="Screenshot — not wired yet"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: 9, fontWeight: 800, cursor: 'not-allowed' }}
          >
            📷 Shot
          </button>
          <button
            type="button"
            disabled
            title="Record — not wired yet"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: 9, fontWeight: 800, cursor: 'not-allowed' }}
          >
            ⏺ Rec
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.share) {
                void navigator.share({ title: 'TMI', url: window.location.href }).catch(() => undefined);
              } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                void navigator.clipboard.writeText(window.location.href);
              }
            }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}
          >
            ↗ Share
          </button>
          <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, padding: '2px 6px' }}>
            AUTO
          </span>
          <div style={{ fontSize: 9, fontWeight: 900, color: online ? '#00FF88' : '#FF6666', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: online ? '#00FF88' : '#FF6666', boxShadow: online ? '0 0 8px #00FF88' : 'none' }} />
            {online ? 'ONLINE' : 'OFFLINE'}
          </div>
          <button
            type="button"
            onClick={() => setIsMemoryWallOpen(true)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}
          >
            🧠
          </button>
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
