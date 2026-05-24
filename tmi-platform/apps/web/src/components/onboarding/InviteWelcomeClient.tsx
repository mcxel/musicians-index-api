'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type InviteRole = 'performer' | 'fan' | 'promoter' | 'admin';

const ROLE_LABEL: Record<InviteRole, string> = {
  performer: 'ARTIST / PERFORMER',
  fan: 'FAN',
  promoter: 'PROMOTER',
  admin: 'ADMIN',
};

const ROLE_COLOR: Record<InviteRole, string> = {
  performer: '#FF2DAA',
  fan: '#00FFFF',
  promoter: '#38bdf8',
  admin: '#FFD700',
};

export default function InviteWelcomeClient({
  inviteeName,
  role,
  token,
}: {
  inviteeName: string;
  role: InviteRole;
  token: string;
}) {
  const color = ROLE_COLOR[role] ?? '#00FFFF';
  const signupUrl = `/signup?token=${encodeURIComponent(token)}&role=${role.toUpperCase()}`;

  // Persist invite token so returning users pick up where they left off
  useEffect(() => {
    try {
      localStorage.setItem('tmi_invite_code', token);
    } catch { /* localStorage unavailable */ }
  }, [token, role, inviteeName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: 'rgba(5,5,16,0.97)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        style={{
          border: `1px solid ${color}55`,
          boxShadow: `0 0 60px ${color}18`,
          background: '#060410',
          borderRadius: '2rem',
          padding: '48px 40px',
          maxWidth: 480,
          width: '90%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: '0.35em', color, fontWeight: 800, marginBottom: 8 }}>
          ACCESS GRANTED · {ROLE_LABEL[role] ?? role.toUpperCase()}
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: 1, marginBottom: 12, lineHeight: 1.1 }}>
          Welcome to<br />The Musician&apos;s Index
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 32 }}>
          {inviteeName}, your invite is confirmed. Create your account to activate your access, seed your wallet, and join the platform.
        </p>

        <Link
          href={signupUrl}
          style={{
            display: 'block',
            padding: '14px 0',
            background: `linear-gradient(135deg, ${color}, ${color}88)`,
            color: '#050510',
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: '0.18em',
            borderRadius: 40,
            textDecoration: 'none',
            marginBottom: 14,
          }}
        >
          CREATE YOUR ACCOUNT →
        </Link>

        <Link
          href="/auth"
          style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
        >
          Already have an account? Sign in
        </Link>
      </motion.div>
    </motion.div>
  );
}
