'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PersonaSwitcher } from '@/components/hud/PersonaSwitcher';
import ArtistStats from '@/components/artist/ArtistStats';
import ArtistCurtainShell, { type ArtistShowState, nextShowState } from '@/components/artist/ArtistCurtainShell';
import ArtistCommandRail from '@/components/artist/ArtistCommandRail';
import ArtistRevenueRail from '@/components/artist/ArtistRevenueRail';
import ArtistShowRail from '@/components/artist/ArtistShowRail';
import ArtistBackstageRail from '@/components/artist/ArtistBackstageRail';
import ArtistPulseRail from '@/components/artist/ArtistPulseRail';
import ArtistTipRail from '@/components/artist/ArtistTipRail';

const ARTIST_SLUG = 'demo-artist';

const NAV_LINKS = [
  { href: `/artists/${ARTIST_SLUG}`,           label: 'Public Profile' },
  { href: `/artists/${ARTIST_SLUG}/analytics`, label: 'Analytics' },
  { href: `/artists/${ARTIST_SLUG}/article`,   label: 'Article' },
  { href: '/beat-vault',                        label: 'Beat Vault' },
  { href: '/nft',                               label: 'NFT Studio' },
  { href: '/settings',                          label: 'Settings' },
  { href: '/auth/logout',                       label: 'Logout' },
];

export default function ArtistHubPage() {
  const [showState, setShowState] = useState<ArtistShowState>('closed');

  function advanceShow(state: ArtistShowState) {
    setShowState(nextShowState(state));
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#07071a', color: '#e2e8f0', minHeight: '100vh' }}>

      {/* Top nav strip */}
      <div style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(0,255,255,0.12)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 24, overflowX: 'auto' }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#00FFFF', textTransform: 'uppercase', flexShrink: 0 }}>Artist Hub</span>
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {link.label}
          </Link>
        ))}
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <PersonaSwitcher currentRole="artist" compact />
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: '#00FFFF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Artist Command Deck</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: '-0.01em' }}>@{ARTIST_SLUG}</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
            Live show control · revenue · tips · setlist · backstage · pulse
          </p>
        </div>

        {/* Stats row */}
        <ArtistStats followers={42800} views={1240000} verified genres={['Hip-Hop', 'R&B', 'Trap']} />

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

          {/* Left column */}
          <div>
            {/* Live curtain control */}
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Live Show</SectionLabel>
              <ArtistCurtainShell
                showState={showState}
                showTitle="Crown Night Vol.4"
                onStateChange={advanceShow}
              />
            </div>

            {/* Revenue rail */}
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Revenue This Month</SectionLabel>
              <ArtistRevenueRail />
            </div>

            {/* Show schedule */}
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Show Schedule</SectionLabel>
              <ArtistShowRail />
            </div>

            {/* Pulse (fan activity feed) */}
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Fan Pulse</SectionLabel>
              <ArtistPulseRail />
            </div>

            {/* Tips */}
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Tips Received</SectionLabel>
              <ArtistTipRail />
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            {/* Command rail (signal + quick actions) */}
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Command Rail</SectionLabel>
              <ArtistCommandRail showState={showState} slug={ARTIST_SLUG} onStateChange={advanceShow} />
            </div>

            {/* Backstage crew */}
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Backstage</SectionLabel>
              <ArtistBackstageRail />
            </div>

            {/* Quick analytics links */}
            <div style={{ marginBottom: 20 }}>
              <SectionLabel>Analytics</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Full Analytics Dashboard', href: `/artists/${ARTIST_SLUG}/analytics`, color: '#00FFFF' },
                  { label: 'Revenue Report',            href: `/artists/${ARTIST_SLUG}/analytics?tab=revenue`, color: '#FFD700' },
                  { label: 'Audience Retention',        href: `/artists/${ARTIST_SLUG}/analytics?tab=retention`, color: '#AA2DFF' },
                  { label: 'Beat Performance',          href: `/artists/${ARTIST_SLUG}/analytics?tab=beats`, color: '#FF2DAA' },
                ].map(link => (
                  <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: `1px solid ${link.color}22`, borderRadius: 8, padding: '10px 14px' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{link.label}</span>
                      <span style={{ fontSize: 12, color: link.color }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Notifications placeholder */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
                Notifications
              </div>
              {[
                { msg: 'Nova tipped you $25', time: '2m ago', color: '#FFD700' },
                { msg: 'New booking request from Venue ATL', time: '18m ago', color: '#00FFFF' },
                { msg: 'Your battle starts in 1 hour', time: '42m ago', color: '#FF2DAA' },
              ].map((n) => (
                <div key={n.msg} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 11, color: n.color, maxWidth: 180 }}>{n.msg}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', flexShrink: 0, marginLeft: 8 }}>{n.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 10 }}>
      {children}
    </div>
  );
}
