"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';
import CrowdPulseLights from '@/components/lighting/CrowdPulseLights';
import BeamSweep from '@/components/lighting/BeamSweep';
import TipArtistBox from '@/components/commerce/TipArtistBox';

const DJ_NAME = 'DJ KRONOS';
const CURRENT_TRACK = 'World Stage Anthem (TMI Mix)';
const BPM = 128;

const MOCK_CROWD = [
  { id: '1', name: 'Nova_Kay', rank: 'artist', emote: '🔥', color: '#FF2DAA' },
  { id: '2', name: 'BlazeVox', rank: 'performer', emote: '🙌', color: '#AA2DFF' },
  { id: '3', name: 'Tennyson_Lit', rank: 'rising', emote: '💃', color: '#00FFFF' },
  { id: '4', name: 'SoulDrift', rank: 'regular', emote: '👑', color: '#FFD700' },
  { id: '5', name: 'Femi_Wave', rank: 'headliner', emote: '🎤', color: '#FF9500' },
  { id: '6', name: 'Cipher44', rank: 'legend', emote: '💯', color: '#FFD700' },
  { id: '7', name: 'Zuri_Storm', rank: 'newcomer', emote: '🌊', color: '#555' },
  { id: '8', name: 'Kofi_Rex', rank: 'artist', emote: '🔥', color: '#FF2DAA' },
];

const DANCE_ZONES = ['BOUNCE ZONE', 'CYPHER FLOOR', 'SLOW WAVE', 'SPIN AREA', 'FREESTYLE'];

export default function WorldDancePartyPage() {
  const router = useRouter();
  const [myDance, setMyDance] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);
  const [beatsActive, setBeatsActive] = useState(true);
  const [tick, setTick] = useState(0);

  // BPM pulse tick
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), (60 / BPM) * 1000);
    return () => clearInterval(interval);
  }, []);

  const crowdOnline = 384;

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', position: 'relative', overflow: 'hidden' }}>
          {/* Lighting overlays */}
          <BeamSweep active={beatsActive} color="#FF2DAA" count={4} speed={8} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1, pointerEvents: 'none' }}>
            <CrowdPulseLights active={beatsActive} baseColor="#AA2DFF" pulseColor="#FF2DAA" count={16} bpm={BPM} />
          </div>

          <div style={{ position: 'relative', zIndex: 2, padding: '20px 20px 120px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <motion.div
                animate={{ scale: tick % 2 === 0 ? 1.02 : 1 }}
                transition={{ duration: 0.1 }}
                style={{ fontSize: 11, letterSpacing: 4, color: '#FF2DAA', marginBottom: 4 }}
              >
                ● LIVE · {crowdOnline} ON THE FLOOR
              </motion.div>
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: 4, color: '#fff', margin: '0 0 4px' }}>
                WORLD DANCE PARTY
              </h1>
              <div style={{ color: '#AA2DFF', fontSize: 13, letterSpacing: 2 }}>
                {DJ_NAME} · {CURRENT_TRACK}
              </div>
              <div style={{ color: '#333', fontSize: 11, marginTop: 4 }}>{BPM} BPM</div>
            </div>

            {/* Controls bar */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setBeatsActive(b => !b)}
                style={{
                  padding: '7px 16px', background: beatsActive ? 'rgba(170,45,255,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${beatsActive ? '#AA2DFF' : '#222'}`,
                  borderRadius: 6, color: beatsActive ? '#AA2DFF' : '#555',
                  fontSize: 11, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                {beatsActive ? '🎛️ LIGHTS ON' : '🔦 LIGHTS OFF'}
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
                💸 TIP DJ
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/games/battle')}
                style={{
                  padding: '7px 16px', background: 'rgba(255,34,0,0.08)',
                  border: '1px solid rgba(255,34,0,0.3)',
                  borderRadius: 6, color: '#FF2200',
                  fontSize: 11, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                ⚔️ BATTLE
              </motion.button>
            </div>

            {/* Tip box */}
            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ maxWidth: 360, margin: '0 auto 24px', overflow: 'hidden' }}
                >
                  <TipArtistBox
                    artistName={DJ_NAME}
                    avatarEmoji="🎧"
                    onTip={amt => { console.log('tip', amt); setShowTip(false); }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dance zones */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: '#333', fontSize: 10, letterSpacing: 3, marginBottom: 10, textAlign: 'center' }}>
                PICK YOUR ZONE
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {DANCE_ZONES.map(zone => (
                  <motion.button
                    key={zone}
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setMyDance(zone)}
                    style={{
                      padding: '8px 16px',
                      background: myDance === zone ? 'rgba(255,45,170,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${myDance === zone ? '#FF2DAA' : '#222'}`,
                      borderRadius: 20, color: myDance === zone ? '#FF2DAA' : '#555',
                      fontSize: 11, letterSpacing: 2, cursor: 'pointer',
                    }}
                  >
                    {zone}
                  </motion.button>
                ))}
              </div>
              {myDance && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ color: '#FF2DAA', textAlign: 'center', fontSize: 12, marginTop: 10, letterSpacing: 2 }}
                >
                  🕺 You&apos;re in the {myDance}
                </motion.div>
              )}
            </div>

            {/* Crowd grid */}
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              <div style={{ color: '#222', fontSize: 10, letterSpacing: 3, marginBottom: 12, textAlign: 'center' }}>
                ON THE FLOOR NOW
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {MOCK_CROWD.map((person, i) => (
                  <motion.div
                    key={person.id}
                    animate={{ y: tick % 2 === i % 2 ? -3 : 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${person.color}33`,
                      borderRadius: 10, minWidth: 70,
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `${person.color}22`,
                      border: `2px solid ${person.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>
                      {person.emote}
                    </div>
                    <div style={{ color: person.color, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
                      {person.name}
                    </div>
                    <div style={{ color: '#333', fontSize: 8 }}>{person.rank}</div>
                  </motion.div>
                ))}
                {/* +N more */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 12px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid #1a1a1a', borderRadius: 10, minWidth: 70,
                }}>
                  <div style={{ color: '#333', fontSize: 13, fontWeight: 700 }}>+{crowdOnline - MOCK_CROWD.length}</div>
                  <div style={{ color: '#222', fontSize: 9 }}>more</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
