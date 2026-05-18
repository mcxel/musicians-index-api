'use client';

import { useCallback, useRef, useState } from 'react';
import { SEASON_ONE_REWARDS, SEASON_ONE_META, type SeasonTrack, type SeasonOneReward } from '@/config/seasonOneRewards';

// Mock XP for demo — replace with real user session data
const DEMO_XP: Record<SeasonTrack, number> = { fan: 750, artist: 420 };

function playGuitarPluck(freq = 392) {
  try {
    const ctx = new AudioContext();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buf.getChannelData(0);
    // Karplus-Strong-inspired decay
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const biquad = ctx.createBiquadFilter();
    biquad.type = 'lowpass';
    biquad.frequency.value = freq * 3;
    src.buffer = buf;
    src.connect(biquad);
    biquad.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    src.start();
  } catch {
    // Audio blocked by browser policy
  }
}

type ClaimedSet = Set<string>;

function RewardCard({
  reward,
  xp,
  claimed,
  onClaim,
  accentColor,
}: {
  reward: SeasonOneReward;
  xp: number;
  claimed: boolean;
  onClaim: (id: string) => void;
  accentColor: string;
}) {
  const unlocked = xp >= reward.xpRequired;
  const pct = Math.min(100, Math.round((xp / reward.xpRequired) * 100));

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 14,
        border: `1px solid ${unlocked ? accentColor + '55' : 'rgba(255,255,255,0.08)'}`,
        background: unlocked ? `${accentColor}0C` : 'rgba(255,255,255,0.02)',
        padding: '16px 16px 14px',
        transition: 'border-color 0.3s',
        overflow: 'hidden',
      }}
    >
      {reward.isLimited && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          fontSize: 7, fontWeight: 900, letterSpacing: '0.1em',
          color: '#FFD700', background: 'rgba(255,215,0,0.12)',
          padding: '2px 6px', borderRadius: 4,
        }}>LIMITED</div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{
          fontSize: 24, lineHeight: 1,
          filter: unlocked ? 'none' : 'grayscale(1) opacity(0.4)',
        }}>{reward.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 12, fontWeight: 800, color: unlocked ? '#fff' : 'rgba(255,255,255,0.35)',
            letterSpacing: '0.02em', marginBottom: 3,
          }}>{reward.title}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
            {reward.description}
          </div>
          {reward.promotionCredits != null && reward.promotionCredits > 0 && (
            <div style={{ marginTop: 4, fontSize: 9, color: '#00FF88', fontWeight: 700 }}>
              +{reward.promotionCredits} promo credits
            </div>
          )}
        </div>
      </div>

      {/* XP progress */}
      {!unlocked && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: accentColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 3, textAlign: 'right' }}>
            {xp} / {reward.xpRequired} XP
          </div>
        </div>
      )}

      {unlocked && (
        <button
          onClick={() => !claimed && onClaim(reward.id)}
          disabled={claimed}
          style={{
            width: '100%', padding: '7px', fontSize: 9, fontWeight: 900,
            letterSpacing: '0.12em', borderRadius: 8, border: 'none', cursor: claimed ? 'default' : 'pointer',
            background: claimed ? 'rgba(0,255,136,0.12)' : accentColor,
            color: claimed ? '#00FF88' : '#050510',
            transition: 'all 0.2s',
          }}
        >
          {claimed ? '✓ CLAIMED' : 'CLAIM REWARD'}
        </button>
      )}
    </div>
  );
}

export default function TmiSeasonPassEngine({
  userPhotoUrl,
  userXpFan,
  userXpArtist,
}: {
  userPhotoUrl?: string;
  userXpFan?: number;
  userXpArtist?: number;
}) {
  const [activeTrack, setActiveTrack] = useState<SeasonTrack>('fan');
  const [claimed, setClaimed] = useState<ClaimedSet>(new Set());
  const audioTriggeredRef = useRef(false);

  const fanXp    = userXpFan    ?? DEMO_XP.fan;
  const artistXp = userXpArtist ?? DEMO_XP.artist;
  const xp       = activeTrack === 'fan' ? fanXp : artistXp;

  const handleClaim = useCallback((id: string) => {
    setClaimed((prev) => new Set([...prev, id]));
    playGuitarPluck(activeTrack === 'fan' ? 392 : 523);
  }, [activeTrack]);

  const rewards = SEASON_ONE_REWARDS.filter((r) => r.track === activeTrack);
  const { instrumentEmoji, primaryColor, accentColor, seasonName } = SEASON_ONE_META;
  const trackColor = activeTrack === 'fan' ? '#00FFFF' : '#FF2DAA';

  return (
    <section style={{
      minHeight: 480,
      borderRadius: 20,
      border: `1px solid ${trackColor}25`,
      overflow: 'hidden',
      background: '#060410',
      position: 'relative',
    }}>
      {/* User photo as blurred backdrop */}
      {userPhotoUrl && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${userPhotoUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(32px) brightness(0.15) saturate(1.4)',
          transform: 'scale(1.1)',
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>{instrumentEmoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: primaryColor, letterSpacing: '0.3em', fontWeight: 800 }}>
              TMI SEASON 1 · {seasonName.toUpperCase()}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '0.04em' }}>
              Season Pass Rewards
            </div>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>
            Apr 2026 – Mar 2027
          </div>
        </div>

        {/* Track selector */}
        <div style={{ padding: '12px 20px 0', display: 'flex', gap: 6 }}>
          {(['fan', 'artist'] as const).map((t) => {
            const tc = t === 'fan' ? '#00FFFF' : '#FF2DAA';
            return (
              <button key={t}
                onClick={() => setActiveTrack(t)}
                style={{
                  padding: '7px 18px', borderRadius: 8, border: `1px solid ${tc}${activeTrack === t ? '66' : '22'}`,
                  background: activeTrack === t ? `${tc}15` : 'transparent',
                  color: activeTrack === t ? tc : 'rgba(255,255,255,0.35)',
                  fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t === 'fan' ? '🎧 FAN' : '🎸 ARTIST'}
              </button>
            );
          })}
          <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: trackColor, alignSelf: 'center' }}>
            {xp.toLocaleString()} XP
          </div>
        </div>

        {/* Track description */}
        <div style={{ padding: '8px 20px 4px', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
          {activeTrack === 'fan'
            ? 'Fan cosmetics — avatar items, emotes & companion bots'
            : 'Artist career — promo pushes, HD streams & magazine features'}
        </div>

        {/* Reward grid */}
        <div style={{ padding: '12px 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {rewards.map((r) => (
            <RewardCard
              key={r.id}
              reward={r}
              xp={xp}
              claimed={claimed.has(r.id)}
              onClaim={handleClaim}
              accentColor={trackColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
