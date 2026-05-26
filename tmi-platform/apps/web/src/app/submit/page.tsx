'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubmissionType } from '@/lib/submissions/SubmissionEngine';

interface LaneTile {
  id: SubmissionType;
  emoji: string;
  label: string;
  headline: string;
  sub: string;
  accent: string;
  formTitle: string;
  urlPlaceholder: string;
  urlLabel: string;
}

const LANES: LaneTile[] = [
  { id: 'track',   emoji: '🎵', label: 'Stream & Win',   headline: 'Drop Your Track',    sub: 'Enter the rotation. Earn XP every spin.',          accent: '#00FFFF', formTitle: 'Submit Your Track to Stream & Win', urlPlaceholder: 'SoundCloud, Spotify, or mp3 link', urlLabel: 'Track URL' },
  { id: 'battle',  emoji: '⚔️', label: 'Battle Arena',   headline: 'Challenge Someone',  sub: 'Pick an opponent. Winner takes the crown.',        accent: '#FF2DAA', formTitle: 'Submit Your Battle Entry',          urlPlaceholder: 'Audio/video link for your entry', urlLabel: 'Battle Entry URL' },
  { id: 'cypher',  emoji: '🔁', label: 'Cypher Circle',  headline: 'Join the Cypher',    sub: 'Add your verse. Get featured in the rotation.',    accent: '#AA2DFF', formTitle: 'Submit Your Cypher Verse',          urlPlaceholder: 'Audio/video link for your verse', urlLabel: 'Verse URL' },
  { id: 'video',   emoji: '🎬', label: 'Visual Drop',    headline: 'Drop a Visual',      sub: 'Music videos, lyric videos, behind-the-scenes.',  accent: '#FFD700', formTitle: 'Submit Your Video',                 urlPlaceholder: 'YouTube, Vimeo, or direct link',  urlLabel: 'Video URL' },
  { id: 'beat',    emoji: '🥁', label: 'Beat Market',    headline: 'List Your Beat',     sub: 'Producers: put your beats in front of artists.',  accent: '#00FFFF', formTitle: 'Submit a Beat',                     urlPlaceholder: 'Beatstars, Airbit, or direct link', urlLabel: 'Beat URL' },
  { id: 'comedy',  emoji: '😂', label: 'Stand-Up Night', headline: 'Make Them Laugh',    sub: 'Submit your set for Saturday Night Showcase.',    accent: '#FF2DAA', formTitle: 'Submit Your Comedy Set',            urlPlaceholder: 'Video or audio clip link',        urlLabel: 'Set URL' },
  { id: 'dance',   emoji: '💃', label: 'Dance Showcase', headline: 'Show Your Moves',    sub: 'Choreography, freestyles, crew videos.',          accent: '#AA2DFF', formTitle: 'Submit Your Dance Video',           urlPlaceholder: 'TikTok, Instagram, or direct link', urlLabel: 'Dance Video URL' },
  { id: 'show',    emoji: '📡', label: 'Live Show',      headline: 'Host a Show',        sub: 'Apply to go live on the TMI stage.',              accent: '#FFD700', formTitle: 'Apply for a Live Show Slot',         urlPlaceholder: 'Your profile or portfolio link',  urlLabel: 'Portfolio / Profile URL' },
];

