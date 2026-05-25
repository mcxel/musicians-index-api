'use client';

import { useRouter, usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: '🏠', title: 'Home', href: '/home/1' },
  { label: '📰', title: 'Magazine', href: '/home/2' },
  { label: '⚔️', title: 'Arena', href: '/battles' },
  { label: '🎥', title: 'Live', href: '/live/lobby' },
  { label: '🧠', title: 'Overseer', href: '/admin/overseer' },
  { label: '🎤', title: 'Performers', href: '/performers' },
];

export default function TMIGlobalNav() {
  const router = useRouter();
  const pathname = usePathname() ?? '';

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        gap: 6,
        background: 'rgba(5,3,16,0.92)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(0,255,255,0.18)',
        borderRadius: 40,
        padding: '6px 10px',
        boxShadow: '0 0 30px rgba(0,255,255,0.12), 0 4px 24px rgba(0,0,0,0.6)',
      }}
      aria-label="Global navigation"
    >
      {NAV_ITEMS.map(({ label, title, href }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <button
            key={href}
            title={title}
            onClick={() => router.push(href)}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              border: active
                ? '1.5px solid #00FFFF'
                : '1.5px solid transparent',
              background: active
                ? 'rgba(0,255,255,0.14)'
                : 'transparent',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: active ? '0 0 10px rgba(0,255,255,0.3)' : 'none',
            }}
          >
            {label}
          </button>
        );
      })}

      {/* Hard reset — always goes home */}
      <div
        style={{
          width: 1,
          height: 24,
          background: 'rgba(255,255,255,0.1)',
          alignSelf: 'center',
          margin: '0 2px',
        }}
      />
      <button
        title="Hard Reset → Home"
        onClick={() => router.push('/home/1')}
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,215,0,0.5)',
          background: 'rgba(255,215,0,0.1)',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 900,
          color: '#FFD700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          letterSpacing: '-0.02em',
        }}
      >
        ↺
      </button>
    </nav>
  );
}
