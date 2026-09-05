'use client';

/**
 * /live/challenge/[id] — Canonical Lane C Challenge Arena Experience
 *
 * Implements the TMI Experience Identity Law for Challenge:
 * - Center of Gravity: Suspended Objective Contract between competitors
 * - Single Challenge Session owns truth
 * - Canonical Sources: CHALLENGE_PROGRAM, CHALLENGER_ISO, CHALLENGED_ISO, AUDIENCE_VIEW, JUMBOTRON_FEED
 * - Decision Paths: AUDIENCE_VOTE, AUTHORIZED_JUDGES, MEASURABLE_RESULT
 * - Reality Law: Real stakes or NONE, certified settlement
 */

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import CinematicChallengeArenaStage from '@/components/challenge/CinematicChallengeArenaStage';

export default function LiveChallengeSessionPage() {
  const params = useParams();
  const rawId = params?.id;
  const challengeId = Array.isArray(rawId) ? rawId[0] : (rawId as string) || 'sess-challenge-prod-01';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(255,215,0,0.12), transparent 50%), #050510',
        color: '#fff',
        paddingBottom: 40,
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: 'rgba(0,0,0,0.9)',
          borderBottom: '1px solid rgba(255,215,0,0.25)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/challenges"
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '0.1em' }}
          >
            ← ALL CHALLENGES
          </Link>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', fontWeight: 800, color: '#FFD700' }}>
            CHALLENGE ARENA · OBJECTIVE STAGE
          </div>
        </div>
        <Link
          href={`/rooms/challenge/${encodeURIComponent(challengeId)}`}
          style={{ fontSize: 10, color: '#FFD700', textDecoration: 'none', fontWeight: 700 }}
        >
          Production Challenge Room →
        </Link>
        <Link
          href="/live"
          style={{ fontSize: 10, color: '#00FFFF', textDecoration: 'none', fontWeight: 700 }}
        >
          Live Hub →
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 0' }}>
        <CinematicChallengeArenaStage
          challengeSessionId={challengeId}
          initialPolicy="AUDIENCE_VOTE"
          objectiveText="60-SECOND FREESTYLE ON 140 BPM BEAT"
          stakeText="NONE"
        />
      </div>
    </main>
  );
}
