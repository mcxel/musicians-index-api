'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SplitStreamMatrix from '@/components/media/SplitStreamMatrix';
import AudienceScene from '@/components/live/AudienceScene';
import PerformanceVotePanel from '@/components/arena/PerformanceVotePanel';
import { battleBillboardLobbyWallEngine } from '@/lib/competition/BattleBillboardLobbyWallEngine';
import { battleMatchLifecycleEngine, UNIVERSAL_BATTLE_WINDOW_SECONDS } from '@/lib/competition/BattleMatchLifecycleEngine';
import type { BattleVoteTally, VoteOption } from '@/lib/competition/BattleVoteClosureEngine';
import SponsorBattleOverlay from '@/components/arena/SponsorBattleOverlay';

const DEMO_BATTLES = [
  { battleId: 'arena-001', challengerName: 'Astra Nova',  targetName: 'Neon Verse',   format: 'Dirty Dozens', accentA: '#00FFFF', accentB: '#FF2DAA', status: 'live' as const },
  { battleId: 'arena-002', challengerName: 'Crown Mic',   targetName: 'Delta Flame',  format: 'Dance Off',    accentA: '#AA2DFF', accentB: '#FFD700', status: 'live' as const },
  { battleId: 'arena-003', challengerName: 'Velox Prime', targetName: 'Sable Court',  format: 'Jug Off',      accentA: '#00FF88', accentB: '#FF6B35', status: 'live' as const },
];

export default function BattlesLivePage() {
  const [activeBattle, setActiveBattle] = useState(DEMO_BATTLES[0]!);
  const [splitMode, setSplitMode] = useState<'SPLIT' | 'AUDIENCE_FOCUS'>('SPLIT');
  const [winner, setWinner] = useState<{ label: string; percent: number } | null>(null);
  const [showJudge, setShowJudge] = useState(false);

  const engineCards = battleBillboardLobbyWallEngine.getCards().filter(c => c.status === 'live');
  const remaining = battleMatchLifecycleEngine.getRemainingSeconds(activeBattle.battleId);
  const displaySeconds = Math.max(0, remaining ?? UNIVERSAL_BATTLE_WINDOW_SECONDS);
  const mm = String(Math.floor(displaySeconds / 60)).padStart(2, '0');
  const ss = String(displaySeconds % 60).padStart(2, '0');

  const handleWinner = (side: VoteOption, tally: BattleVoteTally) => {
    const label = side === 'artist-a' ? activeBattle.challengerName : activeBattle.targetName;
    const percent = side === 'artist-a' ? tally.artistAPercent : tally.artistBPercent;
    setWinner({ label, percent });
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, rgba(255,45,170,0.14), transparent 50%), #050510',
      color: '#fff',
      paddingBottom: 80,
    }}>

      {/* Top bar */}
      <div style={{
        background: 'rgba(0,0,0,0.9)',
        borderBottom: '1px solid rgba(255,45,170,0.2)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/home/5" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.1em' }}>
            ← HOME 5
          </Link>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', fontWeight: 800, color: '#FF2DAA' }}>CBC ARENA · LIVE</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            fontFamily: 'monospace',
            fontSize: 18,
            fontWeight: 900,
            color: displaySeconds < 60 ? '#FF3C3C' : '#00FFFF',
            letterSpacing: '0.06em',
          }}>
            {mm}:{ss}
          </div>
          <button
            onClick={() => setShowJudge(p => !p)}
            style={{
              fontSize: 9, padding: '5px 12px', borderRadius: 6,
              border: `1px solid ${showJudge ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.12)'}`,
              background: showJudge ? 'rgba(255,215,0,0.12)' : 'transparent',
              color: showJudge ? '#FFD700' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer', fontWeight: 800, letterSpacing: '0.1em',
            }}
          >
            JUDGE MODE
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 0' }}>

        {/* Sponsor strip */}
        <SponsorBattleOverlay battleId={activeBattle.battleId} accentColor={activeBattle.accentA} compact />
        <div style={{ marginBottom: 16 }} />

        {/* Battle selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {DEMO_BATTLES.map((b) => (
            <button
              key={b.battleId}
              onClick={() => { setActiveBattle(b); setWinner(null); }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1.5px solid ${activeBattle.battleId === b.battleId ? b.accentA : 'rgba(255,255,255,0.1)'}`,
                background: activeBattle.battleId === b.battleId ? `${b.accentA}14` : 'transparent',
                color: activeBattle.battleId === b.battleId ? b.accentA : 'rgba(255,255,255,0.4)',
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              ⚔️ {b.challengerName} vs {b.targetName}
            </button>
          ))}
          {engineCards.map((c) => (
            <Link key={c.battleId} href={c.route} style={{
              padding: '8px 14px', borderRadius: 8,
              border: '1px solid rgba(170,45,255,0.35)',
              background: 'rgba(170,45,255,0.08)',
              color: '#AA2DFF', fontSize: 10, fontWeight: 700,
              textDecoration: 'none', letterSpacing: '0.06em',
            }}>
              {c.challengerName} vs {c.targetName}
            </Link>
          ))}
        </div>

        {/* Winner banner */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginBottom: 20,
              borderRadius: 14,
              padding: '18px 24px',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(170,45,255,0.1))',
              border: '2px solid rgba(255,215,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 36 }}>👑</span>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>WINNER DECLARED</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#FFD700', marginTop: 2 }}>{winner.label}</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#FFD700' }}>{winner.percent}%</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>fan vote</div>
            </div>
          </motion.div>
        )}

        {/* Arena grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

          {/* Left — split stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', fontWeight: 800 }}>
              {activeBattle.challengerName.toUpperCase()} vs {activeBattle.targetName.toUpperCase()} · {activeBattle.format.toUpperCase()}
            </div>
            <SplitStreamMatrix
              mode={splitMode}
              isBattle
              battleOpponentLabel={activeBattle.targetName}
              onModeChange={setSplitMode}
            />

            {/* 3D audience arena — battle venue (Arena, venue index 1) */}
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: 10 }}>
                LIVE AUDIENCE
              </div>
              <AudienceScene view="fan" venue={1} />
            </div>
          </div>

          {/* Right — vote panel */}
          <div style={{ position: 'sticky', top: 70 }}>
            <PerformanceVotePanel
              battleId={activeBattle.battleId}
              artistALabel={activeBattle.challengerName}
              artistBLabel={activeBattle.targetName}
              accentA={activeBattle.accentA}
              accentB={activeBattle.accentB}
              judgeMode={showJudge}
              onWinnerDeclared={handleWinner}
              autoOpenVoting
            />
          </div>
        </div>

        {/* Bottom — other active rooms */}
        {DEMO_BATTLES.filter(b => b.battleId !== activeBattle.battleId).length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: 12 }}>
              OTHER ACTIVE ARENAS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {DEMO_BATTLES.filter(b => b.battleId !== activeBattle.battleId).map((b) => (
                <button
                  key={b.battleId}
                  onClick={() => { setActiveBattle(b); setWinner(null); }}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: `1px solid ${b.accentA}33`,
                    background: `${b.accentA}08`,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, color: b.accentA, marginBottom: 4 }}>
                    ⚔️ {b.challengerName} vs {b.targetName}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{b.format} · LIVE</div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
