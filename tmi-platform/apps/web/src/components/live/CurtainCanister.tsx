'use client';

/**
 * CurtainCanister — stage curtain/backdrop control for events.
 *
 * Allows event owner or director to:
 * - DROP curtain (hide stage, prepare for next act)
 * - RISE curtain (reveal stage, dramatic reveal)
 * - Set curtain style (theater/fog/smoke/lights/digital)
 * - Trigger automatic curtain sequences
 *
 * Renders as a fixed overlay at the edge, can be minimized.
 * Part of the PreShowControlBooth cluster.
 */

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type CurtainState = 'raised' | 'lowered' | 'rising' | 'falling';
type CurtainStyle = 'theater' | 'fog' | 'smoke' | 'lights' | 'digital';

interface Props {
  onStateChange?: (state: CurtainState) => void;
  autoReturn?: boolean;
  style?: CurtainStyle;
}

const CURTAIN_STYLES: Record<CurtainStyle, { label: string; color: string; backdrop: string }> = {
  'theater': {
    label: 'Theater Red',
    color: '#AA0000',
    backdrop: 'radial-gradient(ellipse at center, #AA0000 0%, #660000 100%)',
  },
  'fog': {
    label: 'Fog',
    color: '#CCCCCC',
    backdrop: 'linear-gradient(180deg, rgba(200,200,200,0.9) 0%, rgba(100,100,100,0.9) 100%)',
  },
  'smoke': {
    label: 'Smoke',
    color: '#444444',
    backdrop: 'repeating-linear-gradient(45deg, #333 0px, #333 2px, #444 2px, #444 4px)',
  },
  'lights': {
    label: 'Stage Lights',
    color: '#FFD700',
    backdrop: 'radial-gradient(ellipse at center bottom, rgba(255,215,0,0.8) 0%, rgba(0,0,0,0.9) 100%)',
  },
  'digital': {
    label: 'Digital',
    color: '#00E5FF',
    backdrop: 'linear-gradient(135deg, #00E5FF 0%, #0a0614 100%)',
  },
};

export default function CurtainCanister({
  onStateChange,
  autoReturn = false,
  style: initialStyle = 'theater',
}: Props) {
  const [state, setState] = useState<CurtainState>('raised');
  const [selectedStyle, setSelectedStyle] = useState<CurtainStyle>(initialStyle);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [pending, setPending] = useState(false);

  const handleCurtainAction = useCallback((action: 'drop' | 'rise') => {
    setPending(true);
    const newState = action === 'drop' ? 'falling' : 'rising';
    setState(newState);
    onStateChange?.(newState);

    setTimeout(() => {
      const finalState = action === 'drop' ? 'lowered' : 'raised';
      setState(finalState);
      onStateChange?.(finalState);
      if (autoReturn && action === 'drop') {
        setTimeout(() => {
          setState('rising');
          setTimeout(() => {
            setState('raised');
            onStateChange?.('raised');
          }, 1200);
        }, 3000);
      }
      setPending(false);
    }, 1200);
  }, [autoReturn, onStateChange]);

  const isDown = state === 'lowered' || state === 'falling';
  const styleConfig = CURTAIN_STYLES[selectedStyle];

  return (
    <div style={{ padding: 12 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#FFD700', letterSpacing: '.15em' }}>
            STAGE CURTAIN
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDown ? '#FF4040' : '#00FF88' }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: isDown ? '#FF4040' : '#00FF88' }}>
              {state === 'falling' ? 'FALLING' : state === 'rising' ? 'RISING' : state.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Primary controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <button
          onClick={() => handleCurtainAction('drop')}
          disabled={pending || isDown}
          style={{
            padding: '10px 8px', borderRadius: 8,
            background: isDown ? 'rgba(255,255,255,0.03)' : 'rgba(170,0,0,0.15)',
            border: `1px solid ${isDown ? 'rgba(255,255,255,0.1)' : '#AA000044'}`,
            color: isDown ? 'rgba(255,255,255,0.4)' : '#FF4040',
            fontSize: 10, fontWeight: 900,
            cursor: pending || isDown ? 'not-allowed' : 'pointer',
            letterSpacing: '.04em',
            opacity: pending || isDown ? 0.5 : 1,
            transition: 'background 0.15s',
          }}
        >
          ⬇️ DROP
        </button>
        <button
          onClick={() => handleCurtainAction('rise')}
          disabled={pending || !isDown}
          style={{
            padding: '10px 8px', borderRadius: 8,
            background: !isDown ? 'rgba(255,255,255,0.03)' : 'rgba(0,255,136,0.15)',
            border: `1px solid ${!isDown ? 'rgba(255,255,255,0.1)' : '#00FF8844'}`,
            color: !isDown ? 'rgba(255,255,255,0.4)' : '#00FF88',
            fontSize: 10, fontWeight: 900,
            cursor: pending || !isDown ? 'not-allowed' : 'pointer',
            letterSpacing: '.04em',
            opacity: pending || !isDown ? 0.5 : 1,
            transition: 'background 0.15s',
          }}
        >
          ⬆️ RISE
        </button>
      </div>

      {/* Style selector */}
      <div style={{ marginBottom: 10 }}>
        <button
          onClick={() => setShowStylePicker(!showStylePicker)}
          style={{
            width: '100%', padding: '10px',
            background: `${styleConfig.color}14`,
            border: `1px solid ${styleConfig.color}44`,
            borderRadius: 8,
            color: styleConfig.color,
            fontSize: 10, fontWeight: 900,
            cursor: 'pointer',
            letterSpacing: '.04em',
          }}
        >
          🎨 {styleConfig.label}
        </button>
        <AnimatePresence>
          {showStylePicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: 6 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {Object.entries(CURTAIN_STYLES).map(([key, style]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedStyle(key as CurtainStyle);
                      setShowStylePicker(false);
                    }}
                    style={{
                      padding: '8px', borderRadius: 6,
                      background: selectedStyle === key ? `${style.color}22` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${selectedStyle === key ? style.color + '66' : 'rgba(255,255,255,0.12)'}`,
                      color: style.color,
                      fontSize: 9, fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Automation toggle */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={autoReturn}
            style={{ cursor: 'pointer', accentColor: '#FFD700' }}
          />
          Auto-rise after 3s
        </label>
      </div>
    </div>
  );
}
