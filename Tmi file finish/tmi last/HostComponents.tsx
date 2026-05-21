/**
 * HostComponents.tsx — SPLIT INTO INDIVIDUAL FILES BEFORE COMMITTING
 *
 * Contains:
 *   SponsorCuePanel         → apps/web/src/components/host/SponsorCuePanel.tsx
 *   PrizeRevealControlPanel → apps/web/src/components/host/PrizeRevealControlPanel.tsx
 *   HostScriptPanel         → apps/web/src/components/host/HostScriptPanel.tsx
 *   CoHostHandoffPanel      → apps/web/src/components/host/CoHostHandoffPanel.tsx
 *   CrowdPromptPanel        → apps/web/src/components/host/CrowdPromptPanel.tsx
 *   HostSoundboardPanel     → apps/web/src/components/host/HostSoundboardPanel.tsx
 *   HostStageCard           → apps/web/src/components/host/HostStageCard.tsx
 */
'use client';
import { useState } from 'react';
import { Volume2, Play, Pause, Star, Trophy, Users, Mic, ChevronRight, Zap, Music } from 'lucide-react';

// ─── SponsorCuePanel ──────────────────────────────────────────────────────────
interface SponsorCuePanelProps {
  sponsors?: Array<{ id: string; name: string; tier: string; packageLabel: string }>;
  onTriggerShoutout?: (sponsorId: string, scriptText: string) => Promise<void>;
}

