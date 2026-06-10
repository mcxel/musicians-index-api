'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AgentCommandCenter from '@/components/agents/AgentCommandCenter';

type DirectiveType = "priority" | "feature" | "policy" | "override";
interface Directive { id: string; type: DirectiveType; text: string; ts: string; status: "pending" | "in-review" | "applied"; }

const DIRECTIVE_COLORS: Record<DirectiveType, string> = {
  priority: "#FF2DAA", feature: "#00FFFF", policy: "#FFD700", override: "#ef4444",
};

const SEED_DIRECTIVES: Directive[] = [
  { id: "d1", type: "priority", text: "Revenue paths must be live and verified before any cosmetic work proceeds.", ts: "Jun 1", status: "applied" },
  { id: "d2", type: "policy",   text: "Big Ace must approve all cash payouts — no exceptions.", ts: "May 28", status: "applied" },
  { id: "d3", type: "feature",  text: "Add song/video auto-submission pipeline for playlist, streaming win, and challenges.", ts: "Jun 8", status: "pending" },
];

type SubmitDest = "playlist" | "stream-win" | "challenges" | "dance-party" | "radio";

const DEST_LABELS: Record<SubmitDest, string> = {
  playlist: "TMI Playlist", "stream-win": "Stream & Win", challenges: "Challenges", "dance-party": "World Dance Party", radio: "Radio",
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(0,0,0,0.5)",
  border: "1px solid rgba(255,215,0,0.15)",
  borderRadius: 6, padding: "7px 10px",
  color: "#f1f5f9", fontSize: 11, outline: "none", fontFamily: "inherit",
};

