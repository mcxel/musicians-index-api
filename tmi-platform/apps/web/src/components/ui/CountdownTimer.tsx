'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type CountdownTimerProps = {
  targetDate: Date | string | number;
  label?: string;
  accent?: string;
  onExpire?: () => void;
  showDays?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

function pad(n: number) { return String(Math.max(0, n)).padStart(2, '0'); }

export default function CountdownTimer({ targetDate, label, accent = '#FF2DAA', onExpire, showDays = true, size = 'md' }: CountdownTimerProps) {
  const target = new Date(targetDate).getTime();
  const [remaining, setRemaining] = useState(Math.max(0, target - Date.now()));
  const firedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      const r = Math.max(0, target - Date.now());
      setRemaining(r);
      if (r === 0 && !firedRef.current) { firedRef.current = true; onExpire?.(); }
    }, 1000);
    return () => clearInterval(t);
  }, [target, onExpire]);

  const days    = Math.floor(remaining / 86400000);
  const hours   = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const expired = remaining === 0;

  const unitSize = size === 'lg' ? 36 : size === 'md' ? 26 : 18;
  const labelSize = size === 'lg' ? 9 : 8;
  const boxPad = size === 'lg' ? '12px 16px' : size === 'md' ? '8px 12px' : '5px 8px';

  const units = [
    ...(showDays ? [{ value: days, label: 'DAYS' }] : []),
    { value: hours, label: 'HRS' },
    { value: minutes, label: 'MIN' },
    { value: seconds, label: 'SEC' },
  ];

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {label && <div style={{ fontSize: 10, letterSpacing: '0.25em', color: accent, fontWeight: 800 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {units.map((unit, i) => (
          <div key={unit.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ textAlign: 'center' }}>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={unit.value}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    padding: boxPad,
                    background: expired ? 'rgba(255,59,92,0.15)' : `${accent}18`,
                    border: `1px solid ${expired ? 'rgba(255,59,92,0.4)' : `${accent}40`}`,
                    borderRadius: 8,
                    fontSize: unitSize,
                    fontWeight: 900,
                    color: expired ? '#FF3B5C' : '#fff',
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: unitSize + 20,
                    textAlign: 'center',
                  }}
                >
                  {pad(unit.value)}
                </motion.div>
              </AnimatePresence>
              <div style={{ fontSize: labelSize, color: 'rgba(255,255,255,0.4)', marginTop: 3, letterSpacing: '0.1em' }}>{unit.label}</div>
            </div>
            {i < units.length - 1 && <span style={{ fontSize: unitSize * 0.8, color: accent, fontWeight: 900, marginBottom: 14, opacity: 0.7 }}>:</span>}
          </div>
        ))}
      </div>
      {expired && <div style={{ fontSize: 11, color: '#FF3B5C', fontWeight: 800 }}>EXPIRED</div>}
    </div>
  );
}
