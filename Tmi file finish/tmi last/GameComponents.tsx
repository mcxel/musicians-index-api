/**
 * GameComponents.tsx — SPLIT INTO INDIVIDUAL FILES BEFORE COMMITTING
 *
 *   MysteryBoxReveal   → apps/web/src/components/game/MysteryBoxReveal.tsx
 *   SoundClueTrigger   → apps/web/src/components/game/SoundClueTrigger.tsx
 *   AudienceGuessPanel → apps/web/src/components/game/AudienceGuessPanel.tsx
 */
'use client';
import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Send, ChevronRight, Zap } from 'lucide-react';

// ─── MysteryBoxReveal ─────────────────────────────────────────────────────────
interface MysteryBoxRevealProps {
  prize?: string;
  prizeType?: 'cash' | 'deal' | 'equipment' | 'tour' | 'recording' | 'brand_partnership';
  cashValue?: number;
  revealed?: boolean;
  onReveal?: () => void;
  hostControlled?: boolean;
}

const PRIZE_EMOJIS: Record<string, string> = { cash:'💰', deal:'🤝', equipment:'🎸', tour:'🚌', recording:'🎙️', brand_partnership:'⭐' };

export function MysteryBoxReveal({ prize, prizeType = 'cash', cashValue, revealed = false, onReveal, hostControlled = false }: MysteryBoxRevealProps) {
  const [open, setOpen] = useState(revealed);
  const [animating, setAnimating] = useState(false);

  const handle = () => {
    if (open || hostControlled) return;
    setAnimating(true);
    setTimeout(() => { setOpen(true); setAnimating(false); onReveal?.(); }, 600);
  };

  const emoji = PRIZE_EMOJIS[prizeType] || '🎁';

  return (
    <div style={{ textAlign:'center', padding:32 }}>
      <div onClick={handle} style={{
        width:140, height:140, margin:'0 auto 24px', cursor: hostControlled ? 'default' : open ? 'default' : 'pointer',
        position:'relative', transition:'transform .3s',
        transform: animating ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
        filter: open ? 'drop-shadow(0 0 30px rgba(255,215,0,.6))' : 'none',
      }}>
        {open ? (
          <div style={{ width:140, height:140, borderRadius:20, background:'linear-gradient(135deg,rgba(255,215,0,.2),rgba(255,107,26,.1))', border:'2px solid rgba(255,215,0,.6)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
            <span style={{ fontSize:48 }}>{emoji}</span>
            {cashValue && <span style={{ fontSize:14, fontWeight:800, color:'#ffd700' }}>${cashValue.toLocaleString()}</span>}
          </div>
        ) : (
          <div style={{ width:140, height:140, borderRadius:20, background:'linear-gradient(135deg,#1a1f2e,#0d1117)', border:'2px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:60 }}>
            🎁
          </div>
        )}
      </div>
      {open && prize ? (
        <div>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.4)', margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'.1em' }}>You won</p>
          <h3 style={{ fontSize:24, fontWeight:800, color:'#ffd700', margin:'0 0 8px' }}>{prize}</h3>
          {cashValue && <p style={{ fontSize:16, color:'rgba(255,255,255,.6)', margin:0 }}>Value: ${cashValue.toLocaleString()}</p>}
        </div>
      ) : !open ? (
        <div>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', margin:'0 0 16px' }}>
            {hostControlled ? 'Waiting for host to reveal…' : 'Click to reveal your prize!'}
          </p>
          {!hostControlled && (
            <button onClick={handle} disabled={animating} style={{ padding:'12px 28px', background:'linear-gradient(135deg,#ff6b1a,#ff8c42)', border:'none', borderRadius:10, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer' }}>
              {animating ? 'Opening…' : 'Reveal Prize 🎁'}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── SoundClueTrigger ─────────────────────────────────────────────────────────
interface SoundClue { id: string; label: string; duration: number; audioSrc?: string; }
interface SoundClueTriggerProps {
  clues?: SoundClue[];
  currentClueIndex?: number;
  onPlayClue?: (clueId: string) => void;
  onNextClue?: () => void;
  adminMode?: boolean;
}

export function SoundClueTrigger({ clues = [], currentClueIndex = 0, onPlayClue, onNextClue, adminMode = false }: SoundClueTriggerProps) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const playClue = (clue: SoundClue) => {
    setPlaying(clue.id); setProgress(0); onPlayClue?.(clue.id);
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(interval); setPlaying(null); return 0; } return p + (100 / clue.duration / 10); });
    }, 100);
  };

  const currentClue = clues[currentClueIndex];

  return (
    <div style={{ background:'#0d1117', border:'1px solid rgba(0,229,255,.2)', borderRadius:12, padding:24, color:'#fff' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:'#00e5ff', margin:0 }}>Sound Clue Trigger</h3>
        <button onClick={() => setMuted(!muted)} style={{ background:'transparent', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, color:'rgba(255,255,255,.5)', padding:8, cursor:'pointer' }}>
          {muted ? <VolumeX size={16}/> : <Volume2 size={16}/>}
        </button>
      </div>

      {currentClue && (
        <div style={{ background:'rgba(0,229,255,.06)', border:'1px solid rgba(0,229,255,.2)', borderRadius:10, padding:20, marginBottom:16 }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginBottom:8 }}>CLUE {currentClueIndex + 1} / {clues.length}</div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>{currentClue.label}</div>
          {playing === currentClue.id && (
            <div style={{ height:4, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden', marginBottom:16 }}>
              <div style={{ width:`${progress}%`, height:'100%', background:'#00e5ff', borderRadius:2, transition:'width .1s' }}/>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => playClue(currentClue)} disabled={!!playing} style={{ flex:1, padding:'10px', background: playing === currentClue.id ? 'rgba(0,229,255,.2)' : 'rgba(0,229,255,.1)', border:'1px solid rgba(0,229,255,.4)', borderRadius:8, color:'#00e5ff', fontWeight:700, fontSize:13, cursor: playing ? 'default' : 'pointer' }}>
              {playing === currentClue.id ? '▶ Playing…' : '▶ Play Clue'}
            </button>
            {adminMode && onNextClue && (
              <button onClick={onNextClue} style={{ padding:'10px 16px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, color:'rgba(255,255,255,.5)', cursor:'pointer' }}>
                Next <ChevronRight size={14}/>
              </button>
            )}
          </div>
        </div>
      )}

      {adminMode && clues.length > 1 && (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {clues.map((clue, i) => (
            <button key={clue.id} onClick={() => playClue(clue)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
              background: i === currentClueIndex ? 'rgba(0,229,255,.08)' : 'rgba(255,255,255,.03)',
              border: `1px solid ${i === currentClueIndex ? 'rgba(0,229,255,.3)' : 'rgba(255,255,255,.06)'}`,
              borderRadius:8, color: i === currentClueIndex ? '#00e5ff' : 'rgba(255,255,255,.5)',
              cursor:'pointer', fontSize:12, textAlign:'left'
            }}>
              <Volume2 size={13}/> {clue.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AudienceGuessPanel ───────────────────────────────────────────────────────
interface GuessOption { id: string; label: string; votes: number; correct?: boolean; }
interface AudienceGuessPanelProps {
  question: string;
  options?: GuessOption[];
  myGuessId?: string;
  revealed?: boolean;
  totalVoters?: number;
  onGuess?: (optionId: string) => Promise<void>;
}

export function AudienceGuessPanel({ question, options = [], myGuessId, revealed = false, totalVoters = 0, onGuess }: AudienceGuessPanelProps) {
  const [selected, setSelected] = useState(myGuessId);
  const [guessing, setGuessing] = useState(false);
  const total = options.reduce((a, o) => a + o.votes, 0) || 1;

  const handle = async (id: string) => {
    if (selected || guessing) return;
    setGuessing(true); setSelected(id);
    await onGuess?.(id);
    setGuessing(false);
  };

  return (
    <div style={{ background:'#0d1117', border:'1px solid rgba(255,107,26,.2)', borderRadius:12, padding:24, color:'#fff' }}>
      <div style={{ fontSize:12, fontWeight:700, letterSpacing:'.1em', color:'#ff6b1a', marginBottom:12, textTransform:'uppercase', display:'flex', alignItems:'center', gap:6 }}>
        <Zap size={13}/> Audience Guess
      </div>
      <h3 style={{ fontSize:18, fontWeight:700, margin:'0 0 20px', lineHeight:1.4 }}>{question}</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
        {options.map(opt => {
          const pct = Math.round((opt.votes / total) * 100);
          const isMine = selected === opt.id;
          const isCorrect = revealed && opt.correct;
          const borderColor = isCorrect ? '#00ff88' : isMine ? '#ff6b1a' : 'rgba(255,255,255,.07)';
          const bg = isCorrect ? 'rgba(0,255,136,.08)' : isMine ? 'rgba(255,107,26,.08)' : 'rgba(255,255,255,.03)';
          return (
            <button key={opt.id} onClick={() => handle(opt.id)} disabled={!!selected || revealed} style={{ padding:'12px 14px', background:bg, border:`1px solid ${borderColor}`, borderRadius:10, color:'#fff', cursor: selected||revealed ? 'default' : 'pointer', textAlign:'left', position:'relative', overflow:'hidden' }}>
              {revealed && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${pct}%`, background:`${isCorrect ? 'rgba(0,255,136' : 'rgba(255,107,26'}.08)`, transition:'width .5s' }}/>}
              <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:14, fontWeight: isMine||isCorrect ? 700 : 400 }}>
                  {isCorrect && '✓ '}{opt.label}{isMine && !isCorrect && ' ← You'}
                </span>
                {revealed && <span style={{ fontSize:13, fontWeight:700, color: isCorrect ? '#00ff88' : 'rgba(255,255,255,.5)' }}>{pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      {revealed && <p style={{ fontSize:12, color:'rgba(255,255,255,.4)', margin:0, textAlign:'center' }}>Results from {totalVoters.toLocaleString()} audience members</p>}
      {!revealed && !selected && <p style={{ fontSize:12, color:'rgba(255,255,255,.3)', margin:0, textAlign:'center' }}>Choose your answer!</p>}
    </div>
  );
}

export default MysteryBoxReveal;
