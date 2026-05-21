/**
 * VoteNowPanel.tsx
 * Repo: apps/web/src/components/contest/VoteNowPanel.tsx
 * Action: CREATE | Wave: W2
 */
'use client';

interface VoteEntry {
  id: string;
  artistName: string;
  votes: number;
  totalVotes: number;
}

interface VoteNowPanelProps {
  entries?: VoteEntry[];
  onVote?: (entryId: string) => void;
  votingOpen?: boolean;
  myVoteId?: string | null;
}

export function VoteNowPanel({ entries = [], onVote, votingOpen = false, myVoteId = null }: VoteNowPanelProps) {
  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid rgba(255,255,255,.07)',
      borderRadius: 12, padding: 20,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Vote Now</span>
        <span style={{
          fontSize: 11, padding: '3px 10px', borderRadius: 10, fontWeight: 700,
          background: votingOpen ? 'rgba(0,200,83,.1)' : 'rgba(255,255,255,.05)',
          color: votingOpen ? '#00c853' : 'rgba(255,255,255,.4)',
          border: `1px solid ${votingOpen ? 'rgba(0,200,83,.3)' : 'rgba(255,255,255,.08)'}`,
        }}>
          {votingOpen ? 'VOTING OPEN' : 'VOTING CLOSED'}
        </span>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
          Voting opens when qualifying is complete.
        </p>
      )}

      {/* Vote bars */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map(entry => {
            const pct = entry.totalVotes > 0 ? (entry.votes / entry.totalVotes) * 100 : 0;
            const isMyVote = myVoteId === entry.id;

            return (
              <div key={entry.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: isMyVote ? 700 : 600, color: isMyVote ? '#ff6b1a' : '#fff' }}>
                      {entry.artistName}
                    </span>
                    {isMyVote && (
                      <span style={{ fontSize: 10, color: '#ff6b1a', background: 'rgba(255,107,26,.1)', padding: '1px 6px', borderRadius: 8, fontWeight: 700 }}>
                        Your vote
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{pct.toFixed(1)}%</span>
                    {votingOpen && onVote && !myVoteId && (
                      <button
                        onClick={() => onVote(entry.id)}
                        style={{
                          padding: '4px 12px', background: '#ff6b1a', border: 'none',
                          borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Vote
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: 3,
                    background: isMyVote ? 'linear-gradient(90deg,#ff6b1a,#ffd700)' : 'rgba(255,255,255,.2)',
                    transition: 'width .5s',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VoteNowPanel;
