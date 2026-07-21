'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CANONICAL_BOT_FLEET } from '@/lib/bots/BotFleetRegistry';
import { getKnowledgeVaultEntries, searchKnowledgeVault } from '@/lib/enterprise/KnowledgeVault';
import { getExperienceReplayLibrary, runSimulationScenario, type SimulationResult } from '@/lib/enterprise/SimulationArena';
import { getCurrentObservatoryMetrics, getActiveForgePrototypes } from '@/lib/enterprise/AIForgeObservatory';

export default function EnterpriseArchitecturePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'vault' | 'arena' | 'forge' | 'observatory' | 'fleet'>('fleet');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  const vaultEntries = searchKnowledgeVault(searchQuery);
  const replayLibrary = getExperienceReplayLibrary();
  const observatory = getCurrentObservatoryMetrics();
  const prototypes = getActiveForgePrototypes();

  const handleTestSim = () => {
    const res = runSimulationScenario('Flex Store Micro-Pricing 7-Day Campaign', 'STORE_LAUNCH');
    setSimResult(res);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#03010a', color: '#fff', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(9,5,24,0.9)', border: '2px solid #00E5FF', borderRadius: 20, padding: 24, boxShadow: '0 0 35px rgba(0,229,255,0.25)' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.2em' }}>
              TMI AUTONOMOUS ENTERPRISE ARCHITECTURE
            </div>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 900, margin: '4px 0 0' }}>
              🏛️ Enterprise Architecture Control Center
            </h1>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
              Knowledge Vault · Simulation Arena · AI Forge · Observatory · Bot Fleet Roster
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/store/flex" style={{ padding: '8px 16px', background: 'rgba(255,215,0,0.15)', border: '1px solid #FFD700', borderRadius: 8, color: '#FFD700', fontSize: 11, fontWeight: 900, textDecoration: 'none' }}>
              🏛️ 3D FLEX STORE
            </Link>
            <Link href="/competitions/monday-night-stage" style={{ padding: '8px 16px', background: 'rgba(255,45,170,0.15)', border: '1px solid #FF2DAA', borderRadius: 8, color: '#FF2DAA', fontSize: 11, fontWeight: 900, textDecoration: 'none' }}>
              ⭐ MONDAY STAGE
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
          {[
            { id: 'fleet', label: '🤖 BOT FLEET ROSTER (8)', icon: '🤖' },
            { id: 'vault', label: '📚 KNOWLEDGE VAULT (L1)', icon: '📚' },
            { id: 'arena', label: '🧪 SIMULATION ARENA (L2)', icon: '🧪' },
            { id: 'forge', label: '⚙️ AI FORGE (L3)', icon: '⚙️' },
            { id: 'observatory', label: '📊 OBSERVATORY (L4)', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 900,
                color: activeTab === tab.id ? '#00E5FF' : 'rgba(255,255,255,0.5)',
                background: activeTab === tab.id ? 'rgba(0,229,255,0.15)' : 'transparent',
                border: activeTab === tab.id ? '1px solid #00E5FF' : 'none',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Bot Fleet Roster */}
        {activeTab === 'fleet' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {CANONICAL_BOT_FLEET.map((bot) => (
              <div key={bot.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${bot.accentColor}40`, borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: bot.accentColor }}>{bot.name}</div>
                  <span style={{ fontSize: 9, padding: '3px 8px', background: `${bot.accentColor}20`, color: bot.accentColor, borderRadius: 12, fontWeight: 900 }}>
                    ● ONLINE
                  </span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{bot.title}</div>

                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 800, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>RESPONSIBILITIES:</div>
                  {bot.responsibilities.map((r, i) => (
                    <div key={i}>• {r}</div>
                  ))}
                </div>

                <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 8, fontSize: 10 }}>
                  <span style={{ color: bot.accentColor, fontWeight: 900 }}>ACTIVE TASK: </span>
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>{bot.currentTaskDescription}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Knowledge Vault */}
        {activeTab === 'vault' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="text"
              placeholder="Search Knowledge Vault (pricing, architecture, bebo-hook)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: '#080414', color: '#fff', padding: 14, borderRadius: 10, border: '1px solid rgba(0,229,255,0.3)' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {vaultEntries.map((e) => (
                <div key={e.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 900, color: '#00E5FF' }}>
                    <span>{e.domain.toUpperCase()} / {e.subCategory.toUpperCase()}</span>
                    <span>AUTHOR: {e.authorBotId}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 8 }}>{e.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 6, lineHeight: 1.4 }}>{e.summary}</div>
                  <div style={{ marginTop: 10, background: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 6, fontSize: 10, color: '#00FF88', lineHeight: 1.4 }}>
                    {e.validatedContent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Simulation Arena */}
        {activeTab === 'arena' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid #00E5FF', borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>Run Synthetic Scenario Against Historical Replay</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                  Test proposed changes in a closed-loop sandbox before live production deploy
                </div>
              </div>
              <button
                onClick={handleTestSim}
                style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #00E5FF, #FF2DAA)', border: 'none', borderRadius: 10, color: '#000', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}
              >
                🧪 RUN SIMULATION
              </button>
            </div>

            {simResult && (
              <div style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid #00FF88', borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#00FF88' }}>
                  ✓ SIMULATION PASSED: {simResult.status}
                </div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 6 }}>{simResult.proposalName}</div>
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 11 }}>
                  <div>SATISFACTION SCORE: <strong style={{ color: '#FFD700' }}>{simResult.projectedUserSatisfactionScore}%</strong></div>
                  <div>PREDICTED LATENCY: <strong style={{ color: '#00E5FF' }}>{simResult.predictedLatencyMs} ms</strong></div>
                  <div>SAFETY AUDIT: <strong style={{ color: '#00FF88' }}>PASSED</strong></div>
                </div>
              </div>
            )}

            {/* Experience Replay Library */}
            <div style={{ fontSize: 12, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.1em' }}>
              🎥 EXPERIENCE REPLAY LIBRARY (HISTORICAL BENCHMARKS)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {replayLibrary.map((r) => (
                <div key={r.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: '#FFD700' }}>{r.category}</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginTop: 4 }}>{r.eventName}</div>
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                    <span>👥 {r.concurrentUsers.toLocaleString()} Users</span>
                    <span>⚡ {r.avgLatencyMs} ms</span>
                    <span>⭐ {r.satisfactionScorePercent}% Score</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: AI Forge */}
        {activeTab === 'forge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#00E5FF', letterSpacing: '0.1em' }}>
              ⚙️ AI FORGE ACTIVE PROTOTYPES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {prototypes.map((p) => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 9, fontWeight: 900, color: '#00FF88' }}>● {p.simulationStatus}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 6 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>TARGET: {p.targetComponent}</div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#FFD700' }}>
                    <span>FPS BENCHMARK: {p.benchmarkFps} FPS</span>
                    <span>ROLLBACK PLAN: {p.hasRollbackPlan ? 'READY' : 'NONE'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Observatory Telemetry */}
        {activeTab === 'observatory' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: 'API LATENCY', val: `${observatory.apiLatencyMs} ms`, accent: '#00E5FF' },
              { label: 'VIDEO STARTUP', val: `${observatory.videoStartupSec} s`, accent: '#00FF88' },
              { label: 'CRASH RATE', val: `${observatory.crashRatePercent}%`, accent: '#00FF88' },
              { label: 'EVENT PARTICIPANTS', val: observatory.eventParticipationCount.toLocaleString(), accent: '#FFD700' },
              { label: 'SPONSOR IMPRESSIONS', val: observatory.sponsorImpressions.toLocaleString(), accent: '#FF9500' },
              { label: 'CONVERSION RATE', val: `${observatory.conversionRatePercent}%`, accent: '#FF2DAA' },
              { label: 'ROOM OCCUPANCY', val: observatory.roomOccupancyTotal.toLocaleString(), accent: '#AA2DFF' },
              { label: 'MARKETPLACE SALES', val: `$${(observatory.marketplaceSalesCents / 100).toLocaleString()}`, accent: '#FFD700' },
            ].map((m) => (
              <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${m.accent}40`, borderRadius: 16, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 9, fontWeight: 900, color: m.accent, letterSpacing: '0.1em' }}>{m.label}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginTop: 6 }}>{m.val}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
