'use client';

import React from 'react';

export const TmiMagazineOrbitalUnderlay: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Deep-space nebula radial gradients */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 20% 30%, rgba(170,45,255,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 70%, rgba(0,255,255,0.08) 0%, transparent 55%),
          radial-gradient(ellipse 50% 60% at 50% 10%, rgba(255,45,170,0.07) 0%, transparent 50%),
          radial-gradient(ellipse 40% 30% at 10% 80%, rgba(255,215,0,0.06) 0%, transparent 45%)
        `,
      }} />

      {/* Large spinning orbital rings */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 'min(140vw, 1400px)', height: 'min(140vw, 1400px)',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        border: '1px solid rgba(0,255,255,0.1)',
        boxShadow: '0 0 80px rgba(0,255,255,0.03) inset',
        animation: 'underlaySpinCW 48s linear infinite',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 'min(110vw, 1100px)', height: 'min(110vw, 1100px)',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        border: '1px dashed rgba(255,45,170,0.08)',
        animation: 'underlaySpinCCW 34s linear infinite',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 'min(80vw, 800px)', height: 'min(80vw, 800px)',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        border: '1px solid rgba(255,215,0,0.07)',
        animation: 'underlaySpinCW 26s linear infinite',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 'min(55vw, 550px)', height: 'min(55vw, 550px)',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        border: '1px dashed rgba(170,45,255,0.1)',
        animation: 'underlaySpinCCW 18s linear infinite',
      }} />

      {/* Star field */}
      {Array.from({ length: 50 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: i % 7 === 0 ? 2 : 1,
          height: i % 7 === 0 ? 2 : 1,
          borderRadius: '50%',
          background: ['rgba(0,255,255,0.6)', 'rgba(255,45,170,0.5)', 'rgba(255,215,0,0.5)', 'rgba(255,255,255,0.4)', 'rgba(170,45,255,0.6)'][i % 5],
          left: `${(i * 13 + 7) % 100}%`,
          top: `${(i * 17 + 11) % 100}%`,
          boxShadow: i % 7 === 0 ? `0 0 4px ${['#00FFFF', '#FF2DAA', '#FFD700', '#fff', '#AA2DFF'][i % 5]}` : 'none',
        }} />
      ))}

      {/* Scrolling tabloid text — transparent bg, just text at low opacity */}
      <div style={{
        position: 'absolute',
        top: '12%',
        width: '200%',
        overflow: 'hidden',
        opacity: 0.12,
        transform: 'rotate(-3deg)',
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'flex',
          animation: 'underlayTicker 22s linear infinite',
          width: 'max-content',
          fontSize: 52,
          fontWeight: 900,
          color: '#FFD700',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          fontFamily: "'Impact', 'Arial Black', sans-serif",
        }}>
          {'WHO TOOK THE CROWN • BATTLE NIGHT • WHO\'S GOT THE BARS • CHALLENGE THE CROWN • '}
          {'WHO TOOK THE CROWN • BATTLE NIGHT • WHO\'S GOT THE BARS • CHALLENGE THE CROWN • '}
          {'WHO TOOK THE CROWN • BATTLE NIGHT • WHO\'S GOT THE BARS • CHALLENGE THE CROWN • '}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '8%',
        width: '200%',
        overflow: 'hidden',
        opacity: 0.07,
        transform: 'rotate(2deg)',
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'flex',
          animation: 'underlayTickerRev 28s linear infinite',
          width: 'max-content',
          fontSize: 38,
          fontWeight: 900,
          color: '#FF2DAA',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          fontFamily: "'Impact', 'Arial Black', sans-serif",
        }}>
          {'CYPHER ARENA OPEN • GENRE BATTLE • VOTE FOR THE CROWN • STREAM AND WIN • '}
          {'CYPHER ARENA OPEN • GENRE BATTLE • VOTE FOR THE CROWN • STREAM AND WIN • '}
          {'CYPHER ARENA OPEN • GENRE BATTLE • VOTE FOR THE CROWN • STREAM AND WIN • '}
        </div>
      </div>

      <style>{`
        @keyframes underlaySpinCW {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes underlaySpinCCW {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes underlayTicker {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes underlayTickerRev {
          from { transform: translateX(-33.333%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
