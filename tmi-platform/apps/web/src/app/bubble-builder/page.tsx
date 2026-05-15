"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';
import BubbleCharacterComp from '@/components/avatar/BubbleCharacter';
import type { BubbleCharacter } from '@/lib/avatar/bubbleEngine';
import type { DanceMove, EmoteType } from '@/lib/avatar/bubbleEngine';

const DANCE_MOVES: DanceMove[] = [
  'bounce','two-step','wave','snap','dab','bankroll','running-man','hit-dem-folks','wobble','moonwalk',
];
const EMOTE_TYPES: EmoteType[] = [
  'fire','clap','point-up','laugh','sunglasses','crown','mic-drop','money-rain','heart','skull',
];
const EMOTE_LABELS: Record<EmoteType, string> = {
  fire: '🔥', clap: '👏', 'point-up': '☝️', laugh: '😂', sunglasses: '😎',
  crown: '👑', 'mic-drop': '🎤', 'money-rain': '💸', heart: '❤️', skull: '💀',
};
const DANCE_LABELS: Record<DanceMove, string> = {
  bounce: '⬆️ Bounce', 'two-step': '👟 2-Step', wave: '🌊 Wave', snap: '👌 Snap',
  dab: '✊ Dab', bankroll: '💰 Bankroll', 'running-man': '🏃 Running Man',
  'hit-dem-folks': '🕺 Hit Dem Folks', wobble: '〰️ Wobble', moonwalk: '🌙 Moonwalk',
};

export default function BubbleBuilderPage() {
  const router = useRouter();
  const [bubble, setBubble] = useState<BubbleCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEmote, setActiveEmote] = useState<EmoteType | undefined>(undefined);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { loadBubble, generateBubble, loadAvatar, defaultAvatar } = await import('@/lib/avatar/bubbleEngine').then(b => b).catch(() => null) as any;
      try {
        const b = await loadBubble('me');
        setBubble(b);
      } catch {
        const { loadAvatar: la, defaultAvatar: da } = await import('@/lib/avatar/avatarEngine');
        const av = await la('me').catch(() => da('me'));
        const nb = await generateBubble(av, 'me', 0, true);
        setBubble(nb);
      }
      setLoading(false);
    }
    load();
  }, []);

  function setDance(move: DanceMove) {
    if (!bubble) return;
    setBubble({ ...bubble, currentDance: move, avatar: { ...bubble.avatar, animation: move === 'bounce' ? 'idle-bounce' : move === 'wobble' ? 'sway' : 'vibe' } });
  }

  function fireEmote(emote: EmoteType) {
    setActiveEmote(emote);
    if (bubble) setBubble({ ...bubble, activeEmote: emote });
    setTimeout(() => setActiveEmote(undefined), 2600);
  }

  async function handleSave() {
    if (!bubble) return;
    const { saveBubble } = await import('@/lib/avatar/bubbleEngine');
    await saveBubble(bubble);
    setSaved(true);
    setTimeout(() => router.push('/world'), 1400);
  }

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', padding: '24px 20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 28, fontWeight: 900, letterSpacing: 3, color: '#FF2DAA', margin: 0 }}
            >
              BUBBLE BUILDER
            </motion.h1>
            <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
              Choose your dance style, emotes, and identity vibe
            </p>
          </div>

          {loading && <p style={{ color: '#555', textAlign: 'center', marginTop: 60 }}>Loading bubble…</p>}

          {!loading && bubble && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', maxWidth: 900, margin: '0 auto' }}>
              {/* Preview */}
              <div style={{
                flex: '0 0 200px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 16,
              }}>
                <BubbleCharacterComp
                  bubble={{ ...bubble, activeEmote }}
                  size={140}
                  showNameTag
                  showRankBadge
                  showEmote
                  isActive
                />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#555', fontSize: 11, letterSpacing: 2 }}>LIVE PREVIEW</div>
                  <div style={{ color: '#333', fontSize: 11, marginTop: 4 }}>
                    Rank: <span style={{ color: '#FFD700' }}>{bubble.rankBadge.toUpperCase()}</span>
                  </div>
                  <div style={{ color: '#333', fontSize: 11 }}>
                    Lvl <span style={{ color: '#00FFFF' }}>{bubble.level}</span> · {bubble.points} pts
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div style={{ flex: 1, minWidth: 280 }}>
                {/* Dance moves */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ color: '#00FFFF', fontSize: 13, letterSpacing: 3, marginBottom: 12 }}>
                    DANCE MOVE
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {DANCE_MOVES.map(move => (
                      <motion.button
                        key={move}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDance(move)}
                        style={{
                          padding: '7px 14px',
                          background: bubble.currentDance === move ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${bubble.currentDance === move ? '#00FFFF' : '#222'}`,
                          borderRadius: 6, color: bubble.currentDance === move ? '#00FFFF' : '#666',
                          fontSize: 12, cursor: 'pointer', letterSpacing: 1,
                        }}
                      >
                        {DANCE_LABELS[move]}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Emotes */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ color: '#FF2DAA', fontSize: 13, letterSpacing: 3, marginBottom: 12 }}>
                    EMOTE LIBRARY — tap to preview
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {EMOTE_TYPES.map(emote => (
                      <motion.button
                        key={emote}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fireEmote(emote)}
                        style={{
                          width: 52, height: 52,
                          background: activeEmote === emote ? 'rgba(255,45,170,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${activeEmote === emote ? '#FF2DAA' : '#222'}`,
                          borderRadius: 8, fontSize: 22, cursor: 'pointer',
                        }}
                      >
                        {EMOTE_LABELS[emote]}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Rank info */}
                <div style={{
                  background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)',
                  borderRadius: 10, padding: 16, marginBottom: 24,
                }}>
                  <h3 style={{ color: '#FFD700', fontSize: 12, letterSpacing: 3, marginBottom: 8 }}>
                    RANK PROGRESSION
                  </h3>
                  {[
                    ['Newcomer', '0–49 pts', '#888'],
                    ['Regular', '50–249 pts', '#aaa'],
                    ['Rising', '250–999 pts', '#00FFFF'],
                    ['Performer', '1K–4.9K pts', '#AA2DFF'],
                    ['Artist', '5K–14.9K pts', '#FF2DAA'],
                    ['Headliner', '15K–49.9K pts', '#FF9500'],
                    ['Legend', '50K+ pts', '#FFD700'],
                  ].map(([rank, range, color]) => (
                    <div key={rank} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: color as string, fontSize: 12 }}>{rank}</span>
                      <span style={{ color: '#444', fontSize: 11 }}>{range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save */}
          {!loading && bubble && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', marginTop: 32 }}
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleSave}
                style={{
                  padding: '14px 52px',
                  background: saved ? '#00FF88' : 'linear-gradient(135deg,#FF2DAA,#AA2DFF)',
                  border: 'none', borderRadius: 10,
                  color: saved ? '#050510' : '#fff',
                  fontSize: 15, fontWeight: 800, letterSpacing: 3, cursor: 'pointer',
                }}
              >
                {saved ? '✓ SAVED — ENTERING WORLD' : 'SAVE BUBBLE & ENTER WORLD'}
              </motion.button>
            </motion.div>
          )}
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
