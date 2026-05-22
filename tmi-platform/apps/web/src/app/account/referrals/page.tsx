'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const PLATFORM_URL = 'https://themusiciansindex.com';

export default function AccountReferralsPage() {
  const inviteLink = `${PLATFORM_URL}/join`;

  const socialPosts = [
    {
      channel: 'Facebook / Discord',
      accent: '#AA2DFF',
      body: `I just launched something new. If you're a performer, comedian, dancer, or just love watching talent live, check this out.\nYou can go live, compete, collaborate, and actually get seen. Free to join.\n👉 ${PLATFORM_URL}/join`,
    },
    {
      channel: 'Twitter / X',
      accent: '#00FFFF',
      body: `🎵 TMI is live. Go live, battle, earn — free.\n${PLATFORM_URL}/join #MusicPlatform #LiveBattle`,
    },
    {
      channel: 'Performer DM',
      accent: '#FF2DAA',
      body: `Hey! Wanted to invite you personally to The Musician's Index. You can go live, battle, earn tips + prize pools. Free to start.\n${PLATFORM_URL}/join`,
    },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#AA2DFF', fontWeight: 800, marginBottom: 8 }}>
          ACCOUNT · INVITE &amp; EARN
        </div>
        <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900 }}>Invite &amp; Earn XP</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 32 }}>
          Earn 500 XP per qualified invite · 5,000 XP bonus at 5 qualified invites
        </p>

        {/* Rewards summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'Per Invite', value: '500 XP', color: '#FFD700' },
            { label: 'Milestone Bonus', value: '5,000 XP', color: '#AA2DFF' },
            { label: 'Milestone At', value: '5 Invites', color: '#00FFFF' },
            { label: 'Works For', value: 'Fans + Performers', color: '#FF2DAA' },
          ].map((s) => (
            <div key={s.label} style={{ padding: '14px 16px', background: `${s.color}10`, border: `1px solid ${s.color}30`, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', marginTop: 4 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Your invite link */}
        <div style={{ background: 'rgba(170,45,255,0.1)', border: '1.5px solid rgba(170,45,255,0.35)', borderRadius: 12, padding: '18px 20px', marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#AA2DFF', fontWeight: 800, marginBottom: 8 }}>YOUR INVITE LINK</div>
          <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#fff', marginBottom: 12, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 6, wordBreak: 'break-all' }}>
            {inviteLink}
          </div>
          <button
            onClick={() => { void navigator.clipboard?.writeText(inviteLink); }}
            style={{ padding: '9px 18px', background: '#AA2DFF', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
          >
            📋 COPY LINK
          </button>
        </div>

        {/* Ready-to-send posts */}
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginBottom: 14 }}>
          READY-TO-SEND POSTS — COPY &amp; PASTE
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {socialPosts.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{ background: `${p.accent}08`, border: `1px solid ${p.accent}30`, borderRadius: 10, padding: '16px 18px' }}
            >
              <div style={{ fontSize: 10, letterSpacing: '0.2em', color: p.accent, fontWeight: 800, marginBottom: 8 }}>{p.channel.toUpperCase()}</div>
              <pre style={{ margin: '0 0 12px', fontSize: 13, color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7, fontFamily: 'inherit', background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 7 }}>
                {p.body}
              </pre>
              <button
                onClick={() => { void navigator.clipboard?.writeText(p.body); }}
                style={{ padding: '7px 14px', background: `${p.accent}20`, color: p.accent, border: `1px solid ${p.accent}40`, borderRadius: 6, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
              >
                📋 COPY
              </button>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/battles/lobby-wall" style={{ padding: '10px 20px', background: '#00FFFF', color: '#000', borderRadius: 8, fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>
            ⚔️ Watch Battles
          </Link>
          <Link href="/cypher/lobby-wall" style={{ padding: '10px 20px', background: 'rgba(170,45,255,0.2)', color: '#AA2DFF', border: '1px solid rgba(170,45,255,0.4)', borderRadius: 8, fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>
            🎤 Join a Cipher
          </Link>
          <Link href="/account" style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>
            ← Back to Account
          </Link>
        </div>
      </div>
    </main>
  );
}
