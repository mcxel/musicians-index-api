/**
 * ContestComponents.tsx — SPLIT INTO INDIVIDUAL FILES BEFORE COMMITTING
 *
 * Contains:
 *   WinnerRevealPanel      → apps/web/src/components/contest/WinnerRevealPanel.tsx
 *   VoteNowPanel           → apps/web/src/components/contest/VoteNowPanel.tsx
 *   ScoreboardOverlay      → apps/web/src/components/contest/ScoreboardOverlay.tsx
 *   ContestDiscoveryGrid   → apps/web/src/components/contest/ContestDiscoveryGrid.tsx
 *   ContestEntryCard       → apps/web/src/components/contest/ContestEntryCard.tsx
 *   ContestQualificationStatus → apps/web/src/components/contest/ContestQualificationStatus.tsx
 *   ContestRulesCard       → apps/web/src/components/contest/ContestRulesCard.tsx
 *   ContestProgressBanner  → apps/web/src/components/contest/ContestProgressBanner.tsx
 *   SponsorProgressCard    → apps/web/src/components/contest/SponsorProgressCard.tsx
 */

'use client';
import { useState, useEffect } from 'react';
import { Trophy, Star, Users, ChevronRight, CheckCircle, Clock, Zap, Play, Award, Target } from 'lucide-react';

// ─── WinnerRevealPanel ────────────────────────────────────────────────────────
interface WinnerRevealPanelProps {
  winnerName: string;
  winnerAvatar?: string;
  category: string;
  seasonName: string;
  prizeDescription?: string;
  sponsors?: string[];
  onClose?: () => void;
}

