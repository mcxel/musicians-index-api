"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';
import BeamSweep from '@/components/lighting/BeamSweep';
import TipArtistBox from '@/components/commerce/TipArtistBox';
import BuyBeatNowBox from '@/components/commerce/BuyBeatNowBox';

const ARTIST = {
  name: 'NOVA THE ARCHITECT',
  emoji: '🎤',
  genre: 'Afrofusion · Neo-Soul · Hip-Hop',
  setTime: '8:30PM - 10:00PM WAT',
  online: 892,
};

const SET_LIST = [
  { title: 'Intro Flames', duration: '3:12', status: 'played' },
  { title: 'Lagos Signal', duration: '4:08', status: 'playing' },
  { title: 'Zero Gravity', duration: '3:55', status: 'upcoming' },
  { title: 'Crown Protocol', duration: '5:20', status: 'upcoming' },
  { title: 'Neon Sky (w/ EchoVoice)', duration: '4:44', status: 'upcoming' },
  { title: 'Outro: The Return', duration: '2:48', status: 'upcoming' },
];

const BEAT_PRICES = [
  { label: 'MP3 Lease', price: 24.99, features: ['MP3 + tagged', '3 releases', '10K streams'] },
  { label: 'WAV Lease', price: 49.99, features: ['WAV untagged', '5 releases', '50K streams'] },
  { label: 'Exclusive', price: 299, features: ['WAV + stems', 'Full buyout', 'Unlimited'] },
];

export default function WorldConcertPage() {
  const router = useRouter();
  const [showTip, setShowTip] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', position: 'relative', overflow: 'hidden' }}>
          {/* Lighting */}
          <BeamSweep active={lightsOn} color="#FFD700" count={5} speed={6} />
          <BeamSweep active={lightsOn} color="#AA2DFF" count={3} speed={10} />

          <div style={{ position: 'relative', zIndex: 2, padding: '20px 20px 100px' }}>
            {/* Stage area */}
            <div style={{
              background: 'linear-gradient(180deg, #1a0a00 0%, #050510 70%)',
              border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: 16, padding: '28px 24px', marginBottom: 24, textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
                background: 'radial-gradient(ellipse at 50% 100%, rgba(255,215,0,0.15) 0%, transparent 70%)',
              }} />
              <div style={{ fontSize: 48, marginBottom: 12 }}>{ARTIST.emoji}</div>
              <div style={{ color: '#FFD700', fontSize: 20, fontWeight: 900, letterSpacing: 4, marginBottom: 4 }}>
                {ARTIST.name}
              </div>
              <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>{ARTIST.genre}</div>
              <div style={{ color: '#444', fontSize: 11 }}>{ARTIST.setTime}</div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ color: '#FF2DAA', fontSize: 11, letterSpacing: 3, marginTop: 8 }}
              >
                ● LIVE NOW · {ARTIST.online.toLocaleString()} WATCHING
              </motion.div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setLightsOn(l => !l)}
                style={{
                  padding: '7px 16px', background: lightsOn ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${lightsOn ? 'rgba(255,215,0,0.4)' : '#222'}`,
                  borderRadius: 6, color: lightsOn ? '#FFD700' : '#555',
                  fontSize: 11, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                🎆 {lightsOn ? 'LIGHTS ON' : 'LIGHTS OFF'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowTip(t => !t)}
                style={{
                  padding: '7px 16px', background: 'rgba(255,215,0,0.08)',
                  border: '1px solid rgba(255,215,0,0.3)',
                  borderRadius: 6, color: '#FFD700',
                  fontSize: 11, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                💸 TIP ARTIST
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowBuy(b => !b)}
                style={{
                  padding: '7px 16px', background: 'rgba(0,255,136,0.08)',
                  border: '1px solid rgba(0,255,136,0.3)',
                  borderRadius: 6, color: '#00FF88',
                  fontSize: 11, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                🎵 BUY BEAT
              </motion.button>
            </div>

            {/* Tip box */}
            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ maxWidth: 360, margin: '0 auto 20px', overflow: 'hidden' }}
                >
                  <TipArtistBox artistName={ARTIST.name} avatarEmoji={ARTIST.emoji} onTip={() => setShowTip(false)} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buy beat box */}
            <AnimatePresence>
              {showBuy && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ maxWidth: 480, margin: '0 auto 20px', overflow: 'hidden' }}
                >
                  <BuyBeatNowBox
                    beatTitle="Lagos Signal"
                    artist={ARTIST.name}
                    bpm={98}
                    beatKey="D Minor"
                    prices={BEAT_PRICES}
                    onPurchase={() => setShowBuy(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Set list */}
            <div style={{ maxWidth: 460, margin: '0 auto' }}>
              <div style={{ color: '#333', fontSize: 10, letterSpacing: 3, marginBottom: 12 }}>SET LIST</div>
              {SET_LIST.map((track, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', marginBottom: 6,
                  background: track.status === 'playing' ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${track.status === 'playing' ? 'rgba(255,215,0,0.3)' : '#111'}`,
                  borderRadius: 7,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      color: track.status === 'played' ? '#333' : track.status === 'playing' ? '#FFD700' : '#555',
                      fontSize: 10, width: 14,
                    }}>
                      {track.status === 'played' ? '✓' : track.status === 'playing' ? '▶' : `${i + 1}`}
                    </span>
                    <span style={{
                      color: track.status === 'played' ? '#333' : track.status === 'playing' ? '#FFD700' : '#777',
                      fontSize: 13,
                    }}>
                      {track.title}
                    </span>
                  </div>
                  <span style={{ color: '#333', fontSize: 11 }}>{track.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
