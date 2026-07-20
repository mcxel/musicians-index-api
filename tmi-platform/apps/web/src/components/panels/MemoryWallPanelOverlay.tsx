'use client';

import React, { useState } from 'react';

export interface MemoryWallPanelOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MemoryWallPanelOverlay({
  isOpen,
  onClose,
}: MemoryWallPanelOverlayProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos' | 'tickets'>('all');

  if (!isOpen) return null;

  const memories = [
    { title: 'Thunder Dome', date: '5/18/2026', type: 'photo', bg: 'linear-gradient(135deg,#FF2DAA,#00FFFF)' },
    { title: 'MarcelD Live', date: '4/10/2026', type: 'video', bg: 'linear-gradient(135deg,#AA2DFF,#FFD700)' },
    { title: 'VIP Ticket', date: '10/18 ACCESS', type: 'ticket', bg: 'linear-gradient(135deg,#FFD700,#FF2DAA)' },
    { title: 'Cypher Concert', date: '3/22/2026', type: 'photo', bg: 'linear-gradient(135deg,#00FF88,#00E5FF)' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        right: 360,
        bottom: 110,
        zIndex: 9500,
        width: 320,
        background: 'rgba(10, 10, 26, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 229, 255, 0.35)',
        borderRadius: 16,
        padding: 18,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 229, 255, 0.2)',
        fontFamily: "'Inter', sans-serif",
        color: '#fff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.12em', color: '#fff', margin: 0 }}>
          MEMORY WALL
        </h3>
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

      {/* Sub Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          padding: 3,
          marginBottom: 16,
        }}
      >
        {(['all', 'photos', 'videos', 'tickets'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: 6,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: 'none',
              background: activeTab === tab ? 'linear-gradient(135deg,#00E5FF,#AA2DFF)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Polaroid Memory Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
        {memories.map((mem, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: 80,
                borderRadius: 6,
                background: mem.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 900,
                color: '#fff',
                marginBottom: 6,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              {mem.type === 'ticket' ? '🎟️ VIP' : mem.type === 'video' ? '🎥 LIVE' : '📸 SNAP'}
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#fff', textAlign: 'center' }}>{mem.title}</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{mem.date}</div>
          </div>
        ))}
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '12px 0',
          borderRadius: 10,
          background: 'linear-gradient(135deg,#00E5FF,#AA2DFF)',
          border: 'none',
          color: '#000',
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.1em',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(0,229,255,0.4)',
        }}
      >
        VIEW ALL MEMORIES
      </button>
    </div>
  );
}
