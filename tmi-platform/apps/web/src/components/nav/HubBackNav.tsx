'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface HubBackNavProps {
  accentColor?: string;
  homeHref?: string;
  /** Where "back" lands when there's no real browser history to go back to
   *  (direct link, bookmark, fresh tab). Defaults to homeHref if unset. */
  fallbackRoute?: string;
}

export function HubBackNav({ accentColor = '#00FFFF', homeHref = '/home/1', fallbackRoute }: HubBackNavProps) {
  const router = useRouter();
  const [backHover, setBackHover] = useState(false);
  const [homeHover, setHomeHover] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
      return;
    }
    router.push(fallbackRoute ?? homeHref);
  };

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
      {/* Browser back */}
      <button
        type="button"
        onClick={handleBack}
        onMouseEnter={() => setBackHover(true)}
        onMouseLeave={() => setBackHover(false)}
        title="Go back"
        aria-label="Go back"
        style={{
          width: 30, height: 30, borderRadius: 8,
          background: backHover ? `rgba(${hexToRgb(accentColor)},0.15)` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${backHover ? accentColor : 'rgba(255,255,255,0.08)'}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease', color: backHover ? accentColor : 'rgba(255,255,255,0.45)',
          fontSize: 13, fontWeight: 700,
        }}
      >
        ‹
      </button>

      {/* Home */}
      <Link
        href={homeHref}
        onMouseEnter={() => setHomeHover(true)}
        onMouseLeave={() => setHomeHover(false)}
        title="Return to Home"
        aria-label="Return to Home"
        style={{
          width: 30, height: 30, borderRadius: 8,
          background: homeHover ? `rgba(${hexToRgb(accentColor)},0.15)` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${homeHover ? accentColor : 'rgba(255,255,255,0.08)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', fontSize: 13, transition: 'all 0.15s ease',
          color: homeHover ? accentColor : 'rgba(255,255,255,0.45)',
        }}
      >
        ⌂
      </Link>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '0,255,255';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

export default HubBackNav;
