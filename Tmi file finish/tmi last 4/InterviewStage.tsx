/**
 * InterviewStage.tsx
 * Repo: apps/web/src/components/interview/InterviewStage.tsx
 * Action: CREATE | Wave: W8
 * Prerequisite: MINIMUM_CONTEST_COMPLETE = true
 * Built on: Live Room Core (room type = interview | talk_show)
 */
'use client';
import { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Users, MessageSquare, ChevronRight, X } from 'lucide-react';

interface InterviewParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'host' | 'guest' | 'audience';
  micActive?: boolean;
  camActive?: boolean;
}

interface InterviewStageProps {
  roomId: string;
  title: string;
  host: InterviewParticipant;
  guests?: InterviewParticipant[];
  audienceCount?: number;
  isLive?: boolean;
  isHost?: boolean;
  isGuest?: boolean;
  recordingEnabled?: boolean;
  interactionMode?: 'watch_only' | 'react_only' | 'question_submit' | 'hand_raise' | 'full_interactive';
  sponsorName?: string;
  onSubmitQuestion?: (q: string) => void;
  onRequestCallUp?: () => void;
  onLeave?: () => void;
}

export function InterviewStage({
  roomId, title, host, guests = [], audienceCount = 0,
  isLive = false, isHost = false, isGuest = false,
  recordingEnabled = false, interactionMode = 'react_only',
  sponsorName, onSubmitQuestion, onRequestCallUp, onLeave,
}: InterviewStageProps) {
  const [question, setQuestion] = useState('');
  const [questionSent, setQuestionSent] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);

  const sendQuestion = () => {
    if (!question.trim()) return;
    onSubmitQuestion?.(question);
    setQuestion('');
    setQuestionSent(true);
    setTimeout(() => setQuestionSent(false), 3000);
  };

  const fireReaction = (emoji: string) => {
    setReaction(emoji);
    setTimeout(() => setReaction(null), 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070a0f', color: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ background: '#0a0d14', borderBottom: '1px solid rgba(255,255,255,.07)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          {isLive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3030', flexShrink: 0 }} />}
          <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
          {recordingEnabled && <span style={{ fontSize: 10, color: '#ff3030', background: 'rgba(255,48,48,.1)', border: '1px solid rgba(255,48,48,.3)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>REC</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,.4)' }}>
          <Users size={14} /> {audienceCount.toLocaleString()}
        </div>
        {onLeave && (
          <button onClick={onLeave} style={{ padding: '6px 14px', background: 'rgba(255,48,48,.1)', border: '1px solid rgba(255,48,48,.3)', borderRadius: 8, color: '#ff5252', fontSize: 13, cursor: 'pointer' }}>
            Leave
          </button>
        )}
      </div>

      {/* Stage */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

        {/* Sponsor */}
        {sponsorName && (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginBottom: 24, letterSpacing: '.08em' }}>
            PRESENTED BY {sponsorName.toUpperCase()}
          </p>
        )}

        {/* Stage participants */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          {[host, ...guests].map((p, i) => (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: i === 0 ? 100 : 80, height: i === 0 ? 100 : 80, borderRadius: '50%', border: `3px solid ${i === 0 ? '#ff6b1a' : '#00e5ff'}`, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i === 0 ? 40 : 32, fontWeight: 700, overflow: 'hidden', boxShadow: `0 0 24px ${i === 0 ? 'rgba(255,107,26,.3)' : 'rgba(0,229,255,.2)'}` }}>
                  {p.avatar ? <img src={p.avatar} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.name[0]}
                </div>
                {/* Mic indicator */}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: p.micActive ? '#00ff88' : 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.micActive ? <Mic size={12} color="#000" /> : <MicOff size={12} color="rgba(255,255,255,.5)" />}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: `${i === 0 ? '#ff6b1a' : '#00e5ff'}`, textTransform: 'capitalize' }}>{p.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Reaction strip */}
        {interactionMode !== 'watch_only' && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {['❤️', '🔥', '👏', '😂', '🎵', '⭐'].map(emoji => (
              <button key={emoji} onClick={() => fireReaction(emoji)} style={{ width: 44, height: 44, borderRadius: '50%', background: reaction === emoji ? 'rgba(255,107,26,.2)' : 'rgba(255,255,255,.06)', border: `1px solid ${reaction === emoji ? 'rgba(255,107,26,.5)' : 'rgba(255,255,255,.1)'}`, fontSize: 20, cursor: 'pointer', transition: 'all .15s' }}>
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Question input */}
        {(interactionMode === 'question_submit' || interactionMode === 'full_interactive') && (
          <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 500 }}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendQuestion()}
              placeholder="Ask a question…"
              style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: '#fff', fontSize: 14 }}
            />
            <button onClick={sendQuestion} disabled={questionSent || !question.trim()} style={{ padding: '10px 18px', background: questionSent ? 'rgba(0,200,83,.2)' : 'rgba(0,229,255,.1)', border: `1px solid ${questionSent ? 'rgba(0,200,83,.4)' : 'rgba(0,229,255,.3)'}`, borderRadius: 8, color: questionSent ? '#00c853' : '#00e5ff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {questionSent ? '✓ Sent' : 'Ask'}
            </button>
          </div>
        )}

        {/* Request call-up */}
        {(interactionMode === 'hand_raise' || interactionMode === 'full_interactive') && !isGuest && (
          <button onClick={onRequestCallUp} style={{ marginTop: 16, padding: '10px 24px', background: 'rgba(255,107,26,.1)', border: '1px solid rgba(255,107,26,.3)', borderRadius: 8, color: '#ff6b1a', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            ✋ Request to Join
          </button>
        )}
      </div>
    </div>
  );
}

export default InterviewStage;
