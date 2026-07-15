'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const SUBTITLES = [
  'SONG FOR SONG · WORK FOR WORK · VIDEO FOR VIDEO',
  'SUBMIT YOUR TRACK · GET JUDGED · WIN PRIZES',
  'ANY GENRE · ANY LEVEL · ALL TALENT WELCOME',
  'YOUTUBE · SPOTIFY · SOUNDCLOUD · OR GO LIVE',
  'THE ARENA IS OPEN · STEP UP RIGHT NOW',
];

type Variant = 'full' | 'mini' | 'strip' | 'orbit';

export default function ChallengeYourSongCTA({ variant = 'full' }: { variant?: Variant }) {
  const [subIdx, setSubIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setSubIdx(i => (i + 1) % SUBTITLES.length);
        setFading(false);
      }, 320);
    }, 3400);
    return () => clearInterval(id);
  }, []);

  if (variant === 'strip') {
    return (
      <Link href="/rooms/challenge-arena" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: 'linear-gradient(90deg, #FF2DAA 0%, #AA2DFF 50%, #FF2DAA 100%)',
          backgroundSize: '200% 100%',
          animation: 'tmiGradShift 4s ease infinite',
          padding: '9px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          flexWrap: 'wrap',
        }}>
          <style>{`@keyframes tmiGradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}`}</style>
          <span style={{ fontSize: 10, fontWeight: 900, fontFamily: "'Inter',sans-serif", color: '#fff', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            🎤 CHALLENGE YOUR SONG HERE
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "'Inter',sans-serif", color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            SONG FOR SONG · WORK FOR WORK
          </span>
          <span style={{ fontSize: 9, fontWeight: 900, fontFamily: "'Inter',sans-serif", color: '#FFD700', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
            START NOW →
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'mini') {
    return (
      <Link href="/rooms/challenge-arena" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          border: '2px solid #FF2DAA',
          background: 'linear-gradient(135deg, rgba(255,45,170,0.1), rgba(170,45,255,0.06))',
          padding: '12px 16px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 0 18px rgba(255,45,170,0.2)',
          transition: 'box-shadow 0.3s ease',
        }}>
          <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 18, color: '#FF2DAA', letterSpacing: '0.04em' }}>
            🎤 CHALLENGE YOUR SONG
          </div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', marginTop: 4, textTransform: 'uppercase' }}>
            SONG FOR SONG · VIDEO FOR VIDEO →
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'orbit') {
    return (
      <Link href="/rooms/challenge-arena" style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF2DAA, #AA2DFF)',
          padding: '10px 20px',
          clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)',
          boxShadow: '0 0 28px rgba(255,45,170,0.5)',
          textAlign: 'center',
          animation: 'tmiOrbitPulse 2.2s ease-in-out infinite',
        }}>
          <style>{`@keyframes tmiOrbitPulse{0%,100%{box-shadow:0 0 28px rgba(255,45,170,0.5)}50%{box-shadow:0 0 48px rgba(255,45,170,0.8),0 0 80px rgba(170,45,255,0.4)}}`}</style>
          <div style={{ fontFamily: "'Bebas Neue','Impact',sans-serif", fontSize: 'clamp(14px,2.5vw,20px)', color: '#fff', letterSpacing: '0.04em', textShadow: '1px 1px 0 rgba(0,0,0,0.4)' }}>
            🎤 CHALLENGE YOUR SONG
          </div>
        </div>
      </Link>
    );
  }

  // variant === 'full' — large animated hero CTA
  return (
    <div style={{ position: 'relative', textAlign: 'center', padding: '28px 20px' }}>
      <style>{`
        @keyframes tmiPulseRingA {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes tmiPulseRingB {
          0% { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes tmiSubFade {
          0%, 100% { opacity: 1; transform: translateY(0); }
          40%, 60% { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes tmiGradShift2 {
          0%,100%{ background-position: 0% 50%; }
          50%{ background-position: 100% 50%; }
        }
      `}</style>

      {/* Concentric pulse rings */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: '80%', height: '80%', transform: 'translate(-50%,-50%)', borderRadius: '50%', border: '2px solid rgba(255,45,170,0.35)', animation: 'tmiPulseRingA 2.4s ease-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: '90%', height: '90%', transform: 'translate(-50%,-50%)', borderRadius: '50%', border: '2px solid rgba(170,45,255,0.2)', animation: 'tmiPulseRingB 2.4s ease-out infinite 0.8s', pointerEvents: 'none' }} />

      <Link href="/rooms/challenge-arena" style={{ textDecoration: 'none', display: 'inline-block' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF2DAA, #AA2DFF, #FF2DAA)',
          backgroundSize: '200% 100%',
          animation: 'tmiGradShift2 3s ease infinite',
          padding: 'clamp(14px,2vw,20px) clamp(24px,4vw,48px)',
          clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)',
          boxShadow: '0 0 40px rgba(255,45,170,0.55), 0 0 80px rgba(170,45,255,0.3), 0 16px 32px rgba(0,0,0,0.5)',
          display: 'inline-block',
          transition: 'transform 0.2s ease',
        }}>
          <div style={{
            fontFamily: "'Bebas Neue','Impact',sans-serif",
            fontSize: 'clamp(22px,4vw,42px)',
            color: '#fff',
            letterSpacing: '0.04em',
            textShadow: '2px 2px 0 rgba(0,0,0,0.35)',
            whiteSpace: 'nowrap',
          }}>
            🎤 CHALLENGE YOUR SONG HERE
          </div>
        </div>
      </Link>

      <div style={{
        marginTop: 14,
        fontFamily: "'Inter',sans-serif",
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: '0.18em',
        color: '#FFD700',
        textTransform: 'uppercase',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'opacity 0.32s ease, transform 0.32s ease',
        minHeight: 20,
      }}>
        {SUBTITLES[subIdx]}
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['SONG', 'VIDEO', 'LIVE', 'BEAT'].map(t => (
          <Link key={t} href="/rooms/challenge-arena" style={{ textDecoration: 'none' }}>
            <div style={{ border: '1px solid rgba(255,45,170,0.4)', padding: '5px 14px', fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', background: 'rgba(255,45,170,0.06)' }}>
              {t}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
