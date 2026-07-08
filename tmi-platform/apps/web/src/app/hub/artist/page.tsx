'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PersonaSwitcher } from '@/components/hud/PersonaSwitcher';
import { HubBackNav } from '@/components/nav/HubBackNav';
import TMIVideoMonitor from '@/components/hud/TMIVideoMonitor';
import ArtistStats from '@/components/artist/ArtistStats';
import ArtistCurtainShell, { type ArtistShowState, nextShowState } from '@/components/artist/ArtistCurtainShell';
import ArtistCommandRail from '@/components/artist/ArtistCommandRail';
import ArtistRevenueRail from '@/components/artist/ArtistRevenueRail';
import ArtistShowRail from '@/components/artist/ArtistShowRail';
import ArtistBackstageRail from '@/components/artist/ArtistBackstageRail';
import ArtistPulseRail from '@/components/artist/ArtistPulseRail';
import ArtistTipRail from '@/components/artist/ArtistTipRail';
import LiveMediaWall from '@/components/media/LiveMediaWall';

export default function ArtistHubPage() {
  const [showState, setShowState] = useState<ArtistShowState>('closed');
  const [artistSlug, setArtistSlug] = useState('me');
  const [displayName, setDisplayName] = useState('');
  const [userTier, setUserTier] = useState('');
  const [userRole, setUserRole] = useState('ARTIST');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then(r => r.json())
      .then((d: { user?: { id?: string; name?: string; email?: string } }) => {
        if (d?.user) {
          setArtistSlug(d.user.id ?? 'me');
          setDisplayName(d.user.name ?? d.user.email?.split('@')[0] ?? 'artist');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { authenticated?: boolean; user?: { tier?: string; role?: string } } | null) => {
        if (!d?.authenticated || !d.user) return;
        if (d.user.tier) setUserTier(d.user.tier.toUpperCase());
        if (d.user.role) setUserRole(d.user.role.toUpperCase());
      })
      .catch(() => {});
  }, []);

  const NAV_LINKS = [
    { href: `/artists/${artistSlug}`,           label: 'Public Profile' },
    { href: `/artists/${artistSlug}/analytics`, label: 'Analytics' },
    { href: `/artists/${artistSlug}/article`,   label: 'Article' },
    { href: '/beat-vault',                       label: 'Beat Vault' },
    { href: '/nft',                              label: 'NFT Studio' },
    { href: '/settings',                         label: 'Settings' },
    { href: '/api/auth/logout',                   label: 'Logout' },
  ];

  function advanceShow(state: ArtistShowState) {
    setShowState(nextShowState(state));
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#07071a', color: '#e2e8f0', minHeight: '100vh' }}>

      {/* Top nav strip */}
      <div style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(0,255,255,0.12)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 16, overflowX: 'auto' }}>
        <HubBackNav accentColor="#00FFFF" />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#00FFFF', textTransform: 'uppercase', flexShrink: 0 }}>Artist Hub</span>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {link.label}
          </Link>
        ))}
        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <PersonaSwitcher currentRole="artist" compact />
        </div>
      </div>

      {userTier === 'FREE' && !bannerDismissed && (
        <div style={{ background: 'linear-gradient(90deg, #FF9500, #FFD700)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#050510', letterSpacing: '0.04em' }}>
              {userRole === 'BAND' ? '🎸 Band Pro — $16.99/month' : '🚀 Go Pro — $1.99/month'}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(5,5,16,0.82)', marginLeft: 12 }}>
              {userRole === 'BAND'
                ? 'Unlock group tools, creative suite access, and higher discovery reach.'
                : 'Go live, get discovered, and convert fans into revenue now.'}
            </span>
          </div>
          <Link href="/account/subscription" style={{ padding: '8px 20px', borderRadius: 8, background: '#050510', color: '#FFD700', fontSize: 12, fontWeight: 900, textDecoration: 'none', letterSpacing: '0.06em' }}>
            UPGRADE NOW
          </Link>
          <Link href="/messages/new?subject=Join+me+on+TMI" style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(5,5,16,0.35)', color: '#050510', fontSize: 11, fontWeight: 800, textDecoration: 'none' }}>
            INVITE FRIENDS
          </Link>
          <button onClick={() => setBannerDismissed(true)} style={{ background: 'none', border: 'none', color: 'rgba(5,5,16,0.7)', fontSize: 18, cursor: 'pointer', padding: 0 }} aria-label="Dismiss">×</button>
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: '#00FFFF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Artist Command Deck</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: '-0.01em' }}>@{displayName}</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
            Live show control · revenue · tips · setlist · backstage · pulse
          </p>
          <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/messages" style={{ fontSize: 11, fontWeight: 800, color: '#00FFFF', textDecoration: 'none', border: '1px solid rgba(0,255,255,0.35)', borderRadius: 8, padding: '6px 10px', letterSpacing: '0.06em' }}>
              OPEN MESSAGES
            </Link>
            <Link href="/messages/new?subject=Join+my+next+show" style={{ fontSize: 11, fontWeight: 800, color: '#FFD700', textDecoration: 'none', border: '1px solid rgba(255,215,0,0.35)', borderRadius: 8, padding: '6px 10px', letterSpacing: '0.06em' }}>
              MESSAGE INVITE
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <ArtistStats followers={42800} views={1240000} verified genres={['Hip-Hop', 'R&B', 'Trap']} />

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

          {/* Left column */}
          <div>
            {/* Live Show — curtain moved to VideoMonitorGrid live-stream slot.
                Only surfaces inside the video panel when performer is going live
                or a show is active. Not shown as a static dashboard section. */}

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
              <ArtistCommandRail showState={showState} slug={artistSlug} onStateChange={advanceShow} />
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
                  { label: 'Full Analytics Dashboard', href: `/artists/${artistSlug}/analytics`, color: '#00FFFF' },
                  { label: 'Revenue Report',            href: `/artists/${artistSlug}/analytics?tab=revenue`, color: '#FFD700' },
                  { label: 'Audience Retention',        href: `/artists/${artistSlug}/analytics?tab=retention`, color: '#AA2DFF' },
                  { label: 'Beat Performance',          href: `/artists/${artistSlug}/analytics?tab=beats`, color: '#FF2DAA' },
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
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 40px' }}>
        <LiveMediaWall
          roomId="artist-hub"
          title="LIVE ROOMS — HAPPENING NOW"
          mode="spotlight"
          nodeCount={6}
          accentColor="#00FFFF"
          enterHref="/live/rooms"
          compact={false}
        />
      </div>
      <TMIVideoMonitor label="ARTIST CAM" position="bottom-right" />
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
