/**
 * ContestDiscoveryGrid.tsx
 * Repo: apps/web/src/components/contest/ContestDiscoveryGrid.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface DiscoveryEntry {
  id: string;
  artistName: string;
  category: string;
  votes: number;
  rank: number;
  qualified: boolean;
  artistAvatar?: string;
}

interface ContestDiscoveryGridProps {
  entries?: DiscoveryEntry[];
  onVote?: (entryId: string) => void;
}

const PLACEHOLDER: DiscoveryEntry[] = [];

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
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 8, padding: '0 12px',
        }}>
          <Search size={14} color="rgba(255,255,255,.3)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search artists…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#fff', fontSize: 14, padding: '10px 0',
            }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{
            padding: '0 12px', background: '#0d1117',
            border: '1px solid rgba(255,255,255,.08)', borderRadius: 8,
            color: 'rgba(255,255,255,.7)', fontSize: 13, cursor: 'pointer',
          }}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,.3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎵</div>
          <p style={{ fontSize: 14 }}>
            {entries.length === 0
              ? 'No entries yet. Contest season opens August 8.'
              : 'No artists match your search.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 14,
        }}>
          {filtered.map(entry => (
            <div key={entry.id} style={{
              background: '#0d1117',
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 12, padding: 18,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(255,107,26,.1)', border: '2px solid rgba(255,107,26,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: '#ff6b1a', flexShrink: 0, overflow: 'hidden',
                }}>
                  {entry.artistAvatar
                    ? <img src={entry.artistAvatar} alt={entry.artistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : entry.artistName[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{entry.artistName}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{entry.category}</div>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', fontWeight: 700 }}>#{entry.rank}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>
                  {entry.votes.toLocaleString()} votes
                </span>
                {onVote && entry.qualified && (
                  <button
                    onClick={() => onVote(entry.id)}
                    style={{
                      padding: '6px 14px', background: 'linear-gradient(135deg,#ff6b1a,#ff8c42)',
                      border: 'none', borderRadius: 8, color: '#fff',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Vote
                  </button>
                )}
                {!entry.qualified && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.25)' }}>Not yet qualified</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContestDiscoveryGrid;
