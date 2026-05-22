'use client';
import { CSSProperties } from 'react';

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  style?: CSSProperties;
};

export function SkeletonBox({ width = '100%', height = 20, borderRadius = 6, style }: SkeletonProps) {
  return (
    <div
      style={{
        width, height, borderRadius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%)',
        backgroundSize: '200% 100%',
        animation: 'tmi-shimmer 1.6s infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', ...style }}>
      <SkeletonBox height={120} borderRadius={8} style={{ marginBottom: 12 }} />
      <SkeletonBox height={14} width="70%" style={{ marginBottom: 8 }} />
      <SkeletonBox height={11} width="45%" />
    </div>
  );
}

export function SkeletonRail() {
  return (
    <div style={{ padding: '24px', display: 'flex', gap: 12, overflow: 'hidden' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ flexShrink: 0, width: 220 }}>
          <SkeletonCard />
        </div>
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div style={{ margin: '32px 24px', borderRadius: 14 }}>
      <SkeletonBox height={420} borderRadius={14} />
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 24 }}>
      <SkeletonBox width={80} height={80} borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <SkeletonBox height={18} width="60%" style={{ marginBottom: 8 }} />
        <SkeletonBox height={12} width="40%" style={{ marginBottom: 6 }} />
        <SkeletonBox height={12} width="80%" />
      </div>
    </div>
  );
}

// Global shimmer keyframe — inject once at app root
export function SkeletonStyleInjector() {
  return (
    <style>{`
      @keyframes tmi-shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position:  200% 0; }
      }
    `}</style>
  );
}
