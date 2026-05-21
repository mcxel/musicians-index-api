/**
 * MysteryBoxReveal.tsx
 * Repo: apps/web/src/components/game/MysteryBoxReveal.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { useState } from 'react';
import { Gift, Lock } from 'lucide-react';

interface MysteryBoxRevealProps {
  label?: string;
  revealContent?: string;
  hostControlled?: boolean;
  onReveal?: () => void;
}

export function MysteryBoxReveal({ label = 'Mystery Prize', revealContent = 'A special surprise!', hostControlled = false, onReveal }: MysteryBoxRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleReveal = () => {
    if (hostControlled) { onReveal?.(); return; }
    setAnimating(true);
    setTimeout(() => { setRevealed(true); setAnimating(false); onReveal?.(); }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
      {/* Box */}
      <div
        onClick={!revealed && !hostControlled ? handleReveal : undefined}
        style={{
          width: 120, height: 120, borderRadius: 16,
          background: revealed ? 'rgba(255,215,0,.15)' : 'linear-gradient(135deg,#ff6b1a,#ff8c42)',
          border: `3px solid ${revealed ? '#ffd700' : 'rgba(255,255,255,.2)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: (!revealed && !hostControlled) ? 'pointer' : 'default',
          boxShadow: revealed ? '0 0 40px rgba(255,215,0,.4)' : animating ? '0 0 60px rgba(255,107,26,.8)' : '0 0 20px rgba(255,107,26,.3)',
          transition: 'all .4s',
          transform: animating ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
        }}
      >
        {revealed ? (
          <Gift size={40} color="#ffd700" />
        ) : (
          <>
            <Lock size={28} color="rgba(255,255,255,.8)" />
            <div style={{ fontSize: 24, marginTop: 4 }}>🎁</div>
          </>
        )}
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: revealed ? '#ffd700' : '#fff' }}>
          {revealed ? revealContent : label}
        </div>
        {!revealed && !hostControlled && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>Click to reveal</div>
        )}
        {!revealed && hostControlled && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 4 }}>Host will reveal this</div>
        )}
      </div>

      {!revealed && hostControlled && (
        <button onClick={handleReveal} style={{ marginTop: 14, padding: '8px 20px', background: 'rgba(255,107,26,.1)', border: '1px solid rgba(255,107,26,.3)', borderRadius: 8, color: '#ff6b1a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Trigger Reveal
        </button>
      )}
    </div>
  );
}
export default MysteryBoxReveal;
