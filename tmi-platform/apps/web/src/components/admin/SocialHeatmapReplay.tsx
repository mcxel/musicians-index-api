'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export interface ReplayFrame {
  timestampMs: number;
  label: string;
  avatars: ReplayAvatar[];
}

export interface ReplayAvatar {
  id: string;
  name: string;
  row: number;
  col: number;
  energy: number;
  headYaw: number;       // -1 left → 0 center → 1 right
  headPitch: number;     // -1 down → 0 level → 1 up
  attentionTarget: string;
  affinityCluster?: string;
  emotionalState?: string;
  isInLegendaryMoment?: boolean;
}

export interface SocialHeatmapReplayProps {
  frames: ReplayFrame[];
  rows?: number;
  cols?: number;
  accentColor?: string;
  autoPlay?: boolean;
  playbackSpeed?: number;  // 1 = realtime, 2 = 2x, 0.5 = half
  onFrameChange?: (frame: ReplayFrame, index: number) => void;
}

const CLUSTER_COLORS = ['#AA2DFF', '#FF2DAA', '#FFD700', '#00FF88', '#00FFFF', '#FF9500'];
const ATTENTION_COLORS: Record<string, string> = {
  stage: '#00FFFF',
  performer: '#FF2DAA',
  idle: 'rgba(255,255,255,0.25)',
  avatar: '#00FF88',
  event: '#FFD700',
};
const STATE_COLORS: Record<string, string> = {
  social: '#00FFFF', loyal: '#FF2DAA', observer: '#AA2DFF',
  newcomer: 'rgba(255,255,255,0.3)', legendary: '#FFD700',
  generous: '#00FF88', performer: '#FF9500',
};

function energyToColor(energy: number, accent: string): string {
  if (energy <= 0.01) return 'rgba(255,255,255,0.03)';
  if (energy <= 0.3)  return `rgba(255,255,255,${0.05 + energy * 0.1})`;
  if (energy <= 0.6)  return `${accent}${Math.round(20 + energy * 40).toString(16).padStart(2,'0')}`;
  if (energy <= 0.85) return `${accent}${Math.round(60 + energy * 60).toString(16).padStart(2,'0')}`;
  return accent;
}

// Render a tiny gaze arrow inside the cell
function GazeArrow({ yaw, pitch, color }: { yaw: number; pitch: number; color: string }) {
  const angle = yaw * 60;  // degrees
  return (
    <div style={{
      position: 'absolute', width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        width: 10, height: 2,
        background: color,
        borderRadius: 1,
        transform: `rotate(${angle}deg)`,
        opacity: 0.7 + Math.abs(yaw) * 0.3,
        transformOrigin: 'left center',
        marginLeft: pitch > 0 ? -1 : 1,
      }} />
      {/* Arrowhead */}
      <div style={{
        position: 'absolute',
        width: 0, height: 0,
        borderLeft: `4px solid ${color}`,
        borderTop: '2px solid transparent',
        borderBottom: '2px solid transparent',
        transform: `rotate(${angle}deg) translateX(8px)`,
        transformOrigin: 'left center',
        opacity: 0.8,
      }} />
    </div>
  );
}

