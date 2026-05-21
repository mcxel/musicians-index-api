/**
 * ContestRulesCard.tsx
 * Repo: apps/web/src/components/contest/ContestRulesCard.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { BookOpen, CheckCircle } from 'lucide-react';

const CONTEST_RULES = [
  'Artists must secure 10 local sponsors and 10 major sponsors to qualify.',
  'Contest registration opens exclusively on August 8 each year.',
  'Each sponsor contribution must be verified by the platform before counting.',
  'Artists may enter only one category per season.',
  'Voting opens once the qualifying round is complete.',
  'Fan votes are weighted equally within the fan tier.',
  'The host panel (Ray Journey) announces all winners live.',
  'Prize fulfillment is handled by the PrizeFulfillment team post-announcement.',
  'Sponsor branding appears on the artist profile and during contest events.',
  'All decisions by the contest administration are final.',
];

interface ContestRulesCardProps { compact?: boolean; }

export function ContestRulesCard({ compact = false }: ContestRulesCardProps) {
  const displayed = compact ? CONTEST_RULES.slice(0, 5) : CONTEST_RULES;

  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <BookOpen size={18} color="#00e5ff" />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Contest Rules</span>
      </div>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {displayed.map((rule, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,229,255,.1)', border: '1px solid rgba(0,229,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#00e5ff', flexShrink: 0, marginTop: 1 }}>
              {i + 1}
            </div>
            {rule}
          </li>
        ))}
      </ol>
      {compact && CONTEST_RULES.length > 5 && (
        <a href="/contest/rules" style={{ display: 'block', marginTop: 14, fontSize: 13, color: '#00e5ff', textDecoration: 'none' }}>
          View all {CONTEST_RULES.length} rules →
        </a>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * ContestProgressBanner.tsx
 * Repo: apps/web/src/components/contest/ContestProgressBanner.tsx
 * Action: CREATE | Wave: W2
 */
interface ContestProgressBannerProps {
  currentPhase: 'registration' | 'qualifying' | 'competing' | 'voting' | 'finals' | 'complete';
}

const PHASES = [
  { id: 'registration', label: 'Registration' },
  { id: 'qualifying',   label: 'Qualifying' },
  { id: 'competing',    label: 'Competing' },
  { id: 'voting',       label: 'Voting' },
  { id: 'finals',       label: 'Finals' },
  { id: 'complete',     label: 'Complete' },
];

