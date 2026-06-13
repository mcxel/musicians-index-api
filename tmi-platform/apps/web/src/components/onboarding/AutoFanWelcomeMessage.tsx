'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

type AutoFanWelcomeMessageProps = {
  displayName: string;
  username?: string;
};

const PLATFORM_URL = 'https://themusiciansindex.com';

export default function AutoFanWelcomeMessage({ displayName, username }: AutoFanWelcomeMessageProps) {
  const inviteLink = username
    ? `${PLATFORM_URL}/join?ref=${encodeURIComponent(username)}`
    : `${PLATFORM_URL}/join`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(135deg, rgba(0,255,255,0.12), rgba(170,45,255,0.08))',
        border: '1.5px solid rgba(0,255,255,0.4)',
        borderRadius: 14,
        padding: '28px 28px 20px',
        maxWidth: 540,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.35em', color: '#00FFFF', fontWeight: 800, marginBottom: 12 }}>
        WELCOME TO THE CROWD
      </div>

      <h2 style={{ margin: '0 0 16px', fontSize: 22, color: '#fff', lineHeight: 1.2 }}>
        You&apos;re in{displayName ? `, ${displayName}` : ''}! 🎧
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {[
          "Watch live battles, ciphers, and concerts — all free.",
          'Vote in real-time and your vote actually counts.',
          'Earn XP for every vote, tip, and invite.',
          'Know a performer? Invite them — you both level up when they join.',
          'Know another fan? Bring them in too — more fans means bigger prize pools for everyone.',
        ].map((line, i) => (
          <p key={i} style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.65 }}>
            {line}
          </p>
        ))}
      </div>

      {/* Points system callout */}
      <div style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
          🚀 INVITE REWARDS — LAUNCH DOUBLE XP (UNTIL AUG 2026)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 12px', fontSize: 11, marginBottom: 8 }}>
          {[
            ['Tier', 'Normal', 'Launch 2×'],
            ['Free join', '500 XP', '1,000 XP'],
            ['Pro', '750 XP', '1,500 XP'],
            ['RUBY', '1,000 XP', '2,000 XP'],
            ['Silver', '1,250 XP', '2,500 XP'],
            ['Gold', '1,500 XP', '3,000 XP'],
            ['Platinum', '2,000 XP', '4,000 XP'],
            ['Diamond', '2,500 XP', '5,000 XP'],
          ].map(([tier, normal, launch], i) => (
            <>
              <span key={`t${i}`} style={{ color: i === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.75)', fontWeight: i === 0 ? 800 : 400 }}>{tier}</span>
              <span key={`n${i}`} style={{ color: i === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.45)' }}>{normal}</span>
              <span key={`l${i}`} style={{ color: '#FFD700', fontWeight: 800 }}>{launch}</span>
            </>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          5 qualified invites → <strong style={{ color: '#FFD700' }}>+10,000 XP milestone bonus</strong> during launch
        </div>
      </div>

      {/* Invite link */}
      <div style={{ background: 'rgba(0,255,255,0.07)', border: '1px solid rgba(0,255,255,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#00FFFF', fontWeight: 800, marginBottom: 6 }}>YOUR PERSONAL INVITE LINK</div>
        <div style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{inviteLink}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
          Share with performers AND fans — you earn XP for both
        </div>
      </div>

      <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 18px' }}>
        The show is live. Let&apos;s go.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link
          href="/battles/lobby-wall"
          style={{ padding: '11px 22px', background: '#00FFFF', color: '#000', borderRadius: 8, fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: '0.08em' }}
        >
          🎧 WATCH LIVE BATTLES
        </Link>
        <Link
          href="/battles"
          style={{ padding: '11px 22px', background: 'rgba(170,45,255,0.2)', color: '#AA2DFF', border: '1px solid rgba(170,45,255,0.4)', borderRadius: 8, fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: '0.08em' }}
        >
          🗳️ VOTE NOW
        </Link>
        <button
          onClick={() => { void navigator.clipboard?.writeText(inviteLink); }}
          style={{ padding: '11px 22px', background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.35)', borderRadius: 8, fontWeight: 900, fontSize: 13, cursor: 'pointer', letterSpacing: '0.08em' }}
        >
          📤 COPY INVITE LINK
        </button>
      </div>
    </motion.div>
  );
}
