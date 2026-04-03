"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HostRole } from '@/lib/hosts/hostEngine';

interface HostAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
}

interface HostConsoleProps {
  hostName: string;
  hostRole: HostRole;
  roomId: string;
  actions?: HostAction[];
  onCue?: (cue: string) => void;
}

const DEFAULT_ACTIONS = (onCue: (c: string) => void): HostAction[] => [
  { id: 'start',    label: 'START SHOW',    icon: '▶',  color: '#00FF88', action: () => onCue('START') },
  { id: 'pause',    label: 'PAUSE',         icon: '⏸',  color: '#FFD700', action: () => onCue('PAUSE') },
  { id: 'next',     label: 'NEXT SEGMENT',  icon: '⏭',  color: '#00FFFF', action: () => onCue('NEXT') },
  { id: 'winner',   label: 'ANNOUNCE WINNER', icon: '🏆', color: '#FFD700', action: () => onCue('WINNER') },
  { id: 'crowd',    label: 'CROWD HYPE',    icon: '🔊', color: '#FF9500', action: () => onCue('CROWD_HYPE') },
  { id: 'light',    label: 'LIGHTS UP',     icon: '💡', color: '#FFFFFF', action: () => onCue('LIGHTS_UP') },
  { id: 'end',      label: 'END SHOW',      icon: '⏹',  color: '#FF2200', action: () => onCue('END') },
];

export default function HostConsole({ hostName, hostRole, roomId, actions, onCue }: HostConsoleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastCue, setLastCue] = useState('');

  const handleCue = (cue: string) => {
    setLastCue(cue);
    onCue?.(cue);
  };

  const displayActions = actions ?? DEFAULT_ACTIONS(handleCue);

  return (
    <div style={{
      position: 'relative',
      background: '#070718',
      border: '1px solid #FFFFFF22',
      borderRadius: 12,
      overflow: 'hidden',
      width: '100%', maxWidth: 340,
    }}>
      {/* Header toggle */}
      <motion.button
        whileHover={{ background: '#0A0A28' }}
        onClick={() => setIsOpen(o => !o)}
        style={{
          width: '100%', padding: '12px 16px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>🎙️</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 13 }}>{hostName}</div>
            <div style={{ color: '#888', fontSize: 10, letterSpacing: 1 }}>{hostRole} · {roomId}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {lastCue && (
            <span style={{ color: '#00FF88', fontSize: 10, background: '#001A08', padding: '2px 6px', borderRadius: 3 }}>
              {lastCue}
            </span>
          )}
          <span style={{ color: '#888', fontSize: 16 }}>{isOpen ? '▲' : '▼'}</span>
        </div>
      </motion.button>

      {/* Control panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #111',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
            }}>
              {displayActions.map(a => (
                <motion.button
                  key={a.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={a.action}
                  style={{
                    padding: '9px 10px',
                    background: `${a.color}15`,
                    border: `1px solid ${a.color}44`,
                    borderRadius: 7, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{a.icon}</span>
                  <span style={{ color: a.color, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>{a.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
