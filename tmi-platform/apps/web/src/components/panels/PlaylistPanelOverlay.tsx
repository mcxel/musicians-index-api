'use client';

import React, { useState } from 'react';

export interface PlaylistPanelOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaylistPanelOverlay({
  isOpen,
  onClose,
}: PlaylistPanelOverlayProps) {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  if (!isOpen) return null;

  const tracks = [
    { title: 'Hustle & Flow', artist: 'MarcelD', duration: '4:18', plays: '128K' },
    { title: 'Thunder Dome Live', artist: 'BeatKing & MarcelD', duration: '3:45', plays: '89K' },
    { title: 'Cypher Gold Anthem', artist: 'QueenV', duration: '3:12', plays: '210K' },
    { title: 'Hyperspace Drift', artist: 'DJStorm', duration: '5:04', plays: '45K' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        left: 20,
        bottom: 110,
        zIndex: 9500,
        width: 320,
        background: 'rgba(10, 10, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 255, 136, 0.35)',
        borderRadius: 16,
        padding: 18,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 255, 136, 0.2)',
        fontFamily: "'Inter', sans-serif",
        color: '#fff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🎵</span>
          <h3 style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.12em', color: '#00FF88', margin: 0 }}>
            TMI AUDIO PLAYLISTS
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 16,
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Track list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {tracks.map((track, idx) => (
          <div
            key={idx}
            onClick={() => {
              setActiveTrackIndex(idx);
              setIsPlaying(true);
            }}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              background: activeTrackIndex === idx ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.04)',
              border: activeTrackIndex === idx ? '1px solid #00FF88' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: activeTrackIndex === idx ? '#00FF88' : '#fff' }}>
                {idx + 1}. {track.title}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {track.artist} · {track.plays} plays
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{track.duration}</div>
          </div>
        ))}
      </div>

      {/* Mini Player Bar */}
      <div
        style={{
          background: 'rgba(0,0,0,0.4)',
          borderRadius: 8,
          padding: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>
          {tracks[activeTrackIndex]?.title}
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            background: '#00FF88',
            border: 'none',
            color: '#000',
            fontWeight: 900,
            fontSize: 10,
            cursor: 'pointer',
          }}
        >
          {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
        </button>
      </div>
    </div>
  );
}
