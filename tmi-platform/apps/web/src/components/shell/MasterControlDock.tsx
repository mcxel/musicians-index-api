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

export interface MasterControlDockProps {
  role?: 'fan' | 'performer' | 'artist' | 'admin';
  onMicToggle?: () => void;
  onCamToggle?: () => void;
  onLeaveRoom?: () => void;
  onEnterStage?: () => void;
}

export default function MasterControlDock({
  role = 'fan',
  onMicToggle,
  onCamToggle,
  onLeaveRoom,
  onEnterStage,
}: MasterControlDockProps) {
  const router = useRouter();
  const [isMicActive, setIsMicActive] = useState(true);
  const [isCamActive, setIsCamActive] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);

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
        {/* 1. LEFT CARD: Audio Player Equalizer */}
        <div
          onClick={() => setIsPlaylistOpen(true)}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(5, 5, 20, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 45, 170, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 45, 170, 0.1)',
            borderRadius: '16px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 260,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg,#FF2DAA,#AA2DFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              boxShadow: '0 0 12px rgba(255,45,170,0.4)',
            }}
          >
            🎵
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', fontWeight: 800 }}>
              NOW PLAYING
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap' }}>
              Open playlists <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>· Music module</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 16, marginLeft: 'auto' }}>
            {[12, 18, 8, 16, 20, 10].map((h, i) => (
              <span
                key={i}
                style={{
                  width: 2,
                  height: isPlayingAudio ? `${h}px` : '4px',
                  background: '#00FF88',
                  borderRadius: 1,
                  transition: 'height 0.2s ease',
                }}
              />
            ))}
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
              { label: 'EXPLORE', icon: '🧭', path: '/explore' as string | null },
              { label: 'SEARCH', icon: '🔍', path: '/search' },
              { label: 'LIVE NOW', icon: '📹', path: '/live' },
              { label: 'LOBBY', icon: '👥', path: null },
              { label: 'MESSAGES', icon: '💬', path: '/messages' },
              { label: 'NOTIFICATIONS', icon: '🔔', path: '/notifications' },
            ].map((nav) =>
              nav.path === null ? (
                <button
                  key={nav.label}
                  type="button"
                  onClick={() => openLiveLobbyWalls()}
                  aria-label="Open Live Lobby Walls"
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

        {/* 3. RIGHT CARD: System Connection & Quality */}
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(5, 5, 20, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 45, 170, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(255, 45, 170, 0.1)',
            borderRadius: '16px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 900, color: '#00FF88', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 8px #00FF88' }} />
            LINK
          </div>
          <span style={{ fontSize: 9, fontWeight: 900, color: '#FFD700', border: '1px solid #FFD700', borderRadius: 4, padding: '1px 4px', letterSpacing: '0.05em' }}>
            HD
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setIsMemoryWallOpen(true)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}
            >
              📷 MEMORIES
            </button>
            <button
              type="button"
              onClick={() => openWorkspace('quick_memories')}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}
            >
              ▲ WORKSPACE
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
