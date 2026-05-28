'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideProps } from 'lucide-react';
import { Radio, MonitorPlay, Zap, Settings, ShieldAlert, Wifi, WifiOff, Mic, MicOff, Volume2, VolumeX, Maximize, RotateCcw, Circle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreamNode {
  id: string;
  name: string;
  label: string;
  type: 'local-cam' | 'remote-guest' | 'hardware-kiosk';
  status: 'live' | 'standby' | 'offline';
  fps: number;
  resolution: string;
  bitrate: string;
  signal: number; // 0-4 bars
  bgGradient: string;
  accentColor: string;
}

// ─── Audio Meter ──────────────────────────────────────────────────────────────

function AudioMeter({ active, color }: { active: boolean; color: string }) {
  const [levels, setLevels] = useState([3, 5, 4, 6, 3, 7, 4, 5, 3, 4]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setLevels(prev => prev.map(() => Math.floor(Math.random() * 8) + 1));
    }, 120);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 14 }}>
      {levels.map((h, i) => (
        <div key={i} style={{
          width: 2.5, borderRadius: 1,
          height: active ? `${(h / 8) * 100}%` : '15%',
          background: active ? (h > 6 ? '#FF4444' : color) : 'rgba(255,255,255,0.15)',
          transition: 'height 0.1s ease',
          minHeight: 2,
        }} />
      ))}
    </div>
  );
}

// ─── Signal Bars ─────────────────────────────────────────────────────────────

function SignalBars({ strength }: { strength: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
      {[1, 2, 3, 4].map(n => (
        <div key={n} style={{
          width: 3, borderRadius: 1,
          height: n * 3 + 2,
          background: n <= strength ? '#00FF88' : 'rgba(255,255,255,0.12)',
        }} />
      ))}
    </div>
  );
}

// ─── Camera Tile ─────────────────────────────────────────────────────────────

