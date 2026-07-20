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

      {/* ─── FLIGHT DECK OS BOTTOM BROADCAST CONTROL BAR ───────────────────── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9000,
          background: 'rgba(5, 5, 18, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 45, 170, 0.3)',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 45, 170, 0.15)',
          padding: '8px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontFamily: "'Inter', sans-serif",
          color: '#fff',
        }}
      >
        {/* ROW 1: Audio Player | Center Action Buttons | Live Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {/* Left Audio Player */}
          <div
            onClick={() => setIsPlaylistOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 24,
              padding: '4px 12px 4px 6px',
              cursor: 'pointer',
              minWidth: 240,
            }}
          >
            {/* Album Cover Thumbnail */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'linear-gradient(135deg,#FF2DAA,#AA2DFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                boxShadow: '0 0 10px rgba(255,45,170,0.5)',
              }}
            >
              🎵
            </div>

            {/* Song Meta */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', fontWeight: 800 }}>
                NOW PLAYING
              </div>
              <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap' }}>
                Hustle & Flow <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>· MarcelD</span>
              </div>
            </div>

            {/* Audio Waveform Spectrum Equalizer */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14, marginLeft: 'auto' }}>
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

            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginLeft: 6 }}>
              2:34 / 4:18
            </div>
          </div>

          {/* Center Interactive Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* LEAVE ROOM */}
            <button
              onClick={onLeaveRoom}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                background: 'rgba(230, 48, 0, 0.2)',
                border: '1px solid #E63000',
                color: '#FF4D4D',
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 0 12px rgba(230,48,0,0.4)',
              }}
            >
              <span>🚪</span> LEAVE ROOM
            </button>

            {/* MIC ON / OFF */}
            <button
              onClick={handleMicClick}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                background: isMicActive ? 'rgba(0, 255, 136, 0.18)' : 'rgba(255,255,255,0.06)',
                border: isMicActive ? '1px solid #00FF88' : '1px solid rgba(255,255,255,0.2)',
                color: isMicActive ? '#00FF88' : '#fff',
                fontSize: 10,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: isMicActive ? '0 0 15px rgba(0,255,136,0.4)' : 'none',
              }}
            >
              <span>🎙️</span> {isMicActive ? 'MIC ON' : 'MIC OFF'}
            </button>

            {/* CAM ON / OFF */}
            <button
              onClick={handleCamClick}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                background: isCamActive ? 'rgba(0, 255, 136, 0.18)' : 'rgba(255,255,255,0.06)',
                border: isCamActive ? '1px solid #00FF88' : '1px solid rgba(255,255,255,0.2)',
                color: isCamActive ? '#00FF88' : '#fff',
                fontSize: 10,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: isCamActive ? '0 0 15px rgba(0,255,136,0.4)' : 'none',
              }}
            >
              <span>📹</span> {isCamActive ? 'CAM ON' : 'CAM OFF'}
            </button>

            {/* RAISE HAND */}
            <button
              onClick={() => setIsHandRaised(!isHandRaised)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                background: isHandRaised ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.06)',
                border: isHandRaised ? '1px solid #FFD700' : '1px solid rgba(255,255,255,0.2)',
                color: isHandRaised ? '#FFD700' : '#fff',
                fontSize: 10,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>✋</span> RAISE HAND
            </button>

            {/* EMOTES */}
            <button
              onClick={() => setIsInventoryOpen(true)}
              style={{
                padding: '8px 14px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>😃</span> EMOTES
            </button>

            {/* ENTER STAGE */}
            <button
              onClick={onEnterStage}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                background: 'linear-gradient(135deg,#AA2DFF,#FF2DAA)',
                border: '1px solid #FF2DAA',
                color: '#fff',
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 0 20px rgba(170,45,255,0.6)',
              }}
            >
              <span>⭐</span> ENTER STAGE
            </button>
          </div>

          {/* Right Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#00FF88', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 8px #00FF88' }} />
              PERFECT CONNECTION (48ms)
            </div>
          </div>
        </div>

        {/* ROW 2: Bottom Navigation Dock */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
          {/* Main Navigation Links */}
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'HOME', icon: '🏠', path: '/hub/fan' },
              { label: 'DISCOVER', icon: '🧭', path: '/discover' },
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
                  gap: 6,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  position: 'relative',
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
                      padding: '1px 5px',
                    }}
                  >
                    {nav.badge}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Quick Tools */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => setIsMemoryWallOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}>
              📷 SCREENSHOT
            </button>
            <button onClick={() => setIsMemoryWallOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}>
              ⏺ RECORD
            </button>
            <button
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({ url: window.location.href, title: 'TMI' }).catch(() => {});
                } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href).catch(() => {});
                }
              }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}
            >
              📤 SHARE
            </button>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#FFD700', border: '1px solid #FFD700', borderRadius: 4, padding: '1px 4px' }}>
              4K HD
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
