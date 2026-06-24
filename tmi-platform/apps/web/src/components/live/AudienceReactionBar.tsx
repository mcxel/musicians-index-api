'use client';

/**
 * AudienceReactionBar — venue-level reaction buttons for live audience.
 *
 * Reactions:
 *  👏 Clap, 🔥 Fire, ❤️ Heart, 🌹 Rose, 😂 Laugh, 😮 Wow, 💃 Dance, 🙌 Cheer, 👋 Wave, 🎤 Encore
 *
 * Each reaction:
 * - Emits to RoomEnergyEngine for crowd energy aggregation
 * - Maps to AudienceEntity presence state
 * - Triggered from venue viewport (not seat controls)
 */

import { useState } from 'react';
import { ingestSignal, type CrowdSignal } from '@/lib/personality/CrowdReactionEngine';
import { emitAudienceReaction } from '@/lib/audience/tmiAudienceReactionEngine';
import { useAudiencePresence } from '@/components/live/AudiencePresenceProvider';

interface ReactionButton {
  emoji: string;
  label: string;
  reaction: CrowdSignal;
  color: string;
}

const REACTIONS: ReactionButton[] = [
  { emoji: '👏', label: 'Clap', reaction: 'cheer', color: '#00E5FF' },
  { emoji: '🔥', label: 'Fire', reaction: 'emoji-storm', color: '#FF6B35' },
  { emoji: '❤️', label: 'Heart', reaction: 'cheer', color: '#FF2DAA' },
  { emoji: '🌹', label: 'Rose', reaction: 'share', color: '#FFB6C1' },
  { emoji: '😂', label: 'Laugh', reaction: 'chat-surge', color: '#FFD700' },
  { emoji: '😮', label: 'Wow', reaction: 'vote', color: '#AA2DFF' },
  { emoji: '💃', label: 'Dance', reaction: 'emoji-storm', color: '#00FF88' },
  { emoji: '🙌', label: 'Cheer', reaction: 'cheer', color: '#FFE066' },
  { emoji: '👋', label: 'Wave', reaction: 'chat-surge', color: '#00E5FF' },
  { emoji: '🎤', label: 'Encore', reaction: 'tip', color: '#C0A0FF' },
];

export default function AudienceReactionBar({ roomId }: { roomId: string }) {
  const { entity } = useAudiencePresence();
  const [recent, setRecent] = useState<string | null>(null);

  const handleReaction = (reaction: ReactionButton) => {
    if (!entity) return;

    // Emit to CrowdReactionEngine for energy aggregation
    ingestSignal(roomId, reaction.reaction, 1);

    // Emit to audience reaction tracker
    emitAudienceReaction({
      roomId,
      fanId: entity.userId,
      reaction: reaction.label.toLowerCase() as any,
    });

    // Visual feedback
    setRecent(reaction.emoji);
    setTimeout(() => setRecent(null), 800);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px',
      background: 'rgba(5,3,16,0.92)',
      backdropFilter: 'blur(8px)',
      borderRadius: 12,
      border: '1px solid rgba(0,229,255,0.15)',
    }}>
      <span style={{
        fontSize: 8,
        fontWeight: 900,
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.15em',
        marginRight: 4,
      }}>
        REACTIONS
      </span>

      <div style={{ display: 'flex', gap: 6 }}>
        {REACTIONS.map(btn => (
          <button
            key={btn.label}
            onClick={() => handleReaction(btn)}
            disabled={!entity}
            title={btn.label}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40,
              background: recent === btn.emoji ? `${btn.color}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${recent === btn.emoji ? btn.color : 'rgba(255,255,255,0.12)'}`,
              borderRadius: '50%',
              fontSize: 18,
              cursor: entity ? 'pointer' : 'default',
              opacity: entity ? 1 : 0.5,
              transition: 'all 0.15s ease',
            }}
          >
            {btn.emoji}
          </button>
        ))}
      </div>

      {recent && (
        <div style={{
          marginLeft: 8,
          fontSize: 24,
          animation: 'popFloat 0.8s ease-out forwards',
        }}>
          {recent}
        </div>
      )}

      <style>{`
        @keyframes popFloat {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(1.2) translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
