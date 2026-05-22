'use client';

import { getAllDrafts } from '@/lib/outreach/OutreachDraftEngine';
import { motion } from 'framer-motion';

const TYPE_COLORS: Record<string, string> = {
  'social-post-general': '#00FF88',
  'social-post-performer': '#FF2DAA',
  'social-post-fan': '#00FFFF',
  'sponsor-pitch': '#FFD700',
  'venue-pitch': '#FF6B35',
  'performer-invite': '#AA2DFF',
  'advertiser-pitch': '#ADFF2F',
  'writer-invite': '#FF9F43',
};

export default function OutreachDraftsPage() {
  const drafts = getAllDrafts();

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#AA2DFF', fontWeight: 800, marginBottom: 8 }}>
          ADMIN · OUTREACH
        </div>
        <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900 }}>Outreach Drafts</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 32 }}>
          {drafts.length} ready-to-send drafts. Copy and paste into each channel. Nothing auto-posts.
        </p>

        {/* Revenue fastest paths */}
        <div style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 12, padding: '18px 20px', marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FFD700', fontWeight: 800, marginBottom: 12 }}>
            💰 DO THESE FIRST — FASTEST PATH TO MONEY
          </div>
          {[
            '1. Post social-general-1 on Twitter/X — 30 seconds',
            '2. DM performer-invite-1 to 5 artists you know personally',
            '3. Send sponsor-pitch-local-1 to any local business near you',
            '4. Post reddit-hiphop-1 on r/hiphopheads or r/makinghiphop',
            '5. Share discord-music-1 in any music Discord server you\'re already in',
          ].map((p, i) => (
            <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6, paddingLeft: 4 }}>{p}</div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {drafts.map((draft, i) => {
            const accent = TYPE_COLORS[draft.type] ?? '#AA2DFF';
            return (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ background: `${accent}08`, border: `1px solid ${accent}30`, borderRadius: 12, padding: '20px 22px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: '0.25em', color: accent, fontWeight: 800, marginBottom: 4 }}>
                      {draft.type.toUpperCase().replace(/-/g, ' ')} · {draft.channel}
                    </div>
                    {draft.subject && (
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{draft.subject}</div>
                    )}
                  </div>
                  <div style={{ fontSize: 10, padding: '4px 10px', background: `${accent}20`, color: accent, borderRadius: 20, fontWeight: 800, letterSpacing: '0.1em', flexShrink: 0 }}>
                    {draft.status.toUpperCase()}
                  </div>
                </div>

                <pre style={{ margin: '0 0 14px', fontSize: 13, color: 'rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.3)', padding: '12px 14px', borderRadius: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7, fontFamily: 'inherit' }}>
                  {draft.body}
                </pre>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { void navigator.clipboard?.writeText(draft.body); }}
                    style={{ padding: '8px 16px', background: `${accent}20`, color: accent, border: `1px solid ${accent}40`, borderRadius: 7, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
                  >
                    📋 COPY POST
                  </button>
                  <a
                    href={draft.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}
                  >
                    {draft.callToAction} →
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