export default function MarcelExecutiveDashboard() {
  const [directives, setDirectives] = useState<Directive[]>(SEED_DIRECTIVES);
  const [newDirective, setNewDirective] = useState("");
  const [dirType, setDirType] = useState<DirectiveType>("priority");
  const [dirSent, setDirSent] = useState(false);

  const [songTitle, setSongTitle] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [songDests, setSongDests] = useState<Set<SubmitDest>>(new Set(["playlist", "stream-win"]));
  const [songSubmitting, setSongSubmitting] = useState(false);
  const [songSubmitted, setSongSubmitted] = useState(false);

  function issueDirective(e: React.FormEvent) {
    e.preventDefault();
    if (!newDirective.trim()) return;
    const d: Directive = {
      id: `d${Date.now()}`,
      type: dirType,
      text: newDirective.trim(),
      ts: "Just now",
      status: "pending",
    };
    setDirectives(prev => [d, ...prev]);
    setNewDirective("");
    setDirSent(true);
    setTimeout(() => setDirSent(false), 3000);
  }

  function toggleDest(dest: SubmitDest) {
    setSongDests(prev => {
      const next = new Set(prev);
      if (next.has(dest)) next.delete(dest); else next.add(dest);
      return next;
    });
  }

  async function submitSong(e: React.FormEvent) {
    e.preventDefault();
    if (!songUrl.trim()) return;
    setSongSubmitting(true);
    try {
      const destinations = Array.from(songDests);
      const trackId = `marcel-${Date.now()}`;
      await Promise.allSettled(
        destinations.map(dest => {
          if (dest === "stream-win") {
            return fetch("/api/stream-win/submit-song", {
              method: "POST", credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ artistId: "marcel", title: songTitle || "Untitled", genre: "general", audioUrl: songUrl }),
            });
          }
          if (dest === "playlist") {
            return fetch("/api/playlists", {
              method: "POST", credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "register-track", track: { id: trackId, catalog: "BERNOUTGLOBAL_CATALOG", title: songTitle || "Untitled", audioUrl: songUrl, artistId: "marcel" } }),
            }).then(() =>
              fetch("/api/playlists", {
                method: "POST", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "distribute", trackId }),
              })
            );
          }
          return Promise.resolve();
        })
      );
      setSongTitle("");
      setSongUrl("");
      setSongDests(new Set(["playlist", "stream-win"]));
      setSongSubmitted(true);
      setTimeout(() => setSongSubmitted(false), 4000);
    } finally {
      setSongSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,215,0,0.3)', paddingBottom: 20, marginBottom: 30 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#FFD700', fontWeight: 900, marginBottom: 8 }}>EXECUTIVE OVERRIDE · FOUNDER</div>
            <h1 style={{ fontSize: 36, margin: 0, fontFamily: 'var(--font-orbitron, Impact)', letterSpacing: '0.05em' }}>MARCEL <span style={{ color: '#fff' }}>COMMAND</span></h1>
          </div>
          <Link href="/admin" style={{ color: '#FFD700', fontSize: 11, textDecoration: 'none', border: '1px solid #FFD70044', padding: '6px 12px', borderRadius: 6 }}>← ADMIN ROOT</Link>
        </div>

        {/* Revenue KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 36 }}>
          {[
            { label: "Global Revenue",  value: "$14,240",  sub: ".00", color: "#FFD700" },
            { label: "Active Users",    value: "8,412",    sub: "",    color: "#00FF88" },
            { label: "Live Streams",    value: "42",       sub: "",    color: "#FF2DAA" },
          ].map(m => (
            <div key={m.label} style={{ background: `rgba(${m.color === "#FFD700" ? "255,215,0" : m.color === "#00FF88" ? "0,255,136" : "255,45,170"},0.05)`, border: `1px solid ${m.color}33`, padding: 24, borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: m.color, fontFamily: 'var(--font-orbitron, Impact)' }}>
                {m.value}<span style={{ fontSize: 16 }}>{m.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 24, marginBottom: 32 }}>

          {/* LEFT — Agent command + directives */}
          <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
            <div>
              <h2 style={{ fontSize: 16, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10, marginBottom: 16 }}>System Agents & Bots</h2>
              <AgentCommandCenter />
            </div>

            {/* Founder Directives board */}
            <div style={{ border: '1px solid rgba(255,45,170,0.25)', borderRadius: 14, background: 'rgba(20,5,15,0.7)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,45,170,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#FF2DAA', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800 }}>Founder Directives</strong>
                <span style={{ color: '#64748b', fontSize: 9 }}>{directives.filter(d => d.status === "pending").length} pending</span>
              </div>
              <div style={{ padding: 14, display: 'grid', gap: 8 }}>
                {directives.map(d => (
                  <div key={d.id} style={{ border: `1px solid ${DIRECTIVE_COLORS[d.type]}22`, borderRadius: 8, background: 'rgba(255,255,255,0.03)', padding: '8px 12px' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: DIRECTIVE_COLORS[d.type], border: `1px solid ${DIRECTIVE_COLORS[d.type]}44`, borderRadius: 4, padding: '1px 6px' }}>{d.type}</span>
                      <span style={{ fontSize: 9, color: '#475569' }}>{d.ts}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 9, color: d.status === "applied" ? "#22c55e" : d.status === "in-review" ? "#f59e0b" : "#94a3b8", textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 10, color: '#f1f5f9', lineHeight: 1.4 }}>{d.text}</p>
                  </div>
                ))}
              </div>

              {/* Issue new directive */}
              <div style={{ borderTop: '1px solid rgba(255,45,170,0.12)', padding: 14 }}>
                <p style={{ margin: '0 0 8px', fontSize: 9, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Issue New Directive</p>
                <form onSubmit={issueDirective} style={{ display: 'grid', gap: 8 }}>
                  <select
                    value={dirType}
                    onChange={e => setDirType(e.target.value as DirectiveType)}
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 9px', color: '#f1f5f9', fontSize: 11, outline: 'none' }}
                  >
                    <option value="priority">Priority</option>
                    <option value="feature">Feature</option>
                    <option value="policy">Policy</option>
                    <option value="override">Override</option>
                  </select>
                  <textarea
                    value={newDirective}
                    onChange={e => setNewDirective(e.target.value)}
                    placeholder="State the directive..."
                    rows={2}
                    required
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '7px 9px', color: '#f1f5f9', fontSize: 11, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  />
                  <button
                    type="submit"
                    style={{ width: 'fit-content', borderRadius: 6, border: '1px solid rgba(255,45,170,0.4)', background: 'rgba(120,10,60,0.55)', color: dirSent ? '#86efac' : '#FF2DAA', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '7px 16px', cursor: 'pointer' }}
                  >
                    {dirSent ? '✓ Directive Issued' : 'Issue Directive →'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT — Song submission panel */}
          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
            <div style={{ border: '1px solid rgba(0,255,255,0.25)', borderRadius: 14, background: 'rgba(0,10,20,0.75)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,255,255,0.15)' }}>
                <strong style={{ color: '#00FFFF', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800 }}>Submit Song / Video</strong>
                <p style={{ margin: '3px 0 0', fontSize: 9, color: '#64748b', lineHeight: 1.5 }}>
                  Auto-routes to selected destinations. Audio or video URL, or upload.
                </p>
              </div>
              <div style={{ padding: 16 }}>
                {songSubmitted ? (
                  <div style={{ border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, background: 'rgba(5,46,22,0.3)', padding: 14 }}>
                    <p style={{ margin: 0, color: '#86efac', fontSize: 11, fontWeight: 700 }}>✓ Submitted to {songDests.size} destinations successfully</p>
                  </div>
                ) : (
                  <form onSubmit={submitSong} style={{ display: 'grid', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 9, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Song / Video Title</label>
                      <input value={songTitle} onChange={e => setSongTitle(e.target.value)} placeholder="e.g. My New Track" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 9, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>URL (SoundCloud / YouTube / Drive) *</label>
                      <input type="url" value={songUrl} onChange={e => setSongUrl(e.target.value)} placeholder="https://..." required style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 9, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Destinations</label>
                      <div style={{ display: 'grid', gap: 5 }}>
                        {(Object.keys(DEST_LABELS) as SubmitDest[]).map(dest => (
                          <label key={dest} style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={songDests.has(dest)}
                              onChange={() => toggleDest(dest)}
                              style={{ accentColor: '#00FFFF', width: 13, height: 13 }}
                            />
                            <span style={{ fontSize: 10, color: songDests.has(dest) ? '#f1f5f9' : '#64748b', transition: 'color 0.15s' }}>
                              {DEST_LABELS[dest]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={songSubmitting || songDests.size === 0}
                      style={{ borderRadius: 7, border: '1px solid rgba(0,255,255,0.4)', background: 'rgba(0,80,80,0.55)', color: '#00FFFF', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '9px 14px', cursor: songSubmitting || songDests.size === 0 ? 'not-allowed' : 'pointer', opacity: songDests.size === 0 ? 0.5 : 1 }}
                    >
                      {songSubmitting ? "Submitting..." : `Submit to ${songDests.size} Destination${songDests.size !== 1 ? "s" : ""} →`}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 18 }}>
              <h2 style={{ fontSize: 13, marginTop: 0, marginBottom: 14, color: '#FFD700' }}>Executive Quick Links</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { href: '/admin/big-ace', label: 'Big Ace Hub' },
                  { href: '/admin/mc-michael-charlie', label: 'Michael Charlie' },
                  { href: '/admin/observatory', label: 'Observatory' },
                  { href: '/admin/revenue', label: 'Revenue' },
                  { href: '/admin/network-health', label: 'Network Health' },
                  { href: '/admin/payouts', label: 'Payouts' },
                ].map(link => (
                  <Link key={link.href} href={link.href} style={{ padding: '8px 14px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.25)', color: '#FFD700', borderRadius: 8, fontSize: 10, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