export function SponsorCuePanel({ sponsors = [], onTriggerShoutout }: SponsorCuePanelProps) {
  const [triggering, setTriggering] = useState<string | null>(null);
  const [triggered, setTriggered] = useState<string[]>([]);

  const handle = async (sponsor: typeof sponsors[0]) => {
    const script = `Huge shoutout to tonight's sponsor — ${sponsor.name}! Thank you for making this show possible!`;
    setTriggering(sponsor.id);
    await onTriggerShoutout?.(sponsor.id, script);
    setTriggered(prev => [...prev, sponsor.id]);
    setTriggering(null);
  };

  const tierColors: Record<string, string> = { bronze:'#cd7f32', silver:'#c0c0c0', gold:'#ffd700', title:'#00e5ff' };

  return (
    <div style={{ background:'#0a0d14', border:'1px solid rgba(255,215,0,.25)', borderRadius:12, padding:24, color:'#fff' }}>
      <h3 style={{ fontSize:16, fontWeight:700, color:'#ffd700', margin:'0 0 16px' }}>Sponsor Shoutout Cues</h3>
      {sponsors.length === 0 ? (
        <p style={{ color:'rgba(255,255,255,.3)', fontSize:13, textAlign:'center', padding:'20px 0' }}>No active sponsors loaded.</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {sponsors.map(s => {
            const done = triggered.includes(s.id);
            const color = tierColors[s.tier] || '#ffd700';
            return (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(255,255,255,.03)', border:`1px solid ${color}22`, borderRadius:10 }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:14, fontWeight:600 }}>{s.name}</span>
                  <span style={{ fontSize:11, color:`${color}88`, marginLeft:8 }}>{s.packageLabel}</span>
                </div>
                <button onClick={() => handle(s)} disabled={!!triggering || done} style={{
                  padding:'7px 14px', background: done ? 'rgba(0,200,83,.1)' : `${color}18`,
                  border: `1px solid ${done ? 'rgba(0,200,83,.4)' : `${color}44`}`,
                  borderRadius:8, color: done ? '#00c853' : color,
                  fontSize:12, fontWeight:700, cursor: done ? 'default' : 'pointer'
                }}>
                  {done ? '✓ Fired' : triggering === s.id ? 'Firing…' : `Fire Cue`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PrizeRevealControlPanel ──────────────────────────────────────────────────
interface PrizeRevealControlPanelProps {
  prizes?: Array<{ id: string; name: string; prizeType: string; cashValue?: number; placement: number }>;
  winnerName?: string;
  onReveal?: (prizeId: string, winnerName: string) => Promise<void>;
}

export function PrizeRevealControlPanel({ prizes = [], winnerName = '', onReveal }: PrizeRevealControlPanelProps) {
  const [localWinner, setLocalWinner] = useState(winnerName);
  const [revealing, setRevealing] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);

  const handle = async (prizeId: string) => {
    setRevealing(prizeId);
    await onReveal?.(prizeId, localWinner);
    setRevealed(prev => [...prev, prizeId]);
    setRevealing(null);
  };

  return (
    <div style={{ background:'#0a0d14', border:'1px solid rgba(255,0,255,.25)', borderRadius:12, padding:24, color:'#fff' }}>
      <h3 style={{ fontSize:16, fontWeight:700, color:'#ff00ff', margin:'0 0 16px' }}>Prize Reveal Control</h3>
      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.4)', letterSpacing:'.08em', display:'block', marginBottom:8 }}>WINNER NAME</label>
        <input value={localWinner} onChange={e => setLocalWinner(e.target.value)} placeholder="Enter winner name before reveal…"
          style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, color:'#fff', fontSize:14, boxSizing:'border-box' }} />
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {prizes.sort((a,b) => a.placement-b.placement).map(prize => {
          const done = revealed.includes(prize.id);
          return (
            <div key={prize.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(255,255,255,.03)', border:`1px solid rgba(255,0,255,${done?.2:.1})`, borderRadius:10 }}>
              <Trophy size={16} color={done ? '#ffd700' : 'rgba(255,255,255,.3)'} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{prize.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>
                  #{prize.placement} Place · {prize.prizeType}{prize.cashValue ? ` · $${prize.cashValue.toLocaleString()}` : ''}
                </div>
              </div>
              <button onClick={() => handle(prize.id)} disabled={!!revealing || done || !localWinner} style={{
                padding:'7px 14px', background: done ? 'rgba(255,215,0,.1)' : 'rgba(255,0,255,.15)',
                border: `1px solid ${done ? 'rgba(255,215,0,.4)' : 'rgba(255,0,255,.4)'}`,
                borderRadius:8, color: done ? '#ffd700' : '#ff00ff', fontSize:12, fontWeight:700,
                cursor: (done || !localWinner) ? 'default' : 'pointer', opacity: !localWinner ? .5 : 1
              }}>
                {done ? '✓ Revealed' : revealing === prize.id ? 'Revealing…' : '🎁 Reveal'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HostScriptPanel ──────────────────────────────────────────────────────────
const SCRIPT_LIBRARY = [
  { id:'open', type:'season_open', label:'Season Open', text:'Welcome to the BIGGEST show on The Musician\'s Index — the BerntoutGlobal Grand Platform Contest! I\'m Ray Journey. Let\'s get this STARTED!' },
  { id:'intro1', type:'contestant_intro', label:'Contestant Intro A', text:'Ladies and gentlemen — give it up for {{artistName}}! This {{category}} is ready to blow the roof off!' },
  { id:'intro2', type:'contestant_intro', label:'Contestant Intro B', text:'Please welcome to the Grand Stage… {{artistName}}! Show us what you\'ve got!' },
  { id:'hype1', type:'crowd_hype', label:'Crowd Hype A', text:'I need EVERYONE to make some noise right now! Show our artists what you came here for!' },
  { id:'hype2', type:'crowd_hype', label:'Crowd Hype B', text:'Is this the best crowd we\'ve ever had?! I think YES! Let me HEAR YOU!' },
  { id:'trans', type:'round_transition', label:'Round Transition', text:'That was INCREDIBLE! We\'re moving into {{roundName}} — stay locked in, this just keeps getting better!' },
  { id:'close', type:'season_close', label:'Season Close', text:'That\'s a wrap on the BerntoutGlobal Grand Platform Contest! Thank you to every artist, sponsor, and fan. I\'m Ray Journey — good night!' },
];

interface HostScriptPanelProps {
  onLoadScript?: (script: typeof SCRIPT_LIBRARY[0]) => void;
  artistName?: string; category?: string; roundName?: string;
}

export function HostScriptPanel({ onLoadScript, artistName, category, roundName }: HostScriptPanelProps) {
  const [activeType, setActiveType] = useState('all');
  const types = ['all', ...Array.from(new Set(SCRIPT_LIBRARY.map(s => s.type)))];
  const shown = activeType === 'all' ? SCRIPT_LIBRARY : SCRIPT_LIBRARY.filter(s => s.type === activeType);

  function resolve(text: string) {
    return text
      .replace(/{{artistName}}/g, artistName || '[Artist]')
      .replace(/{{category}}/g, category || '[Category]')
      .replace(/{{roundName}}/g, roundName || '[Round]');
  }

  return (
    <div style={{ background:'#0a0d14', border:'1px solid rgba(0,229,255,.2)', borderRadius:12, padding:24, color:'#fff' }}>
      <h3 style={{ fontSize:16, fontWeight:700, color:'#00e5ff', margin:'0 0 16px' }}>Script Library</h3>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
        {types.map(t => (
          <button key={t} onClick={() => setActiveType(t)} style={{ padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:600, background: activeType === t ? 'rgba(0,229,255,.15)' : 'rgba(255,255,255,.04)', border: activeType === t ? '1px solid rgba(0,229,255,.4)' : '1px solid rgba(255,255,255,.08)', color: activeType === t ? '#00e5ff' : 'rgba(255,255,255,.4)', cursor:'pointer', textTransform:'capitalize' }}>
            {t.replace(/_/g,' ')}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {shown.map(script => (
          <div key={script.id} style={{ padding:'12px 14px', background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:600 }}>{script.label}</span>
              <button onClick={() => onLoadScript?.(script)} style={{ padding:'5px 12px', background:'rgba(0,229,255,.1)', border:'1px solid rgba(0,229,255,.3)', borderRadius:6, color:'#00e5ff', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                Load → Ray
              </button>
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', margin:0, lineHeight:1.5, fontStyle:'italic' }}>{resolve(script.text)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CoHostHandoffPanel ───────────────────────────────────────────────────────
interface CoHostHandoffPanelProps {
  coHostName?: string;
  onHandoff?: (toCoHost: boolean, note: string) => void;
}

export function CoHostHandoffPanel({ coHostName = 'Co-Host', onHandoff }: CoHostHandoffPanelProps) {
  const [note, setNote] = useState('');
  const [active, setActive] = useState<'ray' | 'cohost'>('ray');
  return (
    <div style={{ background:'#0a0d14', border:'1px solid rgba(255,107,26,.2)', borderRadius:12, padding:24, color:'#fff' }}>
      <h3 style={{ fontSize:16, fontWeight:700, color:'#ff6b1a', margin:'0 0 16px' }}>Co-Host Handoff</h3>
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        {(['ray','cohost'] as const).map(h => (
          <button key={h} onClick={() => setActive(h)} style={{ flex:1, padding:'12px', background: active === h ? 'rgba(255,107,26,.15)' : 'rgba(255,255,255,.04)', border: active === h ? '1px solid rgba(255,107,26,.5)' : '1px solid rgba(255,255,255,.08)', borderRadius:10, color: active === h ? '#ff6b1a' : 'rgba(255,255,255,.5)', fontWeight:700, fontSize:13, cursor:'pointer' }}>
            {h === 'ray' ? '🎤 Ray Journey' : `🎤 ${coHostName}`}
            {active === h && <div style={{ fontSize:10, marginTop:4, color:'rgba(255,107,26,.8)' }}>ACTIVE</div>}
          </button>
        ))}
      </div>
      <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Handoff note or cue…" rows={3}
        style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, color:'#fff', fontSize:13, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit', marginBottom:12 }} />
      <button onClick={() => onHandoff?.(active === 'cohost', note)} style={{ width:'100%', padding:'11px', background:'linear-gradient(135deg,#ff6b1a,#ff8c42)', border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
        Hand Off to {active === 'ray' ? 'Ray Journey' : coHostName}
      </button>
    </div>
  );
}

// ─── CrowdPromptPanel ─────────────────────────────────────────────────────────
const CROWD_PROMPTS = ['Make some noise!','Put your hands up!','Show some love!','Can I get a cheer?!','Let me hear you scream!','Who\'s ready for this?!'];

interface CrowdPromptPanelProps { onTrigger?: (prompt: string) => void; }

export function CrowdPromptPanel({ onTrigger }: CrowdPromptPanelProps) {
  const [active, setActive] = useState<string | null>(null);
  const handle = (p: string) => { setActive(p); onTrigger?.(p); setTimeout(() => setActive(null), 2000); };
  return (
    <div style={{ background:'#0a0d14', border:'1px solid rgba(0,255,136,.2)', borderRadius:12, padding:24, color:'#fff' }}>
      <h3 style={{ fontSize:16, fontWeight:700, color:'#00ff88', margin:'0 0 16px' }}>Crowd Prompts</h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {CROWD_PROMPTS.map(p => (
          <button key={p} onClick={() => handle(p)} style={{
            padding:'12px', background: active === p ? 'rgba(0,255,136,.2)' : 'rgba(255,255,255,.04)',
            border: active === p ? '1px solid rgba(0,255,136,.6)' : '1px solid rgba(255,255,255,.08)',
            borderRadius:10, color: active === p ? '#00ff88' : 'rgba(255,255,255,.7)',
            fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .2s', textAlign:'center'
          }}>
            {active === p ? '🔊 ' : ''}{p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── HostSoundboardPanel ──────────────────────────────────────────────────────
const SOUNDS = [
  { id:'fanfare', label:'Walk-On Fanfare', emoji:'🎺', color:'#ff6b1a' },
  { id:'reveal', label:'Prize Reveal Drum', emoji:'🥁', color:'#ff00ff' },
  { id:'winner', label:'Winner Stinger', emoji:'🏆', color:'#ffd700' },
  { id:'applause', label:'Crowd Applause', emoji:'👏', color:'#00ff88' },
  { id:'chime', label:'Sponsor Chime', emoji:'🔔', color:'#00e5ff' },
  { id:'transition', label:'Round Transition', emoji:'⚡', color:'#ff6b1a' },
];

interface HostSoundboardPanelProps { onPlaySound?: (soundId: string) => void; }

export function HostSoundboardPanel({ onPlaySound }: HostSoundboardPanelProps) {
  const [playing, setPlaying] = useState<string | null>(null);
  const handle = (id: string) => {
    setPlaying(id); onPlaySound?.(id);
    setTimeout(() => setPlaying(null), 2000);
  };
  return (
    <div style={{ background:'#0a0d14', border:'1px solid rgba(255,255,255,.1)', borderRadius:12, padding:24, color:'#fff' }}>
      <h3 style={{ fontSize:16, fontWeight:700, color:'rgba(255,255,255,.7)', margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>
        <Music size={16}/> Soundboard
      </h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {SOUNDS.map(s => (
          <button key={s.id} onClick={() => handle(s.id)} style={{
            padding:'14px 12px', background: playing === s.id ? `${s.color}22` : 'rgba(255,255,255,.04)',
            border: `1px solid ${playing === s.id ? `${s.color}66` : 'rgba(255,255,255,.08)'}`,
            borderRadius:10, color: playing === s.id ? s.color : 'rgba(255,255,255,.6)',
            cursor:'pointer', transition:'all .2s', textAlign:'center'
          }}>
            <div style={{ fontSize:24, marginBottom:4 }}>{s.emoji}</div>
            <div style={{ fontSize:11, fontWeight:600 }}>{s.label}</div>
            {playing === s.id && <div style={{ fontSize:10, marginTop:4, color:s.color }}>▶ Playing…</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── HostStageCard ────────────────────────────────────────────────────────────
interface HostStageCardProps { isLive?: boolean; currentEvent?: string; onGoLive?: () => void; }

export function HostStageCard({ isLive = false, currentEvent, onGoLive }: HostStageCardProps) {
  return (
    <div style={{ background:'linear-gradient(135deg,#0a0d14,#111827)', border:`2px solid ${isLive ? '#ff3030' : 'rgba(255,255,255,.1)'}`, borderRadius:14, padding:24, color:'#fff', textAlign:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#ff6b1a,#ffd700,#00e5ff)' }} />
      <div style={{ width:80, height:80, borderRadius:'50%', border:`3px solid ${isLive ? '#ff3030' : 'rgba(255,107,26,.4)'}`, margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,107,26,.1)', fontSize:32, boxShadow: isLive ? '0 0 24px rgba(255,48,48,.4)' : 'none' }}>
        🎤
      </div>
      <h3 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>Ray Journey</h3>
      <p style={{ fontSize:13, color:'rgba(255,255,255,.4)', margin:'0 0 16px' }}>Grand Platform Contest Host</p>
      {isLive ? (
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 16px', background:'rgba(255,48,48,.15)', border:'1px solid rgba(255,48,48,.4)', borderRadius:20, fontSize:12, fontWeight:800, color:'#ff3030', letterSpacing:'.1em' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#ff3030', animation:'none' }} /> LIVE ON STAGE
        </div>
      ) : (
        <button onClick={onGoLive} style={{ padding:'10px 24px', background:'linear-gradient(135deg,#ff6b1a,#ff8c42)', border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
          Go Live
        </button>
      )}
      {currentEvent && <p style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginTop:12, marginBottom:0 }}>📍 {currentEvent}</p>}
    </div>
  );
}

export default SponsorCuePanel;
