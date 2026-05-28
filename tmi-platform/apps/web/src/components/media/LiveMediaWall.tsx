'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiveStreamShell from './LiveStreamShell';
import { mediaMesh } from '@/lib/media/MediaOrchestrator';
import Link from 'next/link';
import type { RoomVibeState } from '@/lib/live/RoomVibeEngine';

type WallMode = 'wall' | 'billboard' | 'audience' | 'split-screen' | 'spotlight';

interface MediaNode {
  id: string;
  isLive: boolean;
  label?: string;
  roomId?: string;
  title?: string;
  avatarUrl?: string;
  streamId?: string;
}

interface LiveMediaWallProps {
  roomId:       string;
  title?:       string;
  mode?:        WallMode;
  nodeCount?:   number;   // fallback count when no real streams
  accentColor?: string;
  enterHref?:   string;   // "Join Room" link
  compact?:     boolean;
}

function buildNodes(_roomId: string, count: number): MediaNode[] {
  void mediaMesh;
  return Array.from({ length: count }, (_, i) => ({
    id: `node-${i}`,
    isLive: false,
    label: `Stream ${i + 1}`,
  }));
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
  const [roomVibe, setRoomVibe] = useState<RoomVibeState | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [vibeLoading, setVibeLoading] = useState(true);
  const [vibeSyncIssue, setVibeSyncIssue] = useState(false);

  const isSpotlight = mode === 'spotlight';
  const isBillboard = mode === 'billboard';

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 640);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    let mounted = true;
    setVibeLoading(true);
    setVibeSyncIssue(false);
    const syncVibe = async () => {
      try {
        const res = await fetch(`/api/live/room-vibe?roomId=${encodeURIComponent(roomId)}`, { cache: 'no-store', credentials: 'include' });
        if (!res.ok || !mounted) {
          if (mounted) {
            setVibeLoading(false);
            setVibeSyncIssue(true);
          }
          return;
        }
        const data = (await res.json()) as { vibe?: RoomVibeState };
        if (!mounted) return;
        if (data.vibe) {
          setRoomVibe(data.vibe);
          setVibeSyncIssue(false);
        }
        setVibeLoading(false);
      } catch {
        if (mounted) {
          setVibeLoading(false);
          setVibeSyncIssue(true);
        }
      }
    };

    void syncVibe();
    const id = window.setInterval(() => void syncVibe(), 6000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [roomId]);

  const spotNode = nodes[spotIdx] ?? nodes[0];
  const railNodes = nodes.filter((_, i) => i !== spotIdx);
  const energyLabel = roomVibe
    ? roomVibe.strobeIntensity >= 70
      ? 'HIGH ENERGY'
      : roomVibe.strobeIntensity >= 40
        ? 'MID ENERGY'
        : 'LOW ENERGY'
    : null;
  const hasLiveNodes = nodes.some((node) => node.isLive);

  // Mobile: swipe-style single viewer
  if (isMobile || compact) {
    const cur = nodes[mobileIdx] ?? nodes[0];
    return (
      <div style={{ width: '100%' }}>
        {title && <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 10 }}>{title}</div>}
        {vibeLoading && (
          <div style={{ marginBottom: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', color: '#00FFFF' }}>
            SYNCING ROOM ATMOSPHERE...
          </div>
        )}
        {!hasLiveNodes && (
          <div style={{ marginBottom: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#FFD700' }}>
            PREVIEW MODE: LIVE NODES WILL APPEAR HERE WHEN ROOMS GO LIVE
          </div>
        )}
        {vibeSyncIssue && !roomVibe && (
          <div style={{ marginBottom: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.65)' }}>
            ATMOSPHERE DATA TEMPORARILY UNAVAILABLE
          </div>
        )}
        {roomVibe && (
          <div style={{ marginBottom: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.4)', borderRadius: 999, padding: '2px 8px', background: 'rgba(0,255,255,0.12)' }}>
              {roomVibe.underlay.toUpperCase()}
            </span>
            {roomVibe.overlay !== 'none' && (
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.4)', borderRadius: 999, padding: '2px 8px', background: 'rgba(255,45,170,0.12)' }}>
                {roomVibe.overlay.toUpperCase()}
              </span>
            )}
            {energyLabel && (
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#FFD700', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 999, padding: '2px 8px', background: 'rgba(255,215,0,0.12)' }}>
                {energyLabel}
              </span>
            )}
            {roomVibe.spotlightMode && (
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 999, padding: '2px 8px', background: 'rgba(255,255,255,0.12)' }}>
                SPOTLIGHT
              </span>
            )}
          </div>
        )}
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
        {vibeLoading && (
          <div style={{ marginBottom: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', color: '#00FFFF' }}>
            SYNCING ROOM ATMOSPHERE...
          </div>
        )}
        {!hasLiveNodes && (
          <div style={{ marginBottom: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#FFD700' }}>
            PREVIEW MODE: LIVE NODES WILL APPEAR HERE WHEN ROOMS GO LIVE
          </div>
        )}
        {roomVibe && (
          <div style={{ marginBottom: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.4)', borderRadius: 999, padding: '2px 8px', background: 'rgba(0,255,255,0.12)' }}>
              {roomVibe.underlay.toUpperCase()}
            </span>
            {roomVibe.overlay !== 'none' && (
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.4)', borderRadius: 999, padding: '2px 8px', background: 'rgba(255,45,170,0.12)' }}>
                {roomVibe.overlay.toUpperCase()}
              </span>
            )}
          </div>
        )}
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
                JOIN ROOM →
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
      {vibeLoading && (
        <div style={{ marginBottom: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', color: '#00FFFF' }}>
          SYNCING ROOM ATMOSPHERE...
        </div>
      )}
      {!hasLiveNodes && (
        <div style={{ marginBottom: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#FFD700' }}>
          PREVIEW MODE: LIVE NODES WILL APPEAR HERE WHEN ROOMS GO LIVE
        </div>
      )}
      {vibeSyncIssue && !roomVibe && (
        <div style={{ marginBottom: 8, fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.65)' }}>
          ATMOSPHERE DATA TEMPORARILY UNAVAILABLE
        </div>
      )}
      {roomVibe && (
        <div style={{ marginBottom: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.4)', borderRadius: 999, padding: '2px 8px', background: 'rgba(0,255,255,0.12)' }}>
            {roomVibe.underlay.toUpperCase()}
          </span>
          {roomVibe.overlay !== 'none' && (
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.4)', borderRadius: 999, padding: '2px 8px', background: 'rgba(255,45,170,0.12)' }}>
              {roomVibe.overlay.toUpperCase()}
            </span>
          )}
          {energyLabel && (
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.08em', color: '#FFD700', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 999, padding: '2px 8px', background: 'rgba(255,215,0,0.12)' }}>
              {energyLabel}
            </span>
          )}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
        {nodes.map((n, i) => (
          <motion.div key={n.streamId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => setSpotIdx(i)} style={{ cursor: 'pointer', borderRadius: 8, boxShadow: roomVibe ? `0 0 ${Math.max(10, roomVibe.strobeIntensity / 2)}px rgba(0,255,255,${Math.min(0.45, roomVibe.strobeIntensity / 180)})` : undefined }}>
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
          JOIN ROOM →
        </Link>
      )}
    </div>
  );
}