export default function SocialHeatmapReplay({
  frames,
  rows = 6,
  cols = 5,
  accentColor = '#AA2DFF',
  autoPlay = false,
  playbackSpeed = 1,
  onFrameChange,
}: SocialHeatmapReplayProps) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(playbackSpeed);
  const [hoveredAvatar, setHoveredAvatar] = useState<ReplayAvatar | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentFrame = frames[frameIdx];
  const avatarMap = useMemo(() => {
    const map = new Map<string, ReplayAvatar>();
    if (!currentFrame) return map;
    for (const a of currentFrame.avatars) map.set(`${a.row}-${a.col}`, a);
    return map;
  }, [currentFrame]);

  const clusterColorMap = useMemo(() => {
    const map = new Map<string, string>();
    let ci = 0;
    if (!currentFrame) return map;
    for (const a of currentFrame.avatars) {
      if (a.affinityCluster && !map.has(a.affinityCluster)) {
        map.set(a.affinityCluster, CLUSTER_COLORS[ci % CLUSTER_COLORS.length]!);
        ci++;
      }
    }
    return map;
  }, [currentFrame]);

  const advanceFrame = useCallback(() => {
    setFrameIdx((idx) => {
      const next = idx + 1;
      if (next >= frames.length) {
        setPlaying(false);
        return idx;
      }
      return next;
    });
  }, [frames.length]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;

    // Compute interval from frame timestamps
    const current = frames[frameIdx];
    const next = frames[frameIdx + 1];
    const frameDeltaMs = next && current
      ? Math.max(100, (next.timestampMs - current.timestampMs) / speed)
      : 500;

    intervalRef.current = setInterval(advanceFrame, frameDeltaMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, frameIdx, frames, speed, advanceFrame]);

  useEffect(() => {
    if (currentFrame) onFrameChange?.(currentFrame, frameIdx);
  }, [frameIdx, currentFrame, onFrameChange]);

  if (!frames.length) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace' }}>
        No replay frames. Run the benchmark or trigger a legendary event to generate frames.
      </div>
    );
  }

  const frameProgress = frames.length > 1 ? frameIdx / (frames.length - 1) : 0;
  const cellSize = Math.min(64, Math.floor(380 / cols));

  // Aggregate stats for current frame
  const frameAvatars = currentFrame?.avatars ?? [];
  const avgEnergy = frameAvatars.length
    ? frameAvatars.reduce((s, a) => s + a.energy, 0) / frameAvatars.length
    : 0;
  const stageWatchers = frameAvatars.filter((a) => a.attentionTarget === 'stage' || a.attentionTarget.startsWith('performer')).length;
  const legendaryCount = frameAvatars.filter((a) => a.isInLegendaryMoment).length;

  return (
    <div style={{ fontFamily: 'monospace', width: '100%' }}>
      {/* Timeline scrubber */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
            Social Heatmap Replay
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>
              Frame {frameIdx + 1}/{frames.length}
            </span>
            <span style={{ fontSize: 8, color: accentColor, fontWeight: 900 }}>
              {currentFrame?.label ?? ''}
            </span>
          </div>
        </div>

        {/* Scrub bar */}
        <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, cursor: 'pointer' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            setFrameIdx(Math.round(pct * (frames.length - 1)));
          }}
        >
          <div style={{
            width: `${frameProgress * 100}%`,
            height: '100%', background: accentColor,
            borderRadius: 3, transition: playing ? 'width 0.1s' : 'none',
          }} />
          {/* Markers at each frame */}
          {frames.map((f, i) => f.avatars.some((a) => a.isInLegendaryMoment) ? (
            <div key={i} style={{
              position: 'absolute', top: -2,
              left: `${(i / (frames.length - 1)) * 100}%`,
              width: 2, height: 10,
              background: '#FFD700',
              borderRadius: 1,
              transform: 'translateX(-50%)',
            }} />
          ) : null)}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <button onClick={() => setFrameIdx(0)} style={btnStyle}>⏮</button>
        <button onClick={() => setFrameIdx(Math.max(0, frameIdx - 1))} style={btnStyle}>◀</button>
        <button onClick={() => setPlaying((p) => !p)} style={{ ...btnStyle, background: playing ? 'rgba(255,45,170,0.2)' : 'rgba(170,45,255,0.2)', borderColor: playing ? '#FF2DAA' : accentColor, color: playing ? '#FF2DAA' : accentColor }}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => setFrameIdx(Math.min(frames.length - 1, frameIdx + 1))} style={btnStyle}>▶</button>
        <button onClick={() => setFrameIdx(frames.length - 1)} style={btnStyle}>⏭</button>

        <div style={{ marginLeft: 8, display: 'flex', gap: 4 }}>
          {[0.25, 0.5, 1, 2, 4].map((s) => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              ...btnStyle,
              background: speed === s ? `${accentColor}33` : 'transparent',
              borderColor: speed === s ? accentColor : 'rgba(255,255,255,0.12)',
              color: speed === s ? accentColor : 'rgba(255,255,255,0.4)',
              padding: '4px 7px',
            }}>
              {s}×
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
          {[
            { label: 'Avg Energy', value: `${Math.round(avgEnergy * 100)}%`, color: accentColor },
            { label: 'On Stage', value: `${stageWatchers}/${frameAvatars.length}`, color: '#00FFFF' },
            { label: 'Legendary', value: legendaryCount, color: '#FFD700' },
          ].map((s) => (
            <div key={s.label}>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>{s.label} </span>
              <span style={{ fontSize: 9, fontWeight: 900, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Grid */}
        <div>
          <div style={{ fontSize: 8, textAlign: 'center', marginBottom: 4, color: accentColor, opacity: 0.5, letterSpacing: '0.3em', fontWeight: 900 }}>▲ STAGE ▲</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gap: 3,
          }}>
            {Array.from({ length: rows }, (_, row) =>
              Array.from({ length: cols }, (_, col) => {
                const avatar = avatarMap.get(`${row}-${col}`);
                const bg = avatar ? energyToColor(avatar.energy, accentColor) : 'rgba(255,255,255,0.02)';
                const clusterColor = avatar?.affinityCluster
                  ? clusterColorMap.get(avatar.affinityCluster) ?? 'transparent'
                  : 'transparent';
                const stateColor = avatar?.emotionalState
                  ? (STATE_COLORS[avatar.emotionalState] ?? '#fff')
                  : 'transparent';
                const attColor = avatar
                  ? (ATTENTION_COLORS[avatar.attentionTarget] ?? ATTENTION_COLORS.stage!)
                  : 'transparent';
                const isLegendary = avatar?.isInLegendaryMoment;

                return (
                  <div
                    key={`${row}-${col}`}
                    style={{
                      width: cellSize, height: cellSize,
                      background: bg,
                      border: `1px solid ${avatar ? `${clusterColor}55` : 'rgba(255,255,255,0.04)'}`,
                      borderRadius: 5,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: avatar ? 'pointer' : 'default',
                      boxShadow: isLegendary ? `0 0 12px #FFD700` : avatar && avatar.energy > 0.8 ? `0 0 6px ${accentColor}` : 'none',
                      transition: 'background 0.3s, box-shadow 0.3s',
                    }}
                    onMouseEnter={() => avatar && setHoveredAvatar(avatar)}
                    onMouseLeave={() => setHoveredAvatar(null)}
                  >
                    {/* Energy fill */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: `${(avatar?.energy ?? 0) * 100}%`,
                      background: `${accentColor}18`,
                      borderRadius: '0 0 4px 4px',
                      transition: 'height 0.3s',
                    }} />

                    {/* Cluster ring */}
                    {avatar?.affinityCluster && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        boxShadow: `inset 0 0 0 2px ${clusterColor}55`,
                        borderRadius: 4,
                        pointerEvents: 'none',
                      }} />
                    )}

                    {/* Gaze direction */}
                    {avatar && (
                      <GazeArrow yaw={avatar.headYaw} pitch={avatar.headPitch} color={attColor} />
                    )}

                    {/* Name label */}
                    {avatar && (
                      <div style={{
                        position: 'absolute', top: 3, left: 0, right: 0,
                        textAlign: 'center', fontSize: 7, fontWeight: 900,
                        color: stateColor, lineHeight: 1,
                      }}>
                        {avatar.name.slice(0, 4)}
                      </div>
                    )}

                    {/* Legendary pulse */}
                    {isLegendary && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ fontSize: 8, textAlign: 'center', marginTop: 4, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', fontWeight: 700 }}>BACK</div>
        </div>

        {/* Side info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Hovered avatar detail */}
          {hoveredAvatar ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: '#fff', marginBottom: 6 }}>{hoveredAvatar.name}</div>
              {[
                { label: 'Energy',    value: `${Math.round(hoveredAvatar.energy * 100)}%`, color: accentColor },
                { label: 'Attention', value: hoveredAvatar.attentionTarget, color: ATTENTION_COLORS[hoveredAvatar.attentionTarget] ?? '#fff' },
                { label: 'State',     value: hoveredAvatar.emotionalState ?? '—', color: STATE_COLORS[hoveredAvatar.emotionalState ?? ''] ?? '#fff' },
                { label: 'Cluster',   value: hoveredAvatar.affinityCluster ?? 'none', color: clusterColorMap.get(hoveredAvatar.affinityCluster ?? '') ?? 'rgba(255,255,255,0.3)' },
                { label: 'Yaw',       value: `${Math.round(hoveredAvatar.headYaw * 60)}°`, color: 'rgba(255,255,255,0.5)' },
              ].map((r) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 3 }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: 700 }}>{r.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', padding: 12, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8 }}>
              Hover a cell to inspect avatar
            </div>
          )}

          {/* Legend */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>Legend</div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontWeight: 700 }}>Gaze Arrow Color</div>
            {Object.entries(ATTENTION_COLORS).map(([k, c]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <div style={{ width: 20, height: 2, background: c, borderRadius: 1 }} />
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>{k}</span>
              </div>
            ))}
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 8, marginBottom: 4, fontWeight: 700 }}>Cluster Ring</div>
            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>Inset border = affinity cluster</div>
            <div style={{ fontSize: 7, color: '#FFD700', marginTop: 4 }}>⚡ = legendary moment</div>
          </div>

          {/* Frame list */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 10, maxHeight: 200, overflowY: 'auto' }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>Frames</div>
            {frames.map((f, i) => {
              const hasLegendary = f.avatars.some((a) => a.isInLegendaryMoment);
              return (
                <div
                  key={i}
                  onClick={() => { setFrameIdx(i); setPlaying(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '4px 6px', borderRadius: 4, cursor: 'pointer',
                    background: i === frameIdx ? `${accentColor}22` : 'transparent',
                    marginBottom: 2,
                  }}
                >
                  {hasLegendary && <span style={{ fontSize: 9 }}>⚡</span>}
                  <span style={{ fontSize: 8, color: i === frameIdx ? accentColor : 'rgba(255,255,255,0.4)', fontWeight: i === frameIdx ? 900 : 400 }}>
                    {String(i + 1).padStart(2, '0')} {f.label}
                  </span>
                  <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
                    +{f.avatars.length}av
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '5px 10px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 5,
  color: 'rgba(255,255,255,0.6)',
  fontSize: 11,
  cursor: 'pointer',
  fontFamily: 'monospace',
};