function SubmitForm({ lane, onClose }: { lane: LaneTile; onClose: () => void }) {
  const router = useRouter();
  const [title,   setTitle]   = useState('');
  const [url,     setUrl]     = useState('');
  const [genre,   setGenre]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) { setError('Title and URL are required.'); return; }
    setError(''); setLoading(true);
    const submitterId = (typeof window !== 'undefined' && sessionStorage.getItem('tmi_user_id')) || 'guest-user';
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submitterId, title: title.trim(), type: lane.id, url: url.trim(), genre: genre.trim() || undefined, description: desc.trim() || undefined }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Submission failed. Try again.'); setLoading(false); return;
      }
      const data = (await res.json()) as { submissionId: string; shareUrl?: string };
      router.push(`/submit/confirm?id=${encodeURIComponent(data.submissionId)}&share=${encodeURIComponent(data.shareUrl ?? '')}&type=${lane.id}&title=${encodeURIComponent(title.trim())}`);
    } catch {
      setError('Network error. Check your connection.'); setLoading(false);
    }
  }

  const inp: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" };
  const lbl: React.CSSProperties = { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 700 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(5,5,16,0.92)', backdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#0a0a1a', border: `1.5px solid ${lane.accent}44`, padding: 32, boxShadow: `0 0 40px ${lane.accent}22`, position: 'relative' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 22, cursor: 'pointer' }}>×</button>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{lane.emoji}</div>
        <h2 style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 26, color: lane.accent, letterSpacing: '0.04em', marginBottom: 4 }}>{lane.formTitle}</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>{lane.sub}</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={lbl}>Title *</label><input style={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Name of your track / entry" maxLength={80} required /></div>
          <div><label style={lbl}>{lane.urlLabel} *</label><input style={inp} value={url} onChange={e => setUrl(e.target.value)} placeholder={lane.urlPlaceholder} type="url" required /></div>
          <div><label style={lbl}>Genre</label><input style={inp} value={genre} onChange={e => setGenre(e.target.value)} placeholder="Hip-Hop, R&B, Pop…" maxLength={40} /></div>
          <div><label style={lbl}>Description (optional)</label><textarea style={{ ...inp, resize: 'vertical', minHeight: 72 } as React.CSSProperties} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Tell us about this entry…" maxLength={400} /></div>
          {error && <p style={{ color: '#FF4444', fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ background: lane.accent, color: '#000', border: 'none', padding: '12px 0', fontWeight: 900, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Submitting…' : '🚀 Submit Now'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  const [activeLane, setActiveLane] = useState<LaneTile | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '64px 20px 40px' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.25em', color: '#FF2DAA', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>The Musician&apos;s Index</p>
        <h1 style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 'clamp(44px,9vw,90px)', lineHeight: 0.9, letterSpacing: '0.03em', background: 'linear-gradient(135deg,#00FFFF 0%,#AA2DFF 50%,#FF2DAA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12 }}>STAGE DOOR</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', maxWidth: 420, margin: '0 auto', lineHeight: 1.5 }}>Your submission enters the machine. Earn XP, earn spins, earn your spot at the top.</p>
      </div>

      {/* Lane Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
        {LANES.map(lane => (
          <button key={lane.id} onClick={() => setActiveLane(lane)}
            style={{ background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${lane.accent}33`, padding: '28px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.border = `1.5px solid ${lane.accent}99`; el.style.background = `${lane.accent}10`; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 0 24px ${lane.accent}22`; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.border = `1.5px solid ${lane.accent}33`; el.style.background = 'rgba(255,255,255,0.04)'; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{lane.emoji}</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: lane.accent, marginBottom: 6 }}>{lane.label}</div>
            <div style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 22, color: '#fff', letterSpacing: '0.04em', marginBottom: 6 }}>{lane.headline}</div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>{lane.sub}</p>
            <div style={{ position: 'absolute', bottom: 14, right: 16, fontSize: 18, color: lane.accent, opacity: 0.5 }}>→</div>
          </button>
        ))}
      </div>

      {/* How the Loop Works */}
      <div style={{ maxWidth: 900, margin: '56px auto 0', padding: '0 20px' }}>
        <h2 style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 28, letterSpacing: '0.06em', color: '#fff', marginBottom: 24, textAlign: 'center' }}>HOW THE LOOP WORKS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
          {[
            { step: '01', title: 'SUBMIT',     desc: 'Drop your work. Earn 50 XP instantly.',    color: '#00FFFF' },
            { step: '02', title: 'ROTATE',     desc: 'Your track enters the live rotation.',      color: '#AA2DFF' },
            { step: '03', title: 'SHARE',      desc: 'Your viral link is auto-generated.',        color: '#FF2DAA' },
            { step: '04', title: 'TRACK',      desc: 'Watch your spins, clicks, and fans grow.', color: '#FFD700' },
            { step: '05', title: 'MONETIZE',   desc: 'Tips, boosts, and sponsorships unlock.',   color: '#00FFFF' },
          ].map(s => (
            <div key={s.step} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '18px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', color: s.color, marginBottom: 6 }}>{s.step}</div>
              <div style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 18, color: '#fff', letterSpacing: '0.06em', marginBottom: 4 }}>{s.title}</div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {activeLane && <SubmitForm lane={activeLane} onClose={() => setActiveLane(null)} />}
    </div>
  );
}
