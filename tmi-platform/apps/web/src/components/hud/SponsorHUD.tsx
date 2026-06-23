"use client";

/**
 * SponsorHUD.tsx
 *
 * Live room overlay for the Sponsor role.
 * Shows: active ad slots, room engagement metrics from LobbyFeedBus, CTA to manage placements.
 * All data is real — no fabricated impression counts.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
  type LobbyFeedState,
} from '@/lib/lobby/LobbyFeedBus';
import { getAdSlotForZone, getRailSponsors } from '@/lib/commerce/SponsorRegistry';

interface SponsorHUDProps {
  sponsorId?: string;
  sponsorName?: string;
}

export function SponsorHUD({ sponsorId, sponsorName = 'Your Brand' }: SponsorHUDProps) {
  const [feed, setFeed] = useState<LobbyFeedState>(() => getLobbyFeedSnapshot());
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => subscribeLobbyFeed(setFeed), []);

  const roomSlot = getAdSlotForZone(`room-${feed.slug || 'roomLeaderboard'}`);
  const railSponsors = getRailSponsors('room-');
  const isActive = railSponsors.some((s) => s.id === sponsorId);

  const engagementScore = feed.heat > 0
    ? `${Math.min(100, Math.round(feed.heat))}%`
    : 'No data yet';

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 999,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(255,215,0,0.12)',
          border: '1px solid rgba(255,215,0,0.4)',
          color: '#FFD700',
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 18px rgba(255,215,0,0.22)',
        }}
        aria-label="Open Sponsor HUD"
      >
        📊
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        zIndex: 999,
        width: 260,
        background: 'rgba(5,5,16,0.96)',
        border: '1px solid rgba(255,215,0,0.28)',
        borderRadius: 14,
        padding: 14,
        backdropFilter: 'blur(14px)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 8, letterSpacing: '0.22em', color: '#FFD700', fontWeight: 900 }}>SPONSOR HUD</div>
          <div style={{ fontSize: 11, color: '#fff', fontWeight: 700, marginTop: 2 }}>{sponsorName}</div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14 }}
          aria-label="Collapse HUD"
        >
          ▶
        </button>
      </div>

      {/* Room context */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
        <div style={{ fontSize: 8, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 4 }}>CURRENT ROOM</div>
        <div style={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>{feed.title || 'No active room'}</div>
        {feed.status === 'LIVE' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2020', display: 'inline-block', animation: 'tmiLivePulse 1s ease-in-out infinite' }} />
            <span style={{ fontSize: 9, color: '#FF2020', fontWeight: 900, letterSpacing: '0.12em' }}>LIVE</span>
          </div>
        )}
      </div>

      {/* Engagement stats — real data from LobbyFeedBus */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
        <div style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.12)', borderRadius: 8, padding: '7px 9px' }}>
          <div style={{ fontSize: 7, letterSpacing: '0.14em', color: '#00FFFF', fontWeight: 900 }}>AUDIENCE</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 2 }}>
            {feed.occupancy > 0 ? feed.occupancy.toLocaleString() : '—'}
          </div>
        </div>
        <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.12)', borderRadius: 8, padding: '7px 9px' }}>
          <div style={{ fontSize: 7, letterSpacing: '0.14em', color: '#FFD700', fontWeight: 900 }}>HEAT</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 2 }}>
            {engagementScore}
          </div>
        </div>
      </div>

      {/* Slot status */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
        <div style={{ fontSize: 8, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 6 }}>ACTIVE SLOTS</div>
        {roomSlot.type === 'paid' && roomSlot.sponsor ? (
          <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700 }}>
            {roomSlot.sponsor.name} — {roomSlot.sponsor.tagline}
          </div>
        ) : isActive ? (
          <div style={{ fontSize: 11, color: '#00FFFF', fontWeight: 700 }}>
            Your brand is in the rail sponsor rotation.
          </div>
        ) : (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            No paid slot active in this room.
          </div>
        )}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link
          href="/hub/sponsor"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '9px 14px',
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: '0.14em',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,215,0,0.08))',
            border: '1px solid rgba(255,215,0,0.3)',
            borderRadius: 8,
            color: '#FFD700',
            textDecoration: 'none',
          }}
        >
          MANAGE PLACEMENTS →
        </Link>
        <Link
          href="/sponsors/advertise"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '9px 14px',
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: '0.14em',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
          }}
        >
          BUY MORE SLOTS
        </Link>
      </div>
    </motion.div>
  );
}

export default SponsorHUD;
