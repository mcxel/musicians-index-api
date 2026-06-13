'use client';

import React from 'react';
import ExpandableMotionPanel from '@/components/motion/ExpandableMotionPanel';

export interface AdminMonitorProps {
  id: string;
  title: string;
  badgeText?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  feedType: 'live-stage' | 'lobby-wall' | 'analytics' | 'messages' | 'revenue' | 'security' | 'bot-health' | 'playlist-video';
  defaultOpen?: boolean;
  onExpand?: () => void;
}

export default function AdminMonitor({ id, title, badgeText = 'LIVE', badgeColor = '#E63000', icon, feedType, defaultOpen, onExpand }: AdminMonitorProps) {
  const collapsedPreview = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
        {icon || '📺'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: badgeColor, letterSpacing: '0.1em', marginBottom: 2 }}>{badgeText}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{title}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Feed: {feedType}</div>
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Click to expand ⤢</div>
    </div>
  );

  return (
    <ExpandableMotionPanel
      variant="monitor"
      defaultOpen={defaultOpen}
      onExpand={onExpand}
      collapsedPreview={collapsedPreview}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Feed Simulator / Actual Player Wrapper */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ fontSize: 32, opacity: 0.5, marginBottom: 8 }}>{icon || '📺'}</div>
          <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-orbitron)' }}>
            {title.toUpperCase()} CONNECTED
          </div>
        </div>
        
        {/* Control Room Action Bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.8)', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ background: 'rgba(0,229,255,0.2)', border: '1px solid #00FFFF', color: '#00FFFF', fontSize: 9, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}>⤢ FULLSCREEN</button>
            <button style={{ background: 'rgba(255,215,0,0.2)', border: '1px solid #FFD700', color: '#FFD700', fontSize: 9, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}>⇄ SWAP TO MAIN</button>
            <button style={{ background: 'rgba(255,45,170,0.2)', border: '1px solid #FF2DAA', color: '#FF2DAA', fontSize: 9, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontWeight: 700 }}>↗ POP OUT (PiP)</button>
          </div>
          <div style={{ fontSize: 9, color: '#00FF88', fontWeight: 700 }}>● RECEIVING</div>
        </div>
      </div>
    </ExpandableMotionPanel>
  );
}