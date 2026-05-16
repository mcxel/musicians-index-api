'use client';

import { DailyParticipant } from '@daily-co/daily-js';

interface VideoTileProps {
  participant: DailyParticipant;
  isLocalParticipant: boolean;
  isActiveSpeaker?: boolean;
  isDiamond?: boolean;
}

export default function VideoTile({ participant, isLocalParticipant, isActiveSpeaker, isDiamond }: VideoTileProps) {
  const name = participant.user_name ?? (isLocalParticipant ? 'You' : 'Guest');
  const initial = name.charAt(0).toUpperCase();

  const borderColor = isDiamond
    ? '#FFD700'
    : isActiveSpeaker
    ? '#00FFFF'
    : 'rgba(255,255,255,0.12)';

  const glowStyle = isActiveSpeaker
    ? { boxShadow: `0 0 18px ${isDiamond ? '#FFD70066' : '#00FFFF66'}` }
    : {};

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#0d0820',
        border: `2px solid ${borderColor}`,
        aspectRatio: '16/9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.25s, box-shadow 0.25s',
        ...glowStyle,
      }}
    >
      {/* Fallback avatar when camera is off */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: isDiamond ? 'rgba(255,215,0,0.15)' : 'rgba(0,255,255,0.1)',
          border: `2px solid ${isDiamond ? '#FFD700' : '#00FFFF'}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 900, color: isDiamond ? '#FFD700' : '#00FFFF',
        }}>
          {initial}
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{name}</span>
      </div>

      {/* Active speaker pulse ring */}
      {isActiveSpeaker && (
        <div style={{
          position: 'absolute', inset: -2,
          borderRadius: 12,
          border: `2px solid ${isDiamond ? '#FFD700' : '#00FFFF'}`,
          animation: 'pulse 1.5s infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Diamond crown badge */}
      {isDiamond && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          fontSize: 14, lineHeight: 1,
        }}>
          👑
        </div>
      )}

      {/* Local label */}
      {isLocalParticipant && (
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
          background: 'rgba(0,0,0,0.6)', padding: '2px 7px', borderRadius: 4, color: 'rgba(255,255,255,0.5)',
        }}>
          YOU
        </div>
      )}
    </div>
  );
}
