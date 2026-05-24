'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveStreamShell from './LiveStreamShell';
import MediaOrchestrator from '@/lib/media/MediaOrchestrator';
import type { MediaNode } from '@/lib/media/MediaOrchestrator';
import Link from 'next/link';

type WallMode = 'wall' | 'billboard' | 'audience' | 'split-screen' | 'spotlight';

interface LiveMediaWallProps {
  roomId:       string;
  title?:       string;
  mode?:        WallMode;
  nodeCount?:   number;   // fallback count when no real streams
  accentColor?: string;
  enterHref?:   string;   // "Join Room" link
  compact?:     boolean;
}

function buildNodes(roomId: string, count: number): MediaNode[] {
  const room = MediaOrchestrator.getRoomState(roomId);
  const live = room.nodes.filter(n => n.isLive);
  const needed = Math.max(0, count - live.length);
  const fallbacks = Array.from({ length: needed }, (_, i) =>
    MediaOrchestrator.getFallbackMediaNode(roomId, live.length + i)
  );
  return [...live, ...fallbacks].slice(0, count);
}

export default function LiveMediaWall({
  roomId,
  title      = 'Live Wall',
  mode       = 'wall',
  nodeCount  = 6,
  accentColor = '#00FFFF',
  enterHref,
  compact    = false,
}: LiveMediaWallProps) {
  const nodes            = buildNodes(roomId, nodeCount);
  const [spotIdx, setSpotIdx] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const isSpotlight = mode === 'spotlight';
  const isBillboard = mode === 'billboard';

  const spotNode = nodes[spotIdx] ?? nodes[0];
  const railNodes = nodes.filter((_, i) => i !== spotIdx);

  // Mobile: swipe-style single viewer
  if (isMobile || compact) {
    const cur = nodes[mobileIdx] ?? nodes[0];
    return (
      <div style={{ width: '100%' }}>
        {title && <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 10 }}>{title}</div>}
        <div style={{ position: 'relative' }}>
          <LiveStreamShell
            mode="viewer"
            roomId={cur?.roomId ?? roomId}
            title={cur?.title ?? 'Room'}
            fallbackAvatar={cur?.avatarUrl ?? '🎤'}
            accentColor={accentColor}
          />
          {/* Big chevron nav */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
            <button onClick={() => setMobileIdx(i => Math.max(0, i - 1))} disabled={mobileIdx === 0}
              style={{ flex: 1, padding: '12px 0', fontSize: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: mobileIdx === 0 ? '#333' : '#fff' }}>
              ‹
            </button>
            <button onClick={() => setMobileIdx(i => Math.min(nodes.length - 1, i + 1))} disabled={mobileIdx >= nodes.length - 1}
              style={{ flex: 1, padding: '12px 0', fontSize: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: mobileIdx >= nodes.length - 1 ? '#333' : '#fff' }}>
              ›
            </button>
          </div>
          {enterHref && (
            <Link href={enterHref} style={{ display: 'block', marginTop: 8, padding: '12px 0', textAlign: 'center', background: `linear-gradient(135deg,${accentColor},${accentColor}88)`, color: '#050510', fontWeight: 900, fontSize: 11, letterSpacing: '0.15em', borderRadius: 8, textDecoration: 'none' }}>
              JOIN ROOM →
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Spotlight mode: 1 main + rail
  if (isSpotlight && nodes.length > 1) {
    return (
      <div style={{ width: '100%' }}>
        {title && <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 10 }}>{title}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 8 }}>
          <AnimatePresence mode="wait">
            <motion.div key={spotNode?.streamId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <LiveStreamShell mode="spotlight" roomId={roomId} title={spotNode?.title ?? 'Stage'} fallbackAvatar={spotNode?.avatarUrl ?? '🎤'} accentColor={accentColor} />
            </motion.div>
          </AnimatePresence>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {railNodes.map((n, i) => (
              <div key={n.streamId} onClick={() => setSpotIdx(nodes.indexOf(n))} style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: `1px solid ${accentColor}22` }}>
                <LiveStreamShell compact mode="viewer" roomId={roomId} title={n.title} fallbackAvatar={n.avatarUrl ?? '🎤'} accentColor={accentColor} />
              </div>
            ))}
            {enterHref && (
              <Link href={enterHref} style={{ display: 'block', padding: '10px 0', textAlign: 'center', background: `${accentColor}22`, color: accentColor, fontWeight: 800, fontSize: 10, letterSpacing: '0.12em', borderRadius: 8, textDecoration: 'none', border: `1px solid ${accentColor}44` }}>
                ENTER →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default grid / billboard
  const cols = isBillboard ? 3 : Math.min(nodes.length, 3);
  return (
    <div style={{ width: '100%' }}>
      {title && <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 10 }}>{title}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
        {nodes.map((n, i) => (
          <motion.div key={n.streamId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => setSpotIdx(i)} style={{ cursor: 'pointer' }}>
            <LiveStreamShell
              mode="viewer"
              roomId={roomId}
              title={n.title}
              fallbackAvatar={n.avatarUrl ?? '🎤'}
              accentColor={accentColor}
              compact={isBillboard}
            />
          </motion.div>
        ))}
      </div>
      {enterHref && (
        <Link href={enterHref} style={{ display: 'block', marginTop: 10, padding: '11px 0', textAlign: 'center', background: `${accentColor}14`, color: accentColor, fontWeight: 800, fontSize: 10, letterSpacing: '0.15em', borderRadius: 8, textDecoration: 'none', border: `1px solid ${accentColor}33` }}>
          WATCH LIVE →
        </Link>
      )}
    </div>
  );
}
