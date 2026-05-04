"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LobbyState } from '@/lib/lobby/LobbyStateEngine';
import { LobbyVideoPresenceEngine } from '@/lib/lobby/LobbyVideoPresenceEngine';
import { LobbySpeakingPopup } from './LobbySpeakingPopup';
import { useVoiceActivity } from '@/lib/audio/useVoiceActivity';
import { enforceAdultTeenContactBlock } from '@/lib/safety/AdultTeenContactBlocker';
import type { SafetyAgeClass } from '@/lib/safety/TeenMessagingPolicyEngine';
import {
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
  deriveMonitorSlots,
  type LobbyMonitorSlot,
} from '@/lib/lobby/LobbyFeedBus';

// B2: Accent per monitor source
const SOURCE_ACCENT: Record<LobbyMonitorSlot['source'], string> = {
  room:      '#00FFFF',
  stage:     '#9B2DFF',
  battle:    '#FF6600',
  cypher:    '#FF2DAA',
  performer: '#00CC44',
  sponsor:   '#FFD700',
};

const STATUS_DOT: Record<LobbyMonitorSlot['status'], string> = {
  LIVE:    '#f87171',
  NEXT:    '#fcd34d',
  STANDBY: '#c4b5fd',
};

export const LobbyVideoFeedBubble = ({
  state,
  userId = 'lobby-camera-user',
  isSpeaking,
  actorAgeClass = 'unknown',
  targetAgeClass = 'unknown',
}: {
  state: LobbyState;
  userId?: string;
  isSpeaking?: boolean;
  actorAgeClass?: SafetyAgeClass;
  targetAgeClass?: SafetyAgeClass;
}) => {
  const visibility = LobbyVideoPresenceEngine.getVisibility(state);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const speaking = typeof isSpeaking === 'boolean' ? isSpeaking : useVoiceActivity(userId);

  const decision = enforceAdultTeenContactBlock({
    source: 'lobby:video-feed',
    channel: 'video_presence',
    actor: { userId, ageClass: actorAgeClass, familyVerified: false, guardianApproved: false },
    target: { userId: 'lobby-video-audience', ageClass: targetAgeClass },
  });

  // B2: Subscribe to LobbyFeedBus — real monitor rotation
  const [feed, setFeed] = useState(() => getLobbyFeedSnapshot());
  const [monitorIdx, setMonitorIdx] = useState(0);

  useEffect(() => subscribeLobbyFeed(setFeed), []);

  useEffect(() => {
    const slots = deriveMonitorSlots(feed);
    if (slots.length < 2) return;
    const id = window.setInterval(() => {
      setMonitorIdx((i) => (i + 1) % slots.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, [feed]);

  if (!decision.allowed) {
    return (
      <div className="absolute top-24 left-6 z-40 rounded-xl border border-red-500/40 bg-red-950/70 px-3 py-2 text-[10px] font-semibold tracking-wide text-red-200">
        VIDEO BLOCKED: {decision.reason}
      </div>
    );
  }

  if (visibility === 'hidden') return null;

  const slots = deriveMonitorSlots(feed);
  const slot = slots[monitorIdx] ?? slots[0];
  const accent = slot ? SOURCE_ACCENT[slot.source] : '#c4b5fd';
  const dotColor = slot ? STATUS_DOT[slot.status] : '#c4b5fd';

  return (
    <div
      className={`absolute top-24 left-6 z-40 transition-all duration-500 origin-top-left ${
        visibility === 'minimized' ? 'scale-50 opacity-40 hover:opacity-100' : 'scale-100 opacity-100'
      }`}
    >
      <div
        style={{
          width: 136,
          borderRadius: 14,
          border: `2px solid ${speaking ? '#00FF88' : accent + '55'}`,
          background: 'rgba(3,2,11,0.93)',
          overflow: 'hidden',
          boxShadow: `0 10px 25px rgba(0,0,0,0.5), 0 0 12px ${accent}1a`,
        }}
      >
        {/* Monitor header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 8px',
            borderBottom: `1px solid ${accent}22`,
            background: `${accent}0a`,
          }}
        >
          <div
            style={{
              width: 5, height: 5, borderRadius: '50%',
              background: dotColor,
              boxShadow: `0 0 5px ${dotColor}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 7, fontWeight: 900, letterSpacing: '0.15em',
              color: accent, textTransform: 'uppercase',
              flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {slot?.label ?? '—'}
          </span>
          <span style={{ fontSize: 6, fontWeight: 700, color: dotColor, letterSpacing: '0.1em' }}>
            {slot?.status ?? '—'}
          </span>
        </div>

        {/* Monitor body — links to live route */}
        <Link href={slot?.route ?? '/lobbies'} style={{ display: 'block', textDecoration: 'none' }}>
          <div
            style={{
              minHeight: 84,
              padding: '10px 8px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: `linear-gradient(160deg, ${accent}0a, rgba(3,2,11,0.96))`,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11, fontWeight: 800, color: '#f3e9ff',
                  lineHeight: 1.2, marginBottom: 3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {slot?.title ?? '—'}
              </div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.38)', lineHeight: 1.3 }}>
                {slot?.subtitle ?? '—'}
              </div>
            </div>

            {/* Heat bar */}
            {slot && slot.heat > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 6, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Heat</span>
                  <span style={{ fontSize: 6, color: accent, fontWeight: 700 }}>{Math.round(slot.heat)}</span>
                </div>
                <div style={{ height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, slot.heat)}%`,
                      background: accent, borderRadius: 1,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Rotation dots */}
        <div
          style={{
            display: 'flex', gap: 3, justifyContent: 'center',
            padding: '4px 8px',
            borderTop: `1px solid ${accent}15`,
          }}
        >
          {slots.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === monitorIdx ? 12 : 4, height: 3, borderRadius: 2,
                background: i === monitorIdx ? accent : 'rgba(255,255,255,0.15)',
                transition: 'width 0.3s ease',
              }}
            />
          ))}
        </div>

        {speaking && <LobbySpeakingPopup />}
      </div>
    </div>
  );
};
