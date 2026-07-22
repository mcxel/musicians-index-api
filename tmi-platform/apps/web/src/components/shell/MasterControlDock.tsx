'use client';

import React, { useState } from 'react';
import YoPhoStudioDrawer from '../studio/YoPhoStudioDrawer';
import InventoryPanelOverlay from '../panels/InventoryPanelOverlay';
import MemoryWallPanelOverlay from '../panels/MemoryWallPanelOverlay';
import PlaylistPanelOverlay from '../panels/PlaylistPanelOverlay';

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
  // Toggle states for controls & overlay panels
  const [isMicActive, setIsMicActive] = useState(true);
  const [isCamActive, setIsCamActive] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);

  // Overlay panels
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isMemoryWallOpen, setIsMemoryWallOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const handleMicClick = () => {
    setIsMicActive(!isMicActive);
    if (onMicToggle) onMicToggle();
  };

  const handleCamClick = () => {
    setIsCamActive(!isCamActive);
    if (onCamToggle) onCamToggle();
  };

  return (
    <>
      {/* Overlays */}
      <InventoryPanelOverlay
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        onOpenAvatarStudio={() => {
          setIsInventoryOpen(false);
          setIsStudioOpen(true);
        }}
      />
      <MemoryWallPanelOverlay
        isOpen={isMemoryWallOpen}
        onClose={() => setIsMemoryWallOpen(false)}
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
          {/* Album Cover Thumbnail */}
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

          {/* Song Meta */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', fontWeight: 800 }}>
              NOW PLAYING
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap' }}>
              Hustle & Flow <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>· MarcelD</span>
            </div>
          </div>

          {/* Audio Waveform Spectrum Equalizer */}
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
          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* LEAVE ROOM */}
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

            {/* MIC TOGGLE */}
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

            {/* CAM TOGGLE */}
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

            {/* RAISE HAND */}
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

            {/* EMOTES */}
            <button
              onClick={() => setIsInventoryOpen(true)}
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
              😃 EMOTES
            </button>

            {/* ENTER STAGE */}
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

          {/* Navigation Link Row (Includes Search and Explore icons relocated) */}
          <div style={{ display: 'flex', gap: 14, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6, width: '100%', justifyContent: 'center' }}>
            {[
              // '/' (not a hardcoded hub) so middleware's real per-role
              // redirect (isMarketingRoot -> resolvePrimaryPathForRoles)
              // sends every role to their own dashboard, not always /hub/fan.
              { label: 'HOME', icon: '🏠', path: '/' },
              { label: 'EXPLORE', icon: '🧭', path: '/explore' },
              { label: 'SEARCH', icon: '🔍', path: '/search' },
              { label: 'LIVE NOW', icon: '📹', path: '/live' },
              { label: 'LOBBY', icon: '👥', path: '/lobby' },
              { label: 'MESSAGES', icon: '💬', badge: 12, path: '/messages' },
              { label: 'NOTIFICATIONS', icon: '🔔', badge: 3, path: '/notifications' },
            ].map((nav, idx) => (
              <a
                key={idx}
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
                {nav.badge && (
                  <span
                    style={{
                      background: '#FF2DAA',
                      color: '#fff',
                      fontSize: 8,
                      fontWeight: 900,
                      borderRadius: 10,
                      padding: '1px 4px',
                      marginLeft: 2,
                    }}
                  >
                    {nav.badge}
                  </span>
                )}
              </a>
            ))}
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
            48ms
          </div>
          <span style={{ fontSize: 9, fontWeight: 900, color: '#FFD700', border: '1px solid #FFD700', borderRadius: 4, padding: '1px 4px', letterSpacing: '0.05em' }}>
            4K HD
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setIsMemoryWallOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}>
              📷 SCREEN
            </button>
            <button onClick={() => setIsMemoryWallOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}>
              ⏺ REC
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