export function ContestProgressBanner({ currentPhase }: ContestProgressBannerProps) {
  const currentIdx = PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        {PHASES.map((phase, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={phase.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              {i > 0 && (
                <div style={{ width: '100%', height: 2, background: done ? '#ff6b1a' : 'rgba(255,255,255,.06)', borderRadius: 1, marginBottom: 8, position: 'relative', top: 10 }} />
              )}
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: active ? '#ff6b1a' : done ? 'rgba(255,107,26,.2)' : 'rgba(255,255,255,.06)', border: `2px solid ${active ? '#ff6b1a' : done ? 'rgba(255,107,26,.4)' : 'rgba(255,255,255,.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                {done && <CheckCircle size={12} color="#ff6b1a" />}
                {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: active ? '#ff6b1a' : done ? 'rgba(255,107,26,.7)' : 'rgba(255,255,255,.3)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * ContestDiscoveryGrid.tsx
 * Repo: apps/web/src/components/contest/ContestDiscoveryGrid.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface DiscoveryEntry { id: string; artistName: string; category: string; votes: number; rank: number; qualified: boolean; }

interface ContestDiscoveryGridProps {
  entries?: DiscoveryEntry[];
  onVote?: (entryId: string) => void;
}

const PLACEHOLDER: DiscoveryEntry[] = [
  { id: '1', artistName: 'Artist Name', category: 'R&B', votes: 0, rank: 1, qualified: false },
];

export function ContestDiscoveryGrid({ entries = PLACEHOLDER, onVote }: ContestDiscoveryGridProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...Array.from(new Set(entries.map(e => e.category)))];
  const filtered = entries.filter(e =>
    (categoryFilter === 'all' || e.category === categoryFilter) &&
    (search === '' || e.artistName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '0 12px' }}>
          <Search size={14} color="rgba(255,255,255,.3)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search artists…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '10px 0' }} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '0 12px', background: '#0d1117', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: 'rgba(255,255,255,.7)', fontSize: 13, cursor: 'pointer' }}>
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,.3)' }}>
          No entries found. Contest season opens August 8.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {filtered.map(entry => (
            <div key={entry.id} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{entry.artistName}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', background: 'rgba(255,255,255,.05)', padding: '2px 8px', borderRadius: 10 }}>#{entry.rank}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>{entry.category}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>{entry.votes.toLocaleString()} votes</span>
                {onVote && entry.qualified && (
                  <button onClick={() => onVote(entry.id)} style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#ff6b1a,#ff8c42)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Vote
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * VoteNowPanel.tsx
 * Repo: apps/web/src/components/contest/VoteNowPanel.tsx
 * Action: CREATE | Wave: W2
 */
interface VoteEntry { id: string; artistName: string; votes: number; totalVotes: number; }
interface VoteNowPanelProps { entries?: VoteEntry[]; onVote?: (id: string) => void; votingOpen?: boolean; }

export function VoteNowPanel({ entries = [], onVote, votingOpen = false }: VoteNowPanelProps) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Vote Now</span>
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: votingOpen ? 'rgba(0,200,83,.1)' : 'rgba(255,255,255,.05)', color: votingOpen ? '#00c853' : 'rgba(255,255,255,.4)', fontWeight: 700 }}>
          {votingOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>
      {entries.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
          Voting opens when qualifying is complete.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map(e => {
            const pct = e.totalVotes > 0 ? (e.votes / e.totalVotes) * 100 : 0;
            return (
              <div key={e.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{e.artistName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{pct.toFixed(1)}%</span>
                    {votingOpen && onVote && (
                      <button onClick={() => onVote(e.id)} style={{ padding: '4px 12px', background: '#ff6b1a', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Vote</button>
                    )}
                  </div>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#ff6b1a,#ffd700)', borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * ScoreboardOverlay.tsx
 * Repo: apps/web/src/components/contest/ScoreboardOverlay.tsx
 * Action: CREATE | Wave: W2
 */
interface ScoreEntry { rank: number; artistName: string; score: number; change?: 'up' | 'down' | 'same'; }
interface ScoreboardOverlayProps { entries?: ScoreEntry[]; title?: string; compact?: boolean; }

export function ScoreboardOverlay({ entries = [], title = 'Leaderboard', compact = false }: ScoreboardOverlayProps) {
  const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const CHANGE_COLOR = { up: '#00c853', down: '#ff5252', same: 'rgba(255,255,255,.3)' };
  const CHANGE_SYMBOL = { up: '▲', down: '▼', same: '–' };

  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: compact ? 10 : 12, padding: compact ? '12px 14px' : 20 }}>
      {!compact && (
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}>{title}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 10 }}>
        {entries.slice(0, compact ? 5 : entries.length).map(e => (
          <div key={e.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: compact ? '6px 8px' : '8px 12px', background: e.rank <= 3 ? `rgba(255,215,0,0.${5 - e.rank})` : 'rgba(255,255,255,.02)', borderRadius: 8 }}>
            <span style={{ fontSize: compact ? 14 : 18, minWidth: 28 }}>{MEDAL[e.rank] ?? `#${e.rank}`}</span>
            <span style={{ flex: 1, fontSize: compact ? 12 : 14, fontWeight: 600, color: '#fff' }}>{e.artistName}</span>
            {e.change && (
              <span style={{ fontSize: 10, color: CHANGE_COLOR[e.change] }}>{CHANGE_SYMBOL[e.change]}</span>
            )}
            <span style={{ fontSize: compact ? 12 : 14, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>
              {e.score.toLocaleString()}
            </span>
          </div>
        ))}
        {entries.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13, padding: '12px 0' }}>
            Scoreboard empty. Competing phase not yet started.
          </p>
        )}
      </div>
    </div>
  );
}
