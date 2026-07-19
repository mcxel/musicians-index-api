'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HOME_TABS = [
  { href: '/home/1',   label: 'Home 1'   },
  { href: '/home/1-2', label: 'Home 1-2' },
  { href: '/home/2',   label: 'Home 2'   },
  { href: '/home/3',   label: 'Home 3'   },
  { href: '/home/4',   label: 'Home 4'   },
  { href: '/home/5',   label: 'Home 5'   },
];

export default function TmiHomebookJumpNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border border-white/10 bg-black/60 px-3 py-2 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.8)] pointer-events-auto">
      {HOME_TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.label}
            title={tab.label}
            className="inline-flex items-center justify-center"
            style={{ width: 20, height: 20, textDecoration: 'none' }}
          >
            <span style={{
              display: 'block',
              borderRadius: 999,
              transition: 'all 220ms ease',
              width: active ? 18 : 6,
              height: 6,
              background: active ? '#e879f9' : 'rgba(255,255,255,0.28)',
              boxShadow: active ? '0 0 8px rgba(232,121,249,0.7)' : 'none',
            }} />
          </Link>
        );
      })}
    </nav>
  );
}