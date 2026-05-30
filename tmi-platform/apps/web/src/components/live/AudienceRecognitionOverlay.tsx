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

      // Skip bot IDs — real fans only
      if (fanId.startsWith('bot-') || fanId.startsWith('fb-')) continue;

      const momentum = getFanMomentum(performerId, fanId);
      const identity = momentum ? getFanIdentity(momentum) : null;
      const isVip = identity && identity.title !== 'REGULAR';

      const event: RecognitionEvent = {
        fanId,
        displayName: displayNames[fanId] ?? momentum?.displayName ?? fanId,
        // VIP fans get their earned glyph; regular fans get a warm star
        glyph: isVip ? identity!.glyph : '🎵',
        color: isVip ? identity!.color : '#AA2DFF',
        // Every fan — VIP or new — gets the welcome motto
        line: isVip
          ? `${getRecognitionLine(momentum!)} · We grow together. Thank you for joining.`
          : 'We grow together. Thank you for joining.',
        id: ++eventSeq,
      };

      setFlashes((prev) => [...prev.slice(-3), event]);
      setTimeout(() => {
        setFlashes((prev) => prev.filter((f) => f.id !== event.id));
      }, 6000);
    }
  }, [currentMemberIds, performerId, displayNames]);

  if (flashes.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 90,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 9000,
        pointerEvents: 'none',
        maxWidth: 320,
      }}
    >
      {flashes.map((flash) => (
        <div
          key={flash.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '12px 16px',
            background: `linear-gradient(135deg, rgba(5,5,16,0.97), ${flash.color}22)`,
            border: `1px solid ${flash.color}66`,
            borderLeft: `3px solid ${flash.color}`,
            borderRadius: 12,
            boxShadow: `0 4px 24px rgba(0,0,0,0.7), 0 0 16px ${flash.color}28`,
            animation: 'recognitionSlide 0.35s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>{flash.glyph}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: flash.color, marginBottom: 3, textTransform: 'uppercase' }}>
              WELCOME
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginBottom: 4, lineHeight: 1.2 }}>
              {flash.displayName}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              We grow together. Thank you for joining.
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes recognitionSlide {
          from { transform: translateX(50px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
