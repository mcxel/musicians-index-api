'use client';

import React from 'react';

interface VideoPanelProps {
  primaryFeedTitle: string;
  secondaryFeedTitle?: string;
  mode: 'standard' | 'mtv' | 'collaboration';
}

export default function VideoPanel({ primaryFeedTitle, secondaryFeedTitle, mode }: VideoPanelProps) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#050508', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Primary Feed (Camera) */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.4)', fontWeight: 900, fontFamily: 'var(--font-orbitron)' }}>{primaryFeedTitle}</div>
      </div>
      
      {/* Secondary Embedded Feed (Music Video or DAW) */}
      {(mode === 'mtv' || mode === 'collaboration') && secondaryFeedTitle && (
        <div style={{ position: 'absolute', bottom: 20, right: 20, width: mode === 'collaboration' ? '45%' : '25%', aspectRatio: '16/9', background: '#000', border: `2px solid ${mode === 'collaboration' ? '#00FF88' : '#FF2DAA'}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
           <div style={{ position: 'absolute', top: 4, left: 6, fontSize: 8, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
             {mode === 'collaboration' ? 'DAW STREAM' : 'MEDIA'}
           </div>
           <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textAlign: 'center' }}>{secondaryFeedTitle}</div>
        </div>
      )}
      
      {/* Status Overlay */}
      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
        <div style={{ background: 'rgba(230,48,0,0.8)', color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 4, letterSpacing: '0.1em' }}>● LIVE</div>
        {mode === 'mtv' && <div style={{ background: 'rgba(255,45,170,0.8)', color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 4, letterSpacing: '0.1em' }}>MTV MODE</div>}
        {mode === 'collaboration' && <div style={{ background: 'rgba(0,255,136,0.8)', color: '#000', fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 4, letterSpacing: '0.1em' }}>PRODUCER COLLAB</div>}
      </div>
    </div>
  );
}