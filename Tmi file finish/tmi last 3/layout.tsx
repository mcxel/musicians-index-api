/**
 * layout.tsx
 * Repo: apps/web/src/app/contest/admin/layout.tsx
 * Action: CREATE | Wave: W4
 * CRITICAL: This protects ALL /contest/admin/* routes.
 * Must be placed BEFORE any admin page files.
 *
 * WIRING REQUIRED BY COPILOT:
 * Replace getServerSession/authOptions with your actual auth method.
 * The pattern below works with NextAuth v4.
 * If using a different auth system, adapt the session check accordingly.
 */

import { redirect } from 'next/navigation';

// ── Replace these imports with your actual auth method ─────────────────────
// Option A: NextAuth v4
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

// Option B: Custom session helper
// import { getSession } from '@/lib/session';

// Option C: Clerk
// import { auth } from '@clerk/nextjs';

// For now, stub returns null (unauthenticated) — wire your real auth here
async function getAdminSession(): Promise<{ role: string } | null> {
  // TODO: Replace this stub with your actual session check
  // Example with NextAuth:
  // const session = await getServerSession(authOptions);
  // return session?.user as any ?? null;

  // Example with custom session:
  // return getSession();

  return null; // Stub — wire before using admin pages
}

interface ContestAdminLayoutProps {
  children: React.ReactNode;
}

export default async function ContestAdminLayout({ children }: ContestAdminLayoutProps) {
  const session = await getAdminSession();

  // Guard: only admins may access /contest/admin/*
  // Adjust role check to match your RBAC system
  if (!session || (session as any).role !== 'admin') {
    redirect('/auth');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070a0f', color: '#fff' }}>
      {/* Admin nav bar */}
      <nav style={{
        background: '#0a0d14',
        borderBottom: '1px solid rgba(255,107,26,.2)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#ff6b1a', marginRight: 16, letterSpacing: '.1em' }}>
          CONTEST ADMIN
        </span>
        {[
          { label: 'Overview', href: '/contest/admin' },
          { label: 'Contestants', href: '/contest/admin/contestants' },
          { label: 'Sponsors', href: '/contest/admin/sponsors' },
          { label: 'Reveal', href: '/contest/admin/reveal' },
          { label: 'Payouts', href: '/contest/admin/payouts' },
          { label: 'Seasons', href: '/contest/admin/seasons' },
          { label: 'Audit', href: '/contest/admin/audit' },
        ].map(link => (
          <a
            key={link.label}
            href={link.href}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,.5)',
              textDecoration: 'none',
              padding: '5px 12px',
              borderRadius: 6,
              border: '1px solid transparent',
              transition: 'all .15s',
            }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Page content */}
      <div>{children}</div>
    </div>
  );
}
