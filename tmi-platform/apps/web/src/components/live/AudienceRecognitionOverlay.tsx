'use client';

import { useEffect, useRef, useState } from 'react';
import { getFanMomentum } from '@/lib/fans/SuperFanMomentumEngine';
import { getFanIdentity, getRecognitionLine } from '@/lib/fans/FanLoyaltyProfile';

interface RecognitionEvent {
  fanId: string;
  displayName: string;
  glyph: string;
  color: string;
  line: string;
  id: number;
}

interface Props {
  performerId: string;
  /** Current audience member IDs from the snapshot */
  currentMemberIds: string[];
  /** Current audience member display names keyed by userId */
  displayNames: Record<string, string>;
}

let eventSeq = 0;

export default function AudienceRecognitionOverlay({ performerId, currentMemberIds, displayNames }: Props) {
  const [flashes, setFlashes] = useState<RecognitionEvent[]>([]);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const newIds = currentMemberIds.filter((id) => !seenIds.current.has(id));

    for (const fanId of newIds) {
      seenIds.current.add(fanId);

      const momentum = getFanMomentum(performerId, fanId);
      if (!momentum) continue;

      const identity = getFanIdentity(momentum);
      if (identity.title === 'REGULAR') continue;

      const event: RecognitionEvent = {
        fanId,
        displayName: displayNames[fanId] ?? momentum.displayName,
        glyph: identity.glyph,
        color: identity.color,
        line: getRecognitionLine(momentum),
        id: ++eventSeq,
      };

      setFlashes((prev) => [...prev.slice(-2), event]);
      setTimeout(() => {
        setFlashes((prev) => prev.filter((f) => f.id !== event.id));
      }, 5000);
    }
  }, [currentMemberIds, performerId, displayNames]);

  if (flashes.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 9000,
        pointerEvents: 'none',
      }}
    >
      {flashes.map((flash) => (
        <div
          key={flash.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            background: `linear-gradient(135deg, rgba(5,5,16,0.95), ${flash.color}18)`,
            border: `1px solid ${flash.color}55`,
            borderRadius: 12,
            boxShadow: `0 0 20px ${flash.color}30`,
            maxWidth: 300,
            animation: 'recognitionSlide 0.35s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <span style={{ fontSize: 22, flexShrink: 0 }}>{flash.glyph}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#fff', marginBottom: 2 }}>
              {flash.displayName}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: flash.color }}>
              {flash.line}
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes recognitionSlide {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
