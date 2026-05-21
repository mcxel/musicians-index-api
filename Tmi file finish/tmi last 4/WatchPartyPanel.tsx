/**
 * WatchPartyPanel.tsx
 * Repo: apps/web/src/components/watchparty/WatchPartyPanel.tsx
 * Action: CREATE | Wave: W8
 */
'use client';
import { useState } from 'react';
import { Users, MessageSquare, Hand, Video, Scissors } from 'lucide-react';

interface WatchPartyPanelProps {
  roomId: string;
  title: string;
  hostName: string;
  audienceCount?: number;
  isLive?: boolean;
  allowQuestions?: boolean;
  allowCallUp?: boolean;
  allowClipRequest?: boolean;
  sponsorName?: string;
  onSubmitQuestion?: (q: string) => void;
  onRequestCallUp?: () => void;
  onRequestClip?: (note: string) => void;
}

export function WatchPartyPanel({
  roomId, title, hostName, audienceCount = 0, isLive = false,
  allowQuestions = true, allowCallUp = false, allowClipRequest = true,
  sponsorName, onSubmitQuestion, onRequestCallUp, onRequestClip,
}: WatchPartyPanelProps) {
  const [tab, setTab] = useState<'watch' | 'questions' | 'clips'>('watch');
  const [question, setQuestion] = useState('');
  const [clipNote, setClipNote] = useState('');

  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 20, color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {isLive && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff3030' }} />}
        <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,.4)' }}>
          <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          {audienceCount.toLocaleString()}
        </span>
      </div>

      {sponsorName && (
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 12, letterSpacing: '.08em' }}>
          PRESENTED BY {sponsorName.toUpperCase()}
        </p>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'watch', label: 'Watch', icon: <Video size={13} /> },
          ...(allowQuestions ? [{ id: 'questions', label: 'Questions', icon: <MessageSquare size={13} /> }] : []),
          ...(allowClipRequest ? [{ id: 'clips', label: 'Clips', icon: <Scissors size={13} /> }] : []),
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: tab === t.id ? 'rgba(0,229,255,.1)' : 'rgba(255,255,255,.04)', border: `1px solid ${tab === t.id ? 'rgba(0,229,255,.4)' : 'rgba(255,255,255,.08)'}`, borderRadius: 8, color: tab === t.id ? '#00e5ff' : 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'watch' && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>
            You're watching with {audienceCount.toLocaleString()} others.
            {allowCallUp && <> <button onClick={onRequestCallUp} style={{ color: '#ff6b1a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Request to join ✋</button></>}
          </p>
        </div>
      )}

      {tab === 'questions' && allowQuestions && (
        <div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Submit a question for the host.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Your question…" style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: '#fff', fontSize: 13 }} />
            <button onClick={() => { onSubmitQuestion?.(question); setQuestion(''); }} disabled={!question.trim()} style={{ padding: '10px 16px', background: 'rgba(0,229,255,.1)', border: '1px solid rgba(0,229,255,.3)', borderRadius: 8, color: '#00e5ff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Send
            </button>
          </div>
        </div>
      )}

      {tab === 'clips' && allowClipRequest && (
        <div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Request a clip from this session. Host must approve.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={clipNote} onChange={e => setClipNote(e.target.value)} placeholder="Describe the moment to clip…" style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: '#fff', fontSize: 13 }} />
            <button onClick={() => { onRequestClip?.(clipNote); setClipNote(''); }} disabled={!clipNote.trim()} style={{ padding: '10px 16px', background: 'rgba(255,107,26,.1)', border: '1px solid rgba(255,107,26,.3)', borderRadius: 8, color: '#ff6b1a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GuestQueuePanel.tsx
// Repo: apps/web/src/components/watchparty/GuestQueuePanel.tsx
// Action: CREATE | Wave: W8
// Shared by: Interview, Podcast, Watch Party
// ════════════════════════════════════════════════════════════════════════════

export interface GuestRequest {
  id: string;
  userName: string;
  userAvatar?: string;
  requestType: 'call_up' | 'question' | 'clip_request';
  message?: string;
  status: 'pending' | 'approved' | 'declined';
  timestamp: Date;
}

interface GuestQueuePanelProps {
  requests?: GuestRequest[];
  isHost?: boolean;
  onApprove?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
}

export function GuestQueuePanel({ requests = [], isHost = false, onApprove, onDecline }: GuestQueuePanelProps) {
  const pending = requests.filter(r => r.status === 'pending');
  const typeLabels: Record<string, string> = { call_up: '✋ Call-up', question: '💬 Question', clip_request: '✂️ Clip' };

  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 20, color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ffd700', margin: 0 }}>Guest Queue</h3>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{pending.length} pending</span>
      </div>

      {pending.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No pending requests</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pending.map(req => (
            <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                {req.userAvatar ? <img src={req.userAvatar} alt={req.userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : req.userName[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{req.userName}</div>
                <div style={{ fontSize: 11, color: '#ffd700' }}>{typeLabels[req.requestType]}</div>
                {req.message && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>{req.message}</div>}
              </div>
              {isHost && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => onApprove?.(req.id)} style={{ padding: '6px 12px', background: 'rgba(0,200,83,.15)', border: '1px solid rgba(0,200,83,.4)', borderRadius: 6, color: '#00c853', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✓</button>
                  <button onClick={() => onDecline?.(req.id)} style={{ padding: '6px 12px', background: 'rgba(255,82,82,.1)', border: '1px solid rgba(255,82,82,.3)', borderRadius: 6, color: '#ff5252', fontSize: 12, cursor: 'pointer' }}>✗</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WatchPartyPanel;
