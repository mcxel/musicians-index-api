/**
 * PrizeRevealControlPanel.tsx
 * Repo: apps/web/src/components/host/PrizeRevealControlPanel.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { useState } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';

interface Prize { id: string; name: string; placement: number; cashValue?: number; }
interface PrizeRevealControlPanelProps { prizes?: Prize[]; onReveal?: (prizeId: string, winner: string) => void; }

export function PrizeRevealControlPanel({ prizes = [], onReveal }: PrizeRevealControlPanelProps) {
  const [winnerInputs, setWinnerInputs] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const handleReveal = (prizeId: string) => {
    const winner = winnerInputs[prizeId]?.trim();
    if (!winner) return;
    onReveal?.(prizeId, winner);
    setRevealed(prev => new Set([...prev, prizeId]));
  };

  return (
    <div style={{ background: '#0a0d14', border: '1px solid rgba(255,215,0,.2)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Trophy size={16} color="#ffd700" />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#ffd700' }}>Prize Reveals</span>
      </div>
      {prizes.length === 0 ? (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>No prizes configured for this season.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {prizes.sort((a, b) => b.placement - a.placement).map(prize => (
            <div key={prize.id} style={{ padding: '12px 14px', background: revealed.has(prize.id) ? 'rgba(255,215,0,.05)' : 'rgba(255,255,255,.03)', border: `1px solid ${revealed.has(prize.id) ? 'rgba(255,215,0,.2)' : 'rgba(255,255,255,.06)'}`, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>#{prize.placement} — {prize.name}</span>
                {prize.cashValue && <span style={{ fontSize: 12, color: '#ffd700' }}>${prize.cashValue.toLocaleString()}</span>}
              </div>
              {!revealed.has(prize.id) ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={winnerInputs[prize.id] ?? ''} onChange={e => setWinnerInputs(prev => ({ ...prev, [prize.id]: e.target.value }))} placeholder="Winner name…" style={{ flex: 1, padding: '7px 10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, color: '#fff', fontSize: 12 }} />
                  <button onClick={() => handleReveal(prize.id)} disabled={!winnerInputs[prize.id]?.trim()} style={{ padding: '7px 14px', background: winnerInputs[prize.id]?.trim() ? '#ffd700' : 'rgba(255,255,255,.1)', border: 'none', borderRadius: 6, color: winnerInputs[prize.id]?.trim() ? '#000' : 'rgba(255,255,255,.3)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    Reveal
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#ffd700', fontWeight: 700 }}>✓ Revealed: {winnerInputs[prize.id]}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default PrizeRevealControlPanel;

// ─────────────────────────────────────────────────────────────────────────────
// FILE: apps/web/src/components/host/HostScriptPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState as useState2 } from 'react';
import { BookOpen, Send } from 'lucide-react';

const SCRIPT_TYPES = ['season_open','contestant_intro','sponsor_shoutout','prize_reveal','round_transition','winner_announce','crowd_hype','co_host_handoff','season_close'] as const;
type ScriptType = typeof SCRIPT_TYPES[number];

const SCRIPT_TEMPLATES: Record<ScriptType, string> = {
  season_open: "Welcome to {{seasonNumber}} of the Grand Platform Contest! I'm Ray Journey, your host for this incredible evening. We have {{artistCount}} amazing artists competing tonight. Let's get this show started!",
  contestant_intro: "Ladies and gentlemen, please welcome to the stage — {{artistName}}! Representing {{category}}, backed by {{sponsorCount}} incredible sponsors. Give them a hand!",
  sponsor_shoutout: "A massive thank you to our sponsor {{sponsorName}} for making tonight possible. {{sponsorName}} — supporting the next generation of music talent!",
  prize_reveal: "The {{placement}} place prize for this season is absolutely incredible — {{prizeName}}! And the winner is…",
  round_transition: "That wraps up {{roundName}}! What an incredible round. Coming up next — {{nextRound}}. Stay tuned, the competition heats up!",
  winner_announce: "The Grand Platform Contest {{seasonNumber}} winner is… {{artistName}}! What a performance. What a journey. Congratulations!",
  crowd_hype: "Come on everybody, let me hear you! Make some noise for our incredible artists! This is what music is all about!",
  co_host_handoff: "I'm going to hand it over to my co-host right now. Take it away!",
  season_close: "That's a wrap on Season {{seasonNumber}} of the Grand Platform Contest! Thank you to every artist, every sponsor, every fan. See you on August 8th!",
};

interface HostScriptPanelProps { artistName?: string; sponsorName?: string; seasonNumber?: string; onLoadToRay?: (script: string) => void; }

export function HostScriptPanel({ artistName = '{{artistName}}', sponsorName = '{{sponsorName}}', seasonNumber = '1', onLoadToRay }: HostScriptPanelProps) {
  const [selected, setSelected] = useState2<ScriptType>('season_open');

  const resolveScript = (template: string) =>
    template.replace('{{artistName}}', artistName).replace('{{sponsorName}}', sponsorName).replace('{{seasonNumber}}', `Season ${seasonNumber}`);

  return (
    <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <BookOpen size={16} color="#00e5ff" />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#00e5ff' }}>Host Script Library</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {SCRIPT_TYPES.map(t => (
          <button key={t} onClick={() => setSelected(t)} style={{ padding: '5px 10px', background: selected === t ? 'rgba(0,229,255,.1)' : 'rgba(255,255,255,.04)', border: `1px solid ${selected === t ? 'rgba(0,229,255,.3)' : 'rgba(255,255,255,.08)'}`, borderRadius: 8, color: selected === t ? '#00e5ff' : 'rgba(255,255,255,.5)', fontSize: 11, cursor: 'pointer' }}>
            {t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 13, color: 'rgba(255,255,255,.8)', lineHeight: 1.6 }}>
        {resolveScript(SCRIPT_TEMPLATES[selected])}
      </div>
      {onLoadToRay && (
        <button onClick={() => onLoadToRay(resolveScript(SCRIPT_TEMPLATES[selected]))} style={{ width: '100%', padding: '10px', background: 'rgba(0,229,255,.1)', border: '1px solid rgba(0,229,255,.3)', borderRadius: 8, color: '#00e5ff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Send size={14} /> Load → Ray Journey
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: apps/web/src/components/host/CoHostHandoffPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
interface CoHostHandoffPanelProps { currentHost?: string; coHost?: string; onHandoff?: (to: 'ray' | 'cohost') => void; }

export function CoHostHandoffPanel({ currentHost = 'Ray Journey', coHost = 'Co-Host', onHandoff }: CoHostHandoffPanelProps) {
  const [active, setActive] = useState2<'ray' | 'cohost'>('ray');
  const switchTo = (to: 'ray' | 'cohost') => { setActive(to); onHandoff?.(to); };

  return (
    <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Co-Host Handoff</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[{ key: 'ray', label: currentHost }, { key: 'cohost', label: coHost }].map(h => (
          <button key={h.key} onClick={() => switchTo(h.key as 'ray' | 'cohost')} style={{ padding: '14px', background: active === h.key ? 'rgba(0,229,255,.1)' : 'rgba(255,255,255,.03)', border: `2px solid ${active === h.key ? '#00e5ff' : 'rgba(255,255,255,.08)'}`, borderRadius: 10, color: active === h.key ? '#00e5ff' : 'rgba(255,255,255,.5)', fontWeight: active === h.key ? 700 : 400, fontSize: 13, cursor: 'pointer', textAlign: 'center' }}>
            {active === h.key ? '🎙 Live' : '⏸'}<br />
            <span style={{ fontSize: 12, marginTop: 4, display: 'block' }}>{h.label}</span>
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginTop: 10, textAlign: 'center' }}>
        Currently live: {active === 'ray' ? currentHost : coHost}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: apps/web/src/components/host/CrowdPromptPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
interface CrowdPromptPanelProps { onTrigger?: (prompt: string) => void; }

const CROWD_PROMPTS = ['Make some noise! 🔊', 'Give a round of applause 👏', 'Everybody stand up! 🎉', 'Let me hear you! 📣', 'Scream for your favorite! 🏆', 'Wave your hands! 🙌'];

export function CrowdPromptPanel({ onTrigger }: CrowdPromptPanelProps) {
  return (
    <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#ff6b1a', marginBottom: 12 }}>Crowd Prompts</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CROWD_PROMPTS.map(prompt => (
          <button key={prompt} onClick={() => onTrigger?.(prompt)} style={{ padding: '10px 14px', background: 'rgba(255,107,26,.06)', border: '1px solid rgba(255,107,26,.2)', borderRadius: 8, color: 'rgba(255,255,255,.8)', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: apps/web/src/components/host/HostSoundboardPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
const SOUND_CUES = [
  { id: 'fanfare', label: '🎺 Winner Fanfare', color: '#ffd700' },
  { id: 'drums', label: '🥁 Drum Roll', color: '#ff6b1a' },
  { id: 'stinger', label: '⚡ Winner Stinger', color: '#00e5ff' },
  { id: 'applause', label: '👏 Applause', color: '#00c853' },
  { id: 'chime', label: '🔔 Transition Chime', color: '#c0c0c0' },
  { id: 'transition', label: '🎵 Round Transition', color: '#9c27b0' },
];

interface HostSoundboardPanelProps { onPlay?: (soundId: string) => void; }

export function HostSoundboardPanel({ onPlay }: HostSoundboardPanelProps) {
  const [playing, setPlaying] = useState2<string | null>(null);
  const trigger = (id: string) => { setPlaying(id); onPlay?.(id); setTimeout(() => setPlaying(null), 2000); };

  return (
    <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Soundboard</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {SOUND_CUES.map(cue => (
          <button key={cue.id} onClick={() => trigger(cue.id)} style={{ padding: '12px 10px', background: playing === cue.id ? `${cue.color}22` : 'rgba(255,255,255,.03)', border: `1px solid ${playing === cue.id ? cue.color : 'rgba(255,255,255,.08)'}`, borderRadius: 8, color: playing === cue.id ? cue.color : 'rgba(255,255,255,.7)', fontSize: 12, cursor: 'pointer', textAlign: 'center', transition: 'all .2s' }}>
            {cue.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: apps/web/src/components/host/HostStageCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
interface HostStageCardProps { hostName?: string; isLive?: boolean; season?: string; onGoLive?: () => void; onEndShow?: () => void; }

export function HostStageCard({ hostName = 'Ray Journey', isLive = false, season = 'Season 1', onGoLive, onEndShow }: HostStageCardProps) {
  return (
    <div style={{ background: '#0a0d14', border: `1px solid ${isLive ? 'rgba(255,48,48,.4)' : 'rgba(255,255,255,.1)'}`, borderRadius: 12, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{hostName}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{season} Host</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: isLive ? 'rgba(255,48,48,.1)' : 'rgba(255,255,255,.05)', border: `1px solid ${isLive ? 'rgba(255,48,48,.3)' : 'rgba(255,255,255,.1)'}` }}>
          {isLive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3030' }} />}
          <span style={{ fontSize: 11, fontWeight: 700, color: isLive ? '#ff5252' : 'rgba(255,255,255,.4)' }}>
            {isLive ? 'LIVE' : 'STANDBY'}
          </span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {!isLive ? (
          <button onClick={onGoLive} style={{ gridColumn: '1/-1', padding: '12px', background: 'linear-gradient(135deg,#ff3030,#ff5252)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            🎙 Go Live
          </button>
        ) : (
          <button onClick={onEndShow} style={{ gridColumn: '1/-1', padding: '12px', background: 'rgba(255,48,48,.1)', border: '1px solid rgba(255,48,48,.3)', borderRadius: 8, color: '#ff5252', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            ⏹ End Show
          </button>
        )}
      </div>
    </div>
  );
}
