'use client';

/**
 * Rule 26 — Identity Policy gate.
 *
 * Avatar ownership/customization is Fan-only.  Performers are represented
 * by their real photos and videos, not virtual avatars.  Admins and Staff
 * may enter for QA/oversight purposes.
 *
 * Every route under /avatar/* is covered by this layout — no need to add
 * RoleGate to each individual page.  For components embedded elsewhere,
 * use <RoleGate allow={['FAN','ADMIN','STAFF']}> directly.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import RoleGate from '@/components/auth/RoleGate';

const FAN_ONLY_FALLBACK = (
  <div
    style={{
      minHeight: '100vh',
      background: '#050510',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      fontFamily: 'inherit',
    }}
  >
    <div style={{ fontSize: 52 }}>🎭</div>
    <div
      style={{
        color: '#FF2DAA',
        fontSize: 12,
        letterSpacing: 4,
        textTransform: 'uppercase',
      }}
    >
      Fan Accounts Only
    </div>
    <p
      style={{
        color: '#aaa',
        fontSize: 15,
        textAlign: 'center',
        maxWidth: 420,
        margin: 0,
        lineHeight: 1.6,
      }}
    >
      Avatar customization is exclusive to Fan accounts.
      <br />
      Performers are represented by their real photos and videos.
    </p>
    <Link
      href="/hub"
      style={{
        marginTop: 8,
        padding: '10px 28px',
        background: 'rgba(255,45,170,0.12)',
        border: '1px solid #FF2DAA',
        borderRadius: 8,
        color: '#FF2DAA',
        fontSize: 13,
        textDecoration: 'none',
        letterSpacing: 1,
      }}
    >
      ← Back to Hub
    </Link>
  </div>
);

export default function AvatarSectionLayout({ children }: { readonly children: ReactNode }) {
  return (
    <RoleGate allow={['FAN', 'ADMIN', 'STAFF']} fallback={FAN_ONLY_FALLBACK}>
      {children}
    </RoleGate>
  );
}
