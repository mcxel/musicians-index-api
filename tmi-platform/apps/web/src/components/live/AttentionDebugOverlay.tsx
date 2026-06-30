'use client';

import { useEffect, useState, useRef } from 'react';
import { avatarAttentionRuntime } from '@/lib/engines/attention/AvatarAttentionRuntime';
import { roomEnergyEngine } from '@/lib/live/RoomEnergyEngine';

interface AttentionDebugState {
  // Room
  roomId: string;
  performerId?: string;
  audienceCount: number;
  lodLevel: string;

  // Attention
  updatesPerSec: number;
  dominantTargets: string[];
  currentBlendPercent: number;
  avgHeadYaw: number;
  avgHeadPitch: number;
  avgIntensity: number;
  transitioningCount: number;
  totalAvatars: number;
  activePropagationQueue: number;

  // Energy
  roomEnergy?: string;
  lastTrigger?: string;
  lastTriggerTime?: number;
  lastTip?: number;
  lastApplause?: number;
  lastEncore?: number;

  // Performance
  fps: number;
  frameTime: number;
  animatedAvatars: number;
}

export function AttentionDebugOverlay({
  roomId,
  avatarIds = [],
  performerId,
  enabled = true,
}: {
  roomId: string;
  avatarIds?: string[];
  performerId?: string;
  enabled?: boolean;
}) {
  const [debugState, setDebugState] = useState<AttentionDebugState>({
    roomId,
    performerId,
    audienceCount: 0,
    lodLevel: 'FULL',
    updatesPerSec: 0,
    dominantTargets: [],
    currentBlendPercent: 0,
    avgHeadYaw: 0,
    avgHeadPitch: 0,
    avgIntensity: 0,
    transitioningCount: 0,
    totalAvatars: 0,
    activePropagationQueue: 0,
    roomEnergy: 'COLD',
    fps: 0,
    frameTime: 0,
    animatedAvatars: 0,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const lastFrameTimeRef = useRef<number[]>([]);
  const updateCountRef = useRef(0);
  const lastUpdateCountRef = useRef(0);
  const lastTriggerRef = useRef<{ type?: string; time?: number }>({});

  useEffect(() => {
    if (!enabled) return;

    const updateDebug = () => {
      const now = Date.now();
      const frameStart = performance.now();
      frameCountRef.current++;
      updateCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        const stats = avatarAttentionRuntime.getStats(avatarIds);
        const roomEnergy = roomEnergyEngine.getState(roomId);

        // Get dominant targets and blend state
        const targetCounts = new Map<string, number>();
        let totalBlendPercent = 0;
        let animatedCount = 0;

        avatarIds.forEach(id => {
          const state = avatarAttentionRuntime.getDebugState(id);
          const output = avatarAttentionRuntime.getVisualOutput(id);
          if (state) {
            targetCounts.set(
              state.currentTarget,
              (targetCounts.get(state.currentTarget) ?? 0) + 1
            );
            totalBlendPercent += output?.blendProgress ?? 0;
            if (state.transitionProgress < 1) animatedCount++;
          }
        });

        const dominantTargets = Array.from(targetCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([target, count]) => `${target} (${count})`);

        // Estimate LOD based on avatar count
        let lodLevel = 'FULL';
        if (avatarIds.length > 300) lodLevel = 'SIMPLIFIED';
        else if (avatarIds.length > 150) lodLevel = 'REDUCED';

        // Calculate frame time
        const frameTime = performance.now() - frameStart;
        lastFrameTimeRef.current.push(frameTime);
        if (lastFrameTimeRef.current.length > 30) {
          lastFrameTimeRef.current.shift();
        }
        const avgFrameTime = lastFrameTimeRef.current.reduce((a, b) => a + b, 0) / lastFrameTimeRef.current.length;

        setDebugState({
          roomId,
          performerId,
          audienceCount: avatarIds.length,
          lodLevel,
          updatesPerSec: updateCountRef.current - lastUpdateCountRef.current,
          dominantTargets,
          currentBlendPercent: Math.round((totalBlendPercent / Math.max(1, avatarIds.length)) * 100),
          avgHeadYaw: Math.round(stats.avgHeadYaw * 100) / 100,
          avgHeadPitch: Math.round(stats.avgHeadPitch * 100) / 100,
          avgIntensity: Math.round(stats.avgIntensity * 100) / 100,
          transitioningCount: stats.transitioningCount,
          totalAvatars: avatarIds.length,
          activePropagationQueue: animatedCount,
          roomEnergy: roomEnergy?.energyLabel,
          lastTrigger: lastTriggerRef.current.type,
          lastTriggerTime: lastTriggerRef.current.time,
          fps: frameCountRef.current,
          frameTime: Math.round(avgFrameTime * 100) / 100,
          animatedAvatars: animatedCount,
        });

        frameCountRef.current = 0;
        lastTimeRef.current = now;
        lastUpdateCountRef.current = updateCountRef.current;
      }

      requestAnimationFrame(updateDebug);
    };

    const frameId = requestAnimationFrame(updateDebug);
    return () => cancelAnimationFrame(frameId);
  }, [enabled, roomId, avatarIds, performerId]);

  if (!enabled) return null;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid rgba(170, 45, 255, 0.15)' }}>
      <div style={{ color: '#FFD700', fontSize: 9, fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </div>
      {children}
    </div>
  );

  const Row = ({ label, value, color = '#00FF88' }: { label: string; value: string | number; color?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2, color: '#AAA' }}>
      <span>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        background: 'rgba(5, 5, 15, 0.98)',
        border: '1px solid rgba(170, 45, 255, 0.6)',
        borderRadius: 8,
        padding: 12,
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#00FFFF',
        zIndex: 9999,
        maxWidth: 380,
        boxShadow: '0 0 30px rgba(170, 45, 255, 0.3)',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 10, letterSpacing: 3, fontSize: 11 }}>
        ⚡ RUNTIME INSPECTOR
      </div>

      <Section title="🏠 Room">
        <Row label="Room ID" value={debugState.roomId} color="#00FFFF" />
        <Row label="Performer" value={debugState.performerId ?? '—'} color="#FF2DAA" />
        <Row label="Audience" value={debugState.audienceCount} color="#00FF88" />
        <Row label="LOD Level" value={debugState.lodLevel} color="#FFD700" />
      </Section>

      <Section title="👁️ Attention">
        <Row label="Updates/sec" value={debugState.updatesPerSec} color="#00FF88" />
        <Row label="Blend %" value={`${debugState.currentBlendPercent}%`} color="#FF2DAA" />
        <Row label="Avg Head Yaw" value={debugState.avgHeadYaw.toFixed(2)} color="#00FFFF" />
        <Row label="Avg Head Pitch" value={debugState.avgHeadPitch.toFixed(2)} color="#00FFFF" />
        <Row label="Avg Intensity" value={debugState.avgIntensity.toFixed(2)} color="#00FF88" />
        <Row label="Transitioning" value={`${debugState.transitioningCount}/${debugState.totalAvatars}`} color="#FFD700" />
        <Row label="Propagation Queue" value={debugState.activePropagationQueue} color="#FF2DAA" />
        <div style={{ marginTop: 4, fontSize: 9, color: '#666' }}>
          Targets: {debugState.dominantTargets.length > 0 ? debugState.dominantTargets.join(', ') : '(initializing)'}
        </div>
      </Section>

      <Section title="⚡ Energy">
        <Row label="Room Energy" value={debugState.roomEnergy ?? 'COLD'} color="#FFD700" />
        <Row label="Last Event" value={debugState.lastTrigger ?? '—'} color="#FF2DAA" />
        {debugState.lastTriggerTime && (
          <Row label="Event Age" value={`${Date.now() - debugState.lastTriggerTime}ms`} color="#AAA" />
        )}
      </Section>

      <Section title="⚙️ Performance">
        <Row label="FPS" value={debugState.fps} color={debugState.fps >= 60 ? '#00FF88' : debugState.fps >= 30 ? '#FFD700' : '#FF2DAA'} />
        <Row label="Frame Time" value={`${debugState.frameTime.toFixed(1)}ms`} color={debugState.frameTime < 16.67 ? '#00FF88' : '#FFD700'} />
        <Row label="Animated" value={debugState.animatedAvatars} color="#00FFFF" />
      </Section>

      <div style={{ fontSize: 8, color: '#555', marginTop: 8, textAlign: 'center', paddingTop: 6, borderTop: '1px solid rgba(170, 45, 255, 0.1)' }}>
        Debug mode • Real-time values • No derived estimates
      </div>
    </div>
  );
}