export function WinnerRevealPanel({ winnerName, winnerAvatar, category, seasonName, prizeDescription, sponsors = [], onClose }: WinnerRevealPanelProps) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { setTimeout(() => setRevealed(true), 300); }, []);
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ textAlign:'center', maxWidth:480, padding:40 }}>
        <div style={{ fontSize:56, marginBottom:16, animation: revealed ? 'none' : 'none' }}>🏆</div>
        <p style={{ fontSize:12, fontWeight:700, letterSpacing:'.15em', color:'#ffd700', margin:'0 0 8px', textTransform:'uppercase' }}>
          {seasonName} — {category} Winner
        </p>
        <h1 style={{ fontSize: revealed ? 48 : 0, fontWeight:900, color:'#fff', margin:'0 0 20px', transition:'font-size .6s ease', letterSpacing:'-0.02em', lineHeight:1.1 }}>
          {revealed ? winnerName : ''}
        </h1>
        {winnerAvatar && revealed && (
          <div style={{ width:100, height:100, borderRadius:'50%', border:'4px solid #ffd700', overflow:'hidden', margin:'0 auto 20px', boxShadow:'0 0 40px rgba(255,215,0,.4)' }}>
            <img src={winnerAvatar} alt={winnerName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        )}
        {prizeDescription && revealed && (
          <p style={{ fontSize:16, color:'rgba(255,255,255,.7)', margin:'0 0 20px' }}>{prizeDescription}</p>
        )}
        {sponsors.length > 0 && revealed && (
          <p style={{ fontSize:12, color:'rgba(255,255,255,.4)', margin:'0 0 32px' }}>
            Brought to you by {sponsors.join(' & ')}
          </p>
        )}
        {onClose && (
          <button onClick={onClose} style={{ padding:'12px 28px', background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', borderRadius:8, color:'#fff', fontSize:14, cursor:'pointer' }}>
            Close
          </button>
        )}
      </div>
    </div>
  );
}

// ─── VoteNowPanel ─────────────────────────────────────────────────────────────
interface VoteEntry { id: string; artistName: string; artistAvatar?: string; category: string; votes: number; }
interface VoteNowPanelProps {
  roundName: string;
  entries?: VoteEntry[];
  myVoteId?: string;
  deadline?: Date;
  onVote?: (entryId: string) => Promise<void>;
}

export function VoteNowPanel({ roundName, entries = [], myVoteId, deadline, onVote }: VoteNowPanelProps) {
  const [voting, setVoting] = useState<string | null>(null);
  const [voted, setVoted] = useState(myVoteId);
  const total = entries.reduce((a, e) => a + e.votes, 0);

  const handle = async (id: string) => {
    if (voted || voting) return;
    setVoting(id);
    await onVote?.(id);
    setVoted(id);
    setVoting(null);
  };

  return (
    <div style={{ background:'#0d1117', border:'1px solid rgba(255,107,26,.2)', borderRadius:12, padding:24, color:'#fff' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h3 style={{ fontSize:18, fontWeight:700, color:'#ff6b1a', margin:'0 0 4px' }}>Vote Now</h3>
          <p style={{ fontSize:13, color:'rgba(255,255,255,.4)', margin:0 }}>{roundName}</p>
        </div>
        {deadline && <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#ffd700', background:'rgba(255,215,0,.08)', border:'1px solid rgba(255,215,0,.2)', padding:'5px 12px', borderRadius:20 }}>
          <Clock size={12}/> {Math.max(0, Math.ceil((deadline.getTime()-Date.now())/86400000))}d left
        </div>}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {entries.map(entry => {
          const pct = total > 0 ? Math.round((entry.votes / total) * 100) : 0;
          const isVoted = voted === entry.id;
          return (
            <div key={entry.id} style={{ background: isVoted ? 'rgba(255,107,26,.08)' : 'rgba(255,255,255,.03)', border:`1px solid ${isVoted ? 'rgba(255,107,26,.4)' : 'rgba(255,255,255,.07)'}`, borderRadius:10, padding:'12px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, overflow:'hidden', flexShrink:0 }}>
                  {entry.artistAvatar ? <img src={entry.artistAvatar} alt={entry.artistName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : entry.artistName[0]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{entry.artistName}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>{entry.category}</div>
                </div>
                <button onClick={() => handle(entry.id)} disabled={!!voted || !!voting} style={{
                  padding:'7px 14px', background: isVoted ? '#ff6b1a' : 'rgba(255,107,26,.1)',
                  border:`1px solid ${isVoted ? '#ff6b1a' : 'rgba(255,107,26,.3)'}`, borderRadius:8,
                  color: isVoted ? '#fff' : '#ff6b1a', fontSize:12, fontWeight:700,
                  cursor: voted ? 'default' : 'pointer', display:'flex', alignItems:'center', gap:5
                }}>
                  {isVoted ? <><CheckCircle size={13}/> Voted</> : voting === entry.id ? 'Voting…' : <><Star size={13}/> Vote</>}
                </button>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:4, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', background: isVoted ? '#ff6b1a' : 'rgba(255,255,255,.15)', borderRadius:2, transition:'width .5s' }} />
                </div>
                <span style={{ fontSize:11, color:'rgba(255,255,255,.4)', whiteSpace:'nowrap' }}>{pct}% · {entry.votes}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ScoreboardOverlay ────────────────────────────────────────────────────────
interface ScoreEntry { rank: number; artistName: string; votes: number; category: string; }
interface ScoreboardOverlayProps {
  entries?: ScoreEntry[];
  roundName?: string;
  visible?: boolean;
  compact?: boolean;
}

export function ScoreboardOverlay({ entries = [], roundName = 'Current Round', visible = true, compact = false }: ScoreboardOverlayProps) {
  if (!visible) return null;
  const top = entries.slice(0, compact ? 3 : 10);
  return (
    <div style={{
      background:'rgba(10,13,20,.92)', backdropFilter:'blur(12px)',
      border:'1px solid rgba(255,215,0,.2)', borderRadius:12,
      padding: compact ? '12px 16px' : '20px 24px', color:'#fff',
      minWidth: compact ? 200 : 320
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <Trophy size={14} color="#ffd700" />
        <span style={{ fontSize:12, fontWeight:700, color:'#ffd700', letterSpacing:'.08em', textTransform:'uppercase' }}>{roundName}</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {top.map((e, i) => (
          <div key={e.rank} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:20, fontSize: i < 3 ? 14 : 12, color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,.4)', fontWeight:700, textAlign:'center' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${e.rank}`}
            </span>
            <span style={{ flex:1, fontSize: compact ? 12 : 13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.artistName}</span>
            <span style={{ fontSize:12, color:'rgba(255,255,255,.5)', whiteSpace:'nowrap' }}>{e.votes.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ContestDiscoveryGrid ─────────────────────────────────────────────────────
interface DiscoveryEntry { id: string; artistName: string; artistAvatar?: string; category: string; localSponsors: number; majorSponsors: number; votes: number; status: string; }
interface ContestDiscoveryGridProps {
  entries?: DiscoveryEntry[];
  categoryFilter?: string;
  onViewEntry?: (id: string) => void;
  onVote?: (id: string) => void;
}

export function ContestDiscoveryGrid({ entries = [], categoryFilter, onViewEntry, onVote }: ContestDiscoveryGridProps) {
  const [cat, setCat] = useState(categoryFilter || 'all');
  const categories = ['all', ...Array.from(new Set(entries.map(e => e.category)))];
  const shown = cat === 'all' ? entries : entries.filter(e => e.category === cat);
  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600,
            background: cat === c ? 'rgba(255,107,26,.15)' : 'rgba(255,255,255,.05)',
            border: cat === c ? '1px solid rgba(255,107,26,.5)' : '1px solid rgba(255,255,255,.1)',
            color: cat === c ? '#ff6b1a' : 'rgba(255,255,255,.5)', cursor:'pointer', textTransform:'capitalize'
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
        {shown.map(entry => {
          const total = entry.localSponsors + entry.majorSponsors;
          const pct = Math.min((total/20)*100, 100);
          return (
            <div key={entry.id} style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, overflow:'hidden', transition:'border-color .2s', cursor:'pointer' }}
              onClick={() => onViewEntry?.(entry.id)}>
              <div style={{ height:80, background:'linear-gradient(135deg,rgba(255,107,26,.1),rgba(0,229,255,.05))', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {entry.artistAvatar ? <img src={entry.artistAvatar} alt={entry.artistName} style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,107,26,.4)' }} /> :
                  <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(255,107,26,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'#ff6b1a' }}>{entry.artistName[0]}</div>}
              </div>
              <div style={{ padding:16 }}>
                <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:4 }}>{entry.artistName}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:12, textTransform:'capitalize' }}>{entry.category}</div>
                <div style={{ height:3, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden', marginBottom:6 }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#ff6b1a,#ffd700)', borderRadius:2 }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'rgba(255,255,255,.35)', marginBottom:12 }}>
                  <span>{total}/20 sponsors</span><span>{entry.votes} votes</span>
                </div>
                {onVote && (
                  <button onClick={e => { e.stopPropagation(); onVote(entry.id); }} style={{ width:'100%', padding:'8px', background:'rgba(255,107,26,.1)', border:'1px solid rgba(255,107,26,.3)', borderRadius:8, color:'#ff6b1a', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                    Vote <Star size={12} style={{ display:'inline', verticalAlign:'middle' }} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {shown.length === 0 && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px', color:'rgba(255,255,255,.3)' }}>No contestants in this category yet.</div>
        )}
      </div>
    </div>
  );
}

// ─── ContestEntryCard ─────────────────────────────────────────────────────────
interface ContestEntryCardProps {
  artistName: string; artistAvatar?: string; category: string;
  status: string; localSponsors: number; majorSponsors: number;
  votes?: number; roundName?: string; isCurrentUser?: boolean;
  onView?: () => void;
}

export function ContestEntryCard({ artistName, artistAvatar, category, status, localSponsors, majorSponsors, votes=0, roundName, isCurrentUser, onView }: ContestEntryCardProps) {
  const total = localSponsors + majorSponsors;
  const statusColors: Record<string, string> = { pending:'#ffd700', qualified:'#00e5ff', regional:'#ff6b1a', semi_finals:'#ff00ff', finals:'#ffd700', winner:'#00ff88', eliminated:'rgba(255,255,255,.3)' };
  const color = statusColors[status] || '#ffd700';
  return (
    <div style={{ background: isCurrentUser ? 'rgba(255,107,26,.06)' : '#0d1117', border:`1px solid ${isCurrentUser ? 'rgba(255,107,26,.4)' : 'rgba(255,255,255,.07)'}`, borderRadius:12, padding:20, color:'#fff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, overflow:'hidden', flexShrink:0 }}>
          {artistAvatar ? <img src={artistAvatar} alt={artistName} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : artistName[0]}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:16, fontWeight:700 }}>{artistName}</span>
            {isCurrentUser && <span style={{ fontSize:10, background:'rgba(255,107,26,.2)', color:'#ff6b1a', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>YOU</span>}
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', textTransform:'capitalize' }}>{category}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:10, color:`${color}88`, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:2 }}>STATUS</div>
          <div style={{ fontSize:12, fontWeight:700, color }}>{status.replace(/_/g,' ')}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
        {[['Local Sponsors', `${localSponsors}/10`, '#00e5ff'], ['Major Sponsors', `${majorSponsors}/10`, '#ffd700'], ['Votes', votes, '#ff6b1a']].map(([l,v,c]) => (
          <div key={String(l)} style={{ background:'rgba(255,255,255,.03)', borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:800, color:String(c) }}>{v}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>
      {roundName && <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', marginBottom:14 }}>📍 {roundName}</div>}
      {onView && <button onClick={onView} style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#ff6b1a', background:'transparent', border:'none', cursor:'pointer', padding:0 }}>View Entry Details <ChevronRight size={14}/></button>}
    </div>
  );
}

// ─── ContestQualificationStatus ───────────────────────────────────────────────
interface ContestQualificationStatusProps {
  localSponsors: number; majorSponsors: number; status: string; compact?: boolean;
}

export function ContestQualificationStatus({ localSponsors, majorSponsors, status, compact = false }: ContestQualificationStatusProps) {
  const isQual = localSponsors >= 10 && majorSponsors >= 10;
  const color = isQual ? '#00e5ff' : '#ff6b1a';
  if (compact) return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', background:`${color}18`, border:`1px solid ${color}44`, borderRadius:20, fontSize:12, fontWeight:700, color }}>
      {isQual ? <CheckCircle size={13}/> : <Target size={13}/>}
      {isQual ? 'Qualified' : `${localSponsors+majorSponsors}/20 Sponsors`}
    </span>
  );
  return (
    <div style={{ background:'#0d1117', border:`1px solid ${color}33`, borderRadius:12, padding:20, color:'#fff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        {isQual ? <CheckCircle size={20} color="#00e5ff"/> : <Target size={20} color="#ff6b1a"/>}
        <div>
          <div style={{ fontSize:16, fontWeight:700, color }}>{isQual ? 'Qualified for Competition' : 'Qualification in Progress'}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>Status: {status.replace(/_/g,' ')}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[['Local Sponsors', localSponsors, 10, '#00e5ff'], ['Major Sponsors', majorSponsors, 10, '#ffd700']].map(([l,v,req,c]) => (
          <div key={String(l)} style={{ background:'rgba(255,255,255,.03)', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>{l}</span>
              <span style={{ fontSize:14, fontWeight:700, color:String(c) }}>{v}/{req}</span>
            </div>
            <div style={{ height:4, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ width:`${Math.min((Number(v)/Number(req))*100,100)}%`, height:'100%', background:String(c), borderRadius:2, transition:'width .5s' }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ContestRulesCard ─────────────────────────────────────────────────────────
export function ContestRulesCard() {
  return (
    <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, padding:24, color:'#fff' }}>
      <h3 style={{ fontSize:18, fontWeight:700, color:'#ff6b1a', margin:'0 0 16px' }}>Contest Rules Summary</h3>
      {[
        ['Eligibility', 'Any registered creator on The Musician\'s Index platform may enter. All categories welcome.'],
        ['Sponsor Requirement', 'Each contestant must secure exactly 10 Local Sponsors and 10 Major Sponsors to qualify.'],
        ['Season Dates', 'Registration opens August 8 each year (Marcel\'s birthday). The contest season runs annually.'],
        ['Phases', 'Qualification → Regional Rounds → Semi-Finals → Grand Finals hosted by Ray Journey.'],
        ['Prizes', 'Cash prizes, recording contracts, brand partnerships, tour sponsorships, equipment packages.'],
        ['Fair Play', 'Self-sponsorship is prohibited. Duplicate sponsors will be rejected. Fraud leads to immediate disqualification.'],
        ['Voting', 'Fan voting opens during Regional Rounds. Major sponsors receive weighted voting consideration.'],
      ].map(([title, desc]) => (
        <div key={String(title)} style={{ borderBottom:'1px solid rgba(255,255,255,.06)', paddingBottom:14, marginBottom:14, lastChild:{borderBottom:'none',marginBottom:0,paddingBottom:0} } as any}>
          <div style={{ fontSize:13, fontWeight:700, color:'#ffd700', marginBottom:4 }}>{title}</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.6)', lineHeight:1.5 }}>{desc}</div>
        </div>
      ))}
    </div>
  );
}

// ─── ContestProgressBanner ────────────────────────────────────────────────────
interface ContestProgressBannerProps { currentPhase: number; phaseName: string; }

export function ContestProgressBanner({ currentPhase, phaseName }: ContestProgressBannerProps) {
  const phases = ['Qualification','Regional Rounds','Semi-Finals','Grand Finals'];
  return (
    <div style={{ background:'#0d1117', border:'1px solid rgba(255,107,26,.2)', borderRadius:12, padding:'16px 24px', color:'#fff' }}>
      <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', color:'#ff6b1a', marginBottom:12, textTransform:'uppercase' }}>Contest Phase Progress</div>
      <div style={{ display:'flex', alignItems:'center', gap:0 }}>
        {phases.map((p, i) => {
          const done = i < currentPhase; const cur = i === currentPhase;
          return (
            <div key={p} style={{ display:'flex', alignItems:'center', flex: i < phases.length-1 ? 1 : 'none' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background: done ? '#ff6b1a' : cur ? 'rgba(255,107,26,.3)' : 'rgba(255,255,255,.06)', border: cur ? '2px solid #ff6b1a' : done ? 'none' : '1px solid rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color: done||cur ? '#fff' : 'rgba(255,255,255,.3)' }}>
                  {done ? '✓' : i+1}
                </div>
                <span style={{ fontSize:10, color: cur ? '#ff6b1a' : done ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.3)', whiteSpace:'nowrap', fontWeight: cur ? 700 : 400 }}>{p}</span>
              </div>
              {i < phases.length-1 && <div style={{ flex:1, height:2, background: done ? '#ff6b1a' : 'rgba(255,255,255,.06)', margin:'0 4px', alignSelf:'flex-start', marginTop:13 }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SponsorProgressCard ──────────────────────────────────────────────────────
interface SponsorProgressCardProps {
  localSponsors: number; majorSponsors: number; compact?: boolean;
  onInvite?: () => void;
}

export function SponsorProgressCard({ localSponsors, majorSponsors, compact=false, onInvite }: SponsorProgressCardProps) {
  const total = localSponsors + majorSponsors;
  const pct = Math.min((total/20)*100, 100);
  if (compact) return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', background:'rgba(255,107,26,.06)', border:'1px solid rgba(255,107,26,.2)', borderRadius:10, color:'#fff' }}>
      <div style={{ flex:1, height:5, background:'rgba(255,255,255,.08)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#ff6b1a,#ffd700)', borderRadius:3 }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:'#ff6b1a', whiteSpace:'nowrap' }}>{total}/20</span>
    </div>
  );
  return (
    <div style={{ background:'#0d1117', border:'1px solid rgba(255,107,26,.2)', borderRadius:12, padding:20, color:'#fff' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
        <span style={{ fontSize:14, fontWeight:600 }}>Sponsor Progress</span>
        <span style={{ fontSize:20, fontWeight:800, color:'#ff6b1a' }}>{total}<span style={{ fontSize:14, color:'rgba(255,255,255,.4)' }}>/20</span></span>
      </div>
      <div style={{ height:6, background:'rgba(255,255,255,.06)', borderRadius:3, overflow:'hidden', marginBottom:14 }}>
        <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#ff6b1a,#ffd700)', borderRadius:3, boxShadow:'0 0 8px rgba(255,107,26,.5)', transition:'width .5s' }}/>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:16 }}>
        {[['Local',localSponsors,10,'#00e5ff'],['Major',majorSponsors,10,'#ffd700']].map(([l,v,r,c]) => (
          <div key={String(l)} style={{ flex:1, background:'rgba(255,255,255,.03)', borderRadius:8, padding:'10px 12px' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:4 }}>{l} Sponsors</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
              <span style={{ fontSize:20, fontWeight:800, color:String(c) }}>{v}</span>
              <span style={{ fontSize:13, color:'rgba(255,255,255,.3)' }}>/{r}</span>
            </div>
          </div>
        ))}
      </div>
      {onInvite && <button onClick={onInvite} style={{ width:'100%', padding:'10px', background:'linear-gradient(135deg,#ff6b1a,#ff8c42)', border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        <Zap size={15}/> Invite Sponsors
      </button>}
    </div>
  );
}

export default WinnerRevealPanel;