function CameraTile({
  node, active, onSelect,
}: {
  node: StreamNode;
  active: boolean;
  onSelect: () => void;
}) {
  const isLive = node.status === 'live';
  const [muted, setMuted] = useState(false);

  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        border: `1.5px solid ${active ? node.accentColor : isLive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        background: '#000',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: active ? `0 0 0 1px ${node.accentColor}40, 0 4px 20px rgba(0,0,0,0.6)` : '0 2px 12px rgba(0,0,0,0.5)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Video area */}
      <div style={{ position: 'relative', aspectRatio: '16/9', background: node.bgGradient }}>
        {/* Film grain texture simulation */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '150px 150px',
        }} />

        {/* Offline state */}
        {node.status === 'offline' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(0,0,0,0.7)' }}>
            <WifiOff size={20} color="rgba(255,255,255,0.2)" />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em' }}>NO SIGNAL</span>
          </div>
        )}

        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

        {/* Top bar: status + connection */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isLive ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,32,32,0.85)', borderRadius: 3, padding: '2px 6px' }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                  style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
                <span style={{ fontSize: 8, fontWeight: 700, color: '#fff', letterSpacing: '0.08em' }}>LIVE</span>
              </div>
            ) : node.status === 'standby' ? (
              <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 3, padding: '2px 6px' }}>
                <span style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>STANDBY</span>
              </div>
            ) : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SignalBars strength={node.signal} />
          </div>
        </div>

        {/* Bottom: lower third */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 8px 6px', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 1, lineHeight: 1.2 }}>{node.label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>{node.name}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span style={{ fontSize: 8, fontFamily: 'monospace', color: node.accentColor, fontWeight: 600 }}>{node.fps}fps</span>
              <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>{node.resolution}</span>
            </div>
          </div>
        </div>

        {/* Active program overlay */}
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'absolute', inset: 0, border: `2px solid ${node.accentColor}`, borderRadius: 6, pointerEvents: 'none', boxShadow: `inset 0 0 20px ${node.accentColor}30` }}
          />
        )}
      </div>

      {/* Controls strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', background: '#0d0d1a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AudioMeter active={isLive && !muted} color={node.accentColor} />
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '2px 5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {muted ? <MicOff size={9} color="rgba(255,100,100,0.8)" /> : <Mic size={9} color="rgba(255,255,255,0.4)" />}
          </button>
          <button onClick={e => e.stopPropagation()}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '2px 5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Maximize size={9} color="rgba(255,255,255,0.4)" />
          </button>
        </div>
        <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>{node.bitrate}</span>
      </div>
    </motion.button>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────

function ActionBtn({ icon: Icon, label, color, onClick }: { icon: React.FC<LucideProps>; label: string; color: string; onClick?: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <motion.button
      onClick={() => { onClick?.(); setPressed(true); setTimeout(() => setPressed(false), 600); }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, width: 120, height: 80, borderRadius: 8,
        border: `1px solid ${pressed ? color + '80' : color + '25'}`,
        background: pressed ? `${color}18` : 'rgba(0,0,0,0.45)',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.15s',
      }}
    >
      <Icon size={20} color={pressed ? color : `${color}90`} />
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: pressed ? color : `${color}70`, textAlign: 'center', lineHeight: 1.3 }}>
        {label}
      </span>
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NODES: StreamNode[] = [
  {
    id: 'cam-1', name: 'DJ_BOOTH_PI_CAM', label: 'DJ Booth', type: 'hardware-kiosk', status: 'live', fps: 60, resolution: '1080p', bitrate: '8Mb/s', signal: 4,
    bgGradient: 'linear-gradient(135deg, #0a0015 0%, #1a0830 40%, #0d1535 100%)',
    accentColor: '#FF2DAA',
  },
  {
    id: 'cam-2', name: 'HOST_WEBRTC_MAC', label: 'Host Desk', type: 'local-cam', status: 'live', fps: 30, resolution: '1080p', bitrate: '4Mb/s', signal: 3,
    bgGradient: 'linear-gradient(135deg, #001520 0%, #003040 40%, #001a30 100%)',
    accentColor: '#00FFFF',
  },
  {
    id: 'cam-3', name: 'CROWD_NODE_A', label: 'Crowd View', type: 'remote-guest', status: 'standby', fps: 24, resolution: '720p', bitrate: '2Mb/s', signal: 2,
    bgGradient: 'linear-gradient(135deg, #0d1200 0%, #1a2000 40%, #0a1000 100%)',
    accentColor: '#00FF88',
  },
];

export default function BroadcasterStudioDesk() {
  const [programId, setProgramId] = useState<string>('cam-1');
  const [isLive, setIsLive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [dropFrame, setDropFrame] = useState(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!isLive) { setElapsed(0); return; }
    startRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      if (Math.random() < 0.02) setDropFrame(d => d + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isLive]);

  function fmt(s: number) {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  }

  function handleGoLive() {
    const next = !isLive;
    setIsLive(next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(next ? 'tmi:golive' : 'tmi:endbroadcast'));
    }
  }

  const programNode = NODES.find(n => n.id === programId) ?? NODES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#08080f', borderRadius: 12, overflow: 'hidden', fontFamily: 'inherit' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#0d0d1a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Radio size={16} color={isLive ? '#FF2020' : 'rgba(255,255,255,0.25)'} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>Broadcast Switcher</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              Program: <span style={{ color: programNode.accentColor }}>{programNode.label}</span>
              {isLive && <span style={{ color: 'rgba(255,255,255,0.3)' }}> · {fmt(elapsed)}</span>}
              {dropFrame > 0 && <span style={{ color: '#FF9500' }}> · {dropFrame} drops</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isLive && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,32,32,0.12)', border: '1px solid rgba(255,32,32,0.3)', borderRadius: 4, padding: '4px 10px' }}>
              <Circle size={8} color="#FF2020" fill="#FF2020" />
              <span style={{ fontSize: 10, color: '#FF2020', fontWeight: 700 }}>ON AIR</span>
            </motion.div>
          )}
          <button onClick={handleGoLive} style={{
            padding: '8px 20px', borderRadius: 6,
            border: `1px solid ${isLive ? 'rgba(255,32,32,0.5)' : 'rgba(0,255,136,0.4)'}`,
            background: isLive ? 'rgba(255,32,32,0.15)' : 'rgba(0,255,136,0.1)',
            color: isLive ? '#FF4444' : '#00FF88',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer',
          }}>
            {isLive ? 'END BROADCAST' : 'GO LIVE'}
          </button>
        </div>
      </div>

      {/* Program monitor + multi-cam grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12, padding: 12, flex: 1, minHeight: 0 }}>

        {/* Program monitor (large) */}
        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: programNode.bgGradient }}>
          {/* Grain */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
            backgroundSize: '120px 120px',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)' }} />

          {/* PROGRAM label */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, alignItems: 'center', zIndex: 10 }}>
            <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', borderRadius: 3, padding: '3px 8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>PROGRAM</span>
            </div>
            {isLive && (
              <div style={{ background: 'rgba(255,32,32,0.8)', borderRadius: 3, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                  style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>LIVE</span>
              </div>
            )}
          </div>

          {/* Lower third */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 16px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{programNode.label}</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{programNode.resolution} · {programNode.fps}fps · {programNode.bitrate}</span>
              <SignalBars strength={programNode.signal} />
            </div>
          </div>
        </div>

        {/* Preview cam stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>Sources</div>
          {NODES.map(node => (
            <CameraTile key={node.id} node={node} active={programId === node.id} onSelect={() => setProgramId(node.id)} />
          ))}
        </div>
      </div>

      {/* Action deck */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0a0a16' }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Broadcast Controls</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ActionBtn icon={MonitorPlay} label="Open Curtains" color="#AA2DFF" />
          <ActionBtn icon={Zap} label="Trigger Giveaway" color="#FFD700" />
          <ActionBtn icon={ShieldAlert} label="Panic Cut" color="#FF4444" />
          <ActionBtn icon={RotateCcw} label="Reset Scene" color="#00FFFF" />
          <div style={{ flex: 1 }} />
          <ActionBtn icon={Settings} label="Pipeline Setup" color="rgba(255,255,255,0.4)" />
        </div>
      </div>
    </div>
  );
}
