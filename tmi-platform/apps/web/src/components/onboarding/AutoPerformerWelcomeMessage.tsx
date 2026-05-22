'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

type AutoPerformerWelcomeMessageProps = {
  displayName: string;
  username?: string;
};

const PLATFORM_URL = 'https://themusiciansindex.com';

export default function AutoPerformerWelcomeMessage({ displayName, username }: AutoPerformerWelcomeMessageProps) {
  const inviteLink = username ? `${PLATFORM_URL}/join?ref=${encodeURIComponent(username)}` : `${PLATFORM_URL}/join`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(135deg, rgba(255,45,170,0.14), rgba(170,45,255,0.10))',
        border: '1.5px solid rgba(255,45,170,0.4)',
        borderRadius: 14,
        padding: '28px 28px 20px',
        maxWidth: 540,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.35em', color: '#FF2DAA', fontWeight: 800, marginBottom: 12 }}>
        WELCOME TO THE STAGE
      </div>

      <h2 style={{ margin: '0 0 16px', fontSize: 22, color: '#fff', lineHeight: 1.2 }}>
        Welcome to The Musician&apos;s Index{displayName ? `, ${displayName}` : ''} 🔥
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {[
          "You're live on a global stage now.",
          'Start your first live session, drop your music, or enter a challenge.',
          'Want to grow fast? Invite your fans and other performers.',
          'The more people you bring in, the more attention you get.',
        ].map((line, i) => (
          <p key={i} style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.82)', lineHeight: 1.65 }}>
            {line}
          </p>
        ))}
      </div>

      <div style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#FFD700', fontWeight: 800, marginBottom: 8 }}>
          🚀 INVITE REWARDS — LAUNCH DOUBLE XP (UNTIL AUG 2026)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px 12px', fontSize: 11, marginBottom: 8 }}>
          {[
            ['Tier', 'Normal', 'Launch 2×'],
            ['Free join', '500 XP', '1,000 XP'],
            ['Pro', '750 XP', '1,500 XP'],
            ['Bronze', '1,000 XP', '2,000 XP'],
            ['Silver', '1,250 XP', '2,500 XP'],
            ['Gold', '1,500 XP', '3,000 XP'],
            ['Platinum', '2,000 XP', '4,000 XP'],
            ['Diamond', '2,500 XP', '5,000 XP'],
          ].map(([tier, normal, launch], i) => (
            <>
              <span key={`t${i}`} style={{ color: i === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.75)', fontWeight: i === 0 ? 800 : 400 }}>{tier}</span>
              <span key={`n${i}`} style={{ color: i === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.5)', fontWeight: i === 0 ? 800 : 400 }}>{normal}</span>
              <span key={`l${i}`} style={{ color: i === 0 ? '#FFD700' : '#FFD700', fontWeight: 800 }}>{launch}</span>
            </>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
          5 qualified invites → <strong style={{ color: '#FFD700' }}>+10,000 XP milestone bonus</strong> during launch
        </div>
      </div>

      <div style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#FFD700', fontWeight: 800, marginBottom: 6 }}>YOUR PERSONAL INVITE LINK</div>
        <div style={{ fontSize: 13, color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{inviteLink}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Invite fans AND performers — you earn XP for both</div>
      </div>

      <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 18px' }}>
        Your stage is ready. Let&apos;s go.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link
          href="/cypher/live"
          style={{ padding: '11px 22px', background: '#FF2DAA', color: '#fff', borderRadius: 8, fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: '0.08em' }}
        >
          🎤 GO LIVE NOW
        </Link>
        <Link
          href="/challenges"
          style={{ padding: '11px 22px', background: 'rgba(170,45,255,0.2)', color: '#AA2DFF', border: '1px solid rgba(170,45,255,0.4)', borderRadius: 8, fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: '0.08em' }}
        >
          🏆 ENTER CHALLENGE
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
