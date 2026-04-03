"use client";
/**
 * CameraDirectorPanel Component
 *
 * HUD panel for controlling the Camera Director Engine in real-time.
 * Used on /world/camera-control and /admin/cameras.
 * Shows current mode, event fire buttons, follow-user input, auto-director toggle.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type CameraState,
  type CameraMode,
  type CameraEvent,
  type CameraDirectorConfig,
  defaultCameraState,
  defaultCameraConfig,
  setCameraMode,
  fireCameraEvent,
  followUser,
  followDJ,
  flyoverVenue,
  splitScreen,
  zoomCamera,
  autoDirectorTick,
  stopShake,
  cameraOnDrop,
  CAMERA_MODE_LABELS,
  CAMERA_EVENT_LABELS,
  saveCameraState,
} from '@/lib/camera/cameraDirectorEngine';

interface CameraDirectorPanelProps {
  roomId: string;
  bpm?: number;
  initialState?: CameraState;
  onStateChange?: (state: CameraState) => void;
  compact?: boolean;  // Small mode for HUD overlay
}

const MODE_COLORS: Record<CameraMode, string> = {
  STAGE:        '#00FFFF',
  CROWD:        '#FF2DAA',
  FLYOVER:      '#AA2DFF',
  SPOTLIGHT:    '#FFD700',
  FOLLOW_USER:  '#FF9500',
  FOLLOW_DJ:    '#00FF88',
  SELFIE:       '#0088FF',
  SPLIT_SCREEN: '#FF2200',
  WIDE:         '#AAAAFF',
  TOP_DOWN:     '#FF88AA',
  ORBIT:        '#88FFCC',
};

const EVENT_ICONS: Partial<Record<CameraEvent, string>> = {
  'beat-drop':   '💥',
  'tip':         '💸',
  'winner':      '🏆',
  'host-speak':  '🎤',
  'battle-start':'⚔️',
  'vip-entry':   '👑',
  'drop-reveal': '🎁',
  'crowd-jump':  '🙌',
  'song-change': '🎵',
};

const CAMERA_MODES: CameraMode[] = [
  'STAGE', 'CROWD', 'FLYOVER', 'SPOTLIGHT',
  'FOLLOW_DJ', 'SPLIT_SCREEN', 'WIDE', 'TOP_DOWN', 'ORBIT',
];

const QUICK_EVENTS: CameraEvent[] = [
  'beat-drop', 'tip', 'winner', 'host-speak',
  'battle-start', 'vip-entry', 'drop-reveal', 'crowd-jump',
];

export default function CameraDirectorPanel({
  roomId,
  bpm = 128,
  initialState,
  onStateChange,
  compact = false,
}: CameraDirectorPanelProps) {
  const [config] = useState<CameraDirectorConfig>(defaultCameraConfig(roomId, bpm));
  const [camState, setCamState] = useState<CameraState>(initialState ?? defaultCameraState());
  const [followInput, setFollowInput] = useState('');
  const [showFollowInput, setShowFollowInput] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  // Auto director tick
  useEffect(() => {
    if (!camState.autoDirector) return;
    const interval = setInterval(() => {
      setCamState(prev => {
        const next = autoDirectorTick(prev);
        onStateChange?.(next);
        return next;
      });
    }, config.rotationIntervalMs);
    return () => clearInterval(interval);
  }, [camState.autoDirector, config.rotationIntervalMs, onStateChange]);

  // Save state on change
  useEffect(() => {
    saveCameraState(roomId, camState);
  }, [roomId, camState]);

  const setMode = useCallback((mode: CameraMode) => {
    setCamState(prev => {
      const next = setCameraMode(prev, mode);
      onStateChange?.(next);
      return next;
    });
  }, [onStateChange]);

  const fireEvent = useCallback((event: CameraEvent) => {
    setCamState(prev => {
      const next = fireCameraEvent(prev, event);
      onStateChange?.(next);
      return next;
    });
    setLastEvent(CAMERA_EVENT_LABELS[event]);
    setTimeout(() => setLastEvent(null), 2000);
  }, [onStateChange]);

  const handleFollowUser = () => {
    if (!followInput.trim()) return;
    setCamState(prev => {
      const next = followUser(prev, followInput.trim());
      onStateChange?.(next);
      return next;
    });
    setShowFollowInput(false);
    setFollowInput('');
  };

  const handleDrop = () => {
    setCamState(prev => {
      const next = cameraOnDrop(prev);
      onStateChange?.(next);
      return next;
    });
    setLastEvent('BEAT DROP FIRED 💥');
    setTimeout(() => setLastEvent(null), 3000);
  };

  const toggleAutoDirector = () => {
    setCamState(prev => {
      const next = { ...prev, autoDirector: !prev.autoDirector };
      onStateChange?.(next);
      return next;
    });
  };

  const handleZoom = (delta: number) => {
    setCamState(prev => {
      const next = zoomCamera(prev, prev.zoom + delta);
      onStateChange?.(next);
      return next;
    });
  };

  const activeColor = MODE_COLORS[camState.mode] ?? '#00FFFF';

  if (compact) {
    return (
      <div style={{
        background: 'rgba(5,5,16,0.92)',
        border: `1px solid ${activeColor}44`,
        borderRadius: 8,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: `0 0 10px ${activeColor}33`,
      }}>
        <span style={{ fontSize: 11, color: '#888' }}>CAM</span>
        <span style={{ color: activeColor, fontWeight: 700, fontSize: 13 }}>
          {CAMERA_MODE_LABELS[camState.mode]}
        </span>
        <button
          onClick={handleDrop}
          style={{ background: '#FF2200', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}
        >
          DROP
        </button>
        <button
          onClick={toggleAutoDirector}
          style={{
            background: camState.autoDirector ? '#00FF8833' : '#FF220033',
            color: camState.autoDirector ? '#00FF88' : '#FF2200',
            border: `1px solid ${camState.autoDirector ? '#00FF88' : '#FF2200'}`,
            borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer',
          }}
        >
          AUTO {camState.autoDirector ? 'ON' : 'OFF'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0A0A18',
      border: `1px solid ${activeColor}44`,
      borderRadius: 12,
      padding: 20,
      boxShadow: `0 0 24px ${activeColor}22`,
      color: '#fff',
      fontFamily: 'monospace',
      maxWidth: 520,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: '#666', letterSpacing: 2 }}>CAMERA DIRECTOR</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: activeColor, letterSpacing: 2 }}>
            {CAMERA_MODE_LABELS[camState.mode]}
          </div>
          {camState.targetUserId && (
            <div style={{ fontSize: 11, color: '#888' }}>→ {camState.targetUserId}</div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#666' }}>BPM</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFD700' }}>{bpm}</div>
        </div>
      </div>

      {/* Zoom controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: '#666' }}>ZOOM</span>
        <button onClick={() => handleZoom(-0.1)} style={btnStyle('#444')}>−</button>
        <div style={{ flex: 1, background: '#1A1A2E', borderRadius: 4, height: 6, position: 'relative' }}>
          <div style={{ width: `${((camState.zoom - 0.5) / 2.5) * 100}%`, height: '100%', background: activeColor, borderRadius: 4 }} />
        </div>
        <button onClick={() => handleZoom(0.1)} style={btnStyle('#444')}>+</button>
        <span style={{ fontSize: 12, color: '#aaa', minWidth: 32 }}>{camState.zoom.toFixed(1)}×</span>
      </div>

      {/* Camera mode grid */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#666', marginBottom: 8, letterSpacing: 1 }}>CAMERA MODE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {CAMERA_MODES.map(mode => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode(mode)}
              style={{
                background: camState.mode === mode ? `${MODE_COLORS[mode]}22` : '#0D0D1A',
                border: `1px solid ${camState.mode === mode ? MODE_COLORS[mode] : '#333'}`,
                color: camState.mode === mode ? MODE_COLORS[mode] : '#888',
                borderRadius: 6,
                padding: '7px 6px',
                fontSize: 10,
                fontWeight: camState.mode === mode ? 700 : 400,
                cursor: 'pointer',
                letterSpacing: 0.5,
              }}
            >
              {CAMERA_MODE_LABELS[mode]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Follow user */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowFollowInput(v => !v)}
            style={btnStyleFull('#FF9500')}
          >
            👤 FOLLOW USER
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setCamState(prev => { const n = followDJ(prev); onStateChange?.(n); return n; }); }} style={btnStyleFull('#00FF88')}>
            🎛️ FOLLOW DJ
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setCamState(prev => { const n = flyoverVenue(prev); onStateChange?.(n); return n; }); }} style={btnStyleFull('#AA2DFF')}>
            🚁 FLYOVER
          </motion.button>
        </div>
        <AnimatePresence>
          {showFollowInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', marginTop: 6 }}
            >
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={followInput}
                  onChange={e => setFollowInput(e.target.value)}
                  placeholder="Username or user ID..."
                  style={{
                    flex: 1, background: '#111', border: '1px solid #444', color: '#fff',
                    borderRadius: 6, padding: '6px 10px', fontSize: 12,
                  }}
                />
                <button onClick={handleFollowUser} style={btnStyle('#FF9500')}>GO</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick events */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: '#666', marginBottom: 8, letterSpacing: 1 }}>FIRE EVENT</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
          {QUICK_EVENTS.map(event => (
            <motion.button
              key={event}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => fireEvent(event)}
              style={{
                background: '#0D0D1A', border: '1px solid #333',
                color: '#ccc', borderRadius: 6,
                padding: '7px 4px', fontSize: 10, cursor: 'pointer', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 2 }}>{EVENT_ICONS[event] ?? '🎬'}</div>
              {CAMERA_EVENT_LABELS[event]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Drop button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleDrop}
        style={{
          width: '100%', background: '#FF2200', border: 'none',
          color: '#fff', borderRadius: 8, padding: '12px',
          fontSize: 15, fontWeight: 900, cursor: 'pointer',
          letterSpacing: 2, marginBottom: 12,
          boxShadow: '0 0 20px #FF220066',
        }}
      >
        💥 FIRE BEAT DROP
      </motion.button>

      {/* Split screen + auto */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => { setCamState(prev => { const n = splitScreen(prev); onStateChange?.(n); return n; }); }}
          style={btnStyleFull('#FF2200')}
        >
          ⬛⬛ SPLIT SCREEN
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={toggleAutoDirector}
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 8, fontWeight: 700,
            fontSize: 12, cursor: 'pointer', border: 'none',
            background: camState.autoDirector ? '#00FF8833' : '#FF220033',
            color: camState.autoDirector ? '#00FF88' : '#FF2200',
            outline: `1px solid ${camState.autoDirector ? '#00FF88' : '#FF2200'}`,
          }}
        >
          AUTO DIRECTOR {camState.autoDirector ? '● ON' : '○ OFF'}
        </motion.button>
      </div>

      {/* Event flash */}
      <AnimatePresence>
        {lastEvent && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              textAlign: 'center', fontSize: 13, fontWeight: 700,
              color: activeColor, padding: '6px',
              background: `${activeColor}11`, borderRadius: 6,
            }}
          >
            ⚡ {lastEvent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock status */}
      {camState.lockedBy && (
        <div style={{ fontSize: 10, color: '#FF9500', textAlign: 'center', marginTop: 6 }}>
          🔒 LOCKED: {CAMERA_EVENT_LABELS[camState.lockedBy]}
        </div>
      )}
    </div>
  );
}

// ─── Style helpers ─────────────────────────────────────────────────────────

function btnStyle(color: string): React.CSSProperties {
  return {
    background: `${color}22`, border: `1px solid ${color}`,
    color, borderRadius: 6, padding: '5px 10px',
    fontSize: 12, cursor: 'pointer', fontWeight: 700,
  };
}

function btnStyleFull(color: string): React.CSSProperties {
  return {
    flex: 1, background: `${color}15`, border: `1px solid ${color}`,
    color, borderRadius: 8, padding: '9px 8px',
    fontSize: 11, cursor: 'pointer', fontWeight: 700,
  };
}
