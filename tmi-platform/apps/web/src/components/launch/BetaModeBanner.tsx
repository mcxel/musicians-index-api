'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DISMISSED_KEY = 'tmi-beta-banner-dismissed';

export default function BetaModeBanner() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(true); // hidden until hydrated
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISSED_KEY) === '1');
  }, []);

  // Keep --tmi-banner-h in sync so MagazineNavBar and MainNav can offset themselves
  useEffect(() => {
    if (dismissed) {
      document.documentElement.style.setProperty('--tmi-banner-h', '0px');
      return;
    }
    const el = bannerRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty('--tmi-banner-h', `${el.getBoundingClientRect().height}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dismissed, expanded]);

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  }

  if (dismissed) return null;
  // WorkspaceShell preview routes are a self-contained broadcast-OS sandbox.
  if (pathname?.startsWith('/preview/')) return null;

  return (
    <div ref={bannerRef} style={{
      position: 'sticky',
      top: 0,
      zIndex: 60,
      background: 'linear-gradient(90deg, #0a0a1a 0%, #12082a 50%, #0a0a1a 100%)',
      borderBottom: '1px solid rgba(170,45,255,0.35)',
      fontFamily: "'Inter',sans-serif",
    }}>
      {/* Top strip — always visible */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 16px',
        gap: 12,
      }}>
        {/* Left: status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#AA2DFF',
              boxShadow: '0 0 6px #AA2DFF',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: 8, fontWeight: 900, letterSpacing: '0.25em',
              color: '#AA2DFF', textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}>
              TMI BETA SEASON
            </span>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            You are a Founding Beta Member. Purchases &amp; unlocks persist permanently.
          </span>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              padding: '3px 8px', fontSize: 8, fontWeight: 700,
              border: '1px solid rgba(170,45,255,0.4)',
              background: 'rgba(170,45,255,0.1)',
              color: '#AA2DFF', cursor: 'pointer', borderRadius: 3,
              letterSpacing: '0.1em',
            }}
          >
            {expanded ? 'LESS' : 'DETAILS'}
          </button>
          <button
            onClick={dismiss}
            aria-label="Dismiss beta banner"
            style={{
              width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13, lineHeight: 1,
              padding: 0, flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Expanded disclosure panel */}
      {expanded && (
        <div style={{
          borderTop: '1px solid rgba(170,45,255,0.15)',
          padding: '14px 16px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {/* Beta identity */}
          <div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#AA2DFF', marginBottom: 6 }}>
              BETA ARCHITECT STATUS
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0 }}>
              You are among the founding community helping shape The Musician&apos;s Index.
              Your participation directly drives what gets built next.
            </p>
          </div>

          {/* What persists */}
          <div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#00FF88', marginBottom: 6 }}>
              PERMANENTLY YOURS
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              <li>Subscriptions &amp; purchases</li>
              <li>Cosmetics, props &amp; skins</li>
              <li>Founding Member badge</li>
              <li>Supporter history &amp; milestones</li>
              <li>Diamond-tier perks</li>
            </ul>
          </div>

          {/* What resets */}
          <div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700', marginBottom: 6 }}>
              MAY RESET AT V1 LAUNCH
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              <li>Beta XP &amp; rankings</li>
              <li>Leaderboard positions</li>
              <li>Temporary beta achievements</li>
              <li>Battle score inflation</li>
            </ul>
            <p style={{ margin: '8px 0 0', fontSize: 9, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              Diamond balances are preserved through launch.
            </p>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#00FFFF', marginBottom: 2 }}>
              YOUR VOICE MATTERS
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0 }}>
              Use the feedback button (bottom-right) to report issues, request features,
              or shape what TMI becomes.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link
                href="/pricing"
                style={{
                  padding: '6px 12px', borderRadius: 4, fontSize: 9, fontWeight: 900,
                  background: '#AA2DFF', color: '#fff',
                  textDecoration: 'none', letterSpacing: '0.08em',
                }}
              >
                UPGRADE
              </Link>
              <button
                onClick={() => setExpanded(false)}
                style={{
                  padding: '6px 12px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'transparent', color: 'rgba(255,255,255,0.45)',
                  cursor: 'pointer', letterSpacing: '0.06em',
                }}
              >
                Collapse details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
