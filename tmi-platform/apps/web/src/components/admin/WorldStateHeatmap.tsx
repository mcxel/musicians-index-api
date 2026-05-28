'use client';

import { useMemo } from 'react';

export interface HeatmapCell {
  row: number;
  col: number;
  energy: number;        // 0–1
  avatarId?: string;
  displayName?: string;
  role?: string;
  clusterId?: string;
  sectionId?: string;
  isOnline?: boolean;
}

export interface WorldStateHeatmapProps {
  cells: HeatmapCell[][];   // [row][col]
  rows?: number;
  cols?: number;
  accentColor?: string;
  onCellClick?: (cell: HeatmapCell) => void;
  showLabels?: boolean;
  showClusters?: boolean;
  showSections?: boolean;
  title?: string;
}

const SECTION_BORDER: Record<string, string> = {
  'pit':      '#FF2DAA',
  'vip':      '#FFD700',
  'floor-l':  '#00FFFF',
  'floor-r':  '#00FFFF',
  'floor-c':  '#00FF88',
  'balcony':  '#AA2DFF',
};

const CLUSTER_COLORS = ['#AA2DFF', '#FF2DAA', '#FFD700', '#00FF88', '#00FFFF', '#FF9500'];

function energyToColor(energy: number, accent: string): string {
  if (energy <= 0.01) return 'rgba(255,255,255,0.03)';
  if (energy <= 0.3)  return `rgba(255,255,255,${0.06 + energy * 0.1})`;
  if (energy <= 0.6)  return `${accent}${Math.round(20 + energy * 40).toString(16).padStart(2,'0')}`;
  if (energy <= 0.85) return `${accent}${Math.round(60 + energy * 60).toString(16).padStart(2,'0')}`;
  return accent;
}

function energyToGlow(energy: number, accent: string): string {
  if (energy < 0.7) return 'none';
  const strength = Math.round((energy - 0.7) / 0.3 * 12);
  return `0 0 ${strength}px ${accent}`;
}

export default function WorldStateHeatmap({
  cells,
  rows = 8,
  cols = 10,
  accentColor = '#00FFFF',
  onCellClick,
  showLabels = false,
  showClusters = true,
  showSections = true,
  title = 'Crowd Energy Heatmap',
}: WorldStateHeatmapProps) {
  const flat = useMemo(() => cells.flat(), [cells]);

  const avgEnergy = useMemo(() => {
    const occupied = flat.filter((c) => c.energy > 0.01);
    if (!occupied.length) return 0;
    return occupied.reduce((s, c) => s + c.energy, 0) / occupied.length;
  }, [flat]);

  const hotspots = useMemo(() => flat.filter((c) => c.energy > 0.85).length, [flat]);

  // Cluster color assignment
  const clusterColorMap = useMemo(() => {
    const map = new Map<string, string>();
    let ci = 0;
    for (const cell of flat) {
      if (cell.clusterId && !map.has(cell.clusterId)) {
        map.set(cell.clusterId, CLUSTER_COLORS[ci % CLUSTER_COLORS.length]!);
        ci++;
      }
    }
    return map;
  }, [flat]);

  const cellSize = Math.min(52, Math.floor(560 / cols));

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
          {title}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>AVG ENERGY </span>
            <span style={{ fontSize: 9, fontWeight: 900, color: accentColor }}>{Math.round(avgEnergy * 100)}%</span>
          </div>
          <div>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>HOT ZONES </span>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#FF2DAA' }}>{hotspots}</span>
          </div>
        </div>
      </div>

      {/* Stage label */}
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.3em', color: accentColor, opacity: 0.5 }}>▲ STAGE ▲</span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gap: 3,
        margin: '0 auto',
        width: 'fit-content',
      }}>
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const cell = cells[row]?.[col] ?? { row, col, energy: 0 };
            const bg = energyToColor(cell.energy, accentColor);
            const glow = energyToGlow(cell.energy, accentColor);
            const sectionBorder = showSections && cell.sectionId
              ? `1px solid ${SECTION_BORDER[cell.sectionId] ?? 'rgba(255,255,255,0.06)'}30`
              : '1px solid rgba(255,255,255,0.04)';
            const clusterRing = showClusters && cell.clusterId
              ? `inset 0 0 0 2px ${clusterColorMap.get(cell.clusterId) ?? 'transparent'}44`
              : undefined;

            const cellStyle: React.CSSProperties = {
              width: cellSize, height: cellSize,
              background: bg,
              border: sectionBorder,
              borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column',
              cursor: onCellClick ? 'pointer' : 'default',
              boxShadow: [glow, clusterRing].filter(Boolean).join(', ') || 'none',
              transition: 'background 0.4s, box-shadow 0.4s',
              position: 'relative',
              overflow: 'hidden',
            };

            return (
              <div
                key={`${row}-${col}`}
                style={cellStyle}
                onClick={() => onCellClick?.(cell)}
                title={cell.displayName ? `${cell.displayName} · ${Math.round(cell.energy * 100)}%` : undefined}
              >
                {/* Energy fill bar at bottom */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: `${cell.energy * 100}%`,
                  background: `${accentColor}14`,
                  borderRadius: '0 0 3px 3px',
                  transition: 'height 0.3s',
                }} />

                {showLabels && cell.displayName && (
                  <span style={{ fontSize: 6, fontWeight: 700, color: 'rgba(255,255,255,0.5)', zIndex: 1, lineHeight: 1 }}>
                    {cell.displayName.slice(0, 4)}
                  </span>
                )}
                {cell.energy > 0.85 && (
                  <span style={{ fontSize: 8, zIndex: 1 }}>🔥</span>
                )}
                {cell.isOnline === false && cell.avatarId && (
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', zIndex: 1 }}>⋯</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Back wall label */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.2)' }}>BACK</span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { label: 'Empty',   color: 'rgba(255,255,255,0.06)' },
          { label: 'Low',     color: `${accentColor}28` },
          { label: 'Mid',     color: `${accentColor}66` },
          { label: 'High',    color: `${accentColor}bb` },
          { label: 'Peak 🔥', color: accentColor },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>{l.label}</span>
          </div>
        ))}
        {showClusters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, border: '2px solid #AA2DFF' }} />
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>Cluster</span>
          </div>
        )}
      </div>
    </div>
  );
}
