'use client';
import Link from 'next/link';
import { useSponsoredPrizeEngine } from '@/hooks/useSponsoredPrizeEngine';
import { usePlatformEvolution } from '@/hooks/usePlatformEvolution';
import AvatarMiniPreview from '@/components/avatar/AvatarMiniPreview';

export default function AdminRewardsDashboard() {
  const { activeReveal, claimHistory, dispatchEngagementEvent, clearRevealModal } =
    useSponsoredPrizeEngine('admin-preview', 'ALL');
  const { telemetryLogs, evolutionState, registerClickTelemetry } = usePlatformEvolution();

  return (
    <div style={{ minHeight: '100vh', background: '#040209', color: '#fff', fontFamily: 'monospace', padding: 20 }}>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #00FFFF', paddingBottom: 10, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#00FFFF', letterSpacing: 1 }}>REWARD ENGINE COCKPIT</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Prize pool · telemetry · evolution state</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 10, background: '#FF2DAA', color: '#000', padding: '4px 10px', borderRadius: 4, fontWeight: 'bold' }}>LIVE</span>
          <AvatarMiniPreview variant="mini" />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.6fr', gap: 20 }}>

        {/* Action Triggers */}
        <section style={{ background: '#0b081a', borderRadius: 10, padding: 14, border: '1px solid rgba(255,255,255,0.04)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 12, color: '#00FFFF', textTransform: 'uppercase' }}>Action Triggers</h3>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>Fire simulated engagement events to test prize distribution.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '📰 READ_ARTICLE (Kreach Shards)', event: 'READ_ARTICLE' as const, slug: 'kreach-multimedia-shards', ms: 184000 },
              { label: '🎤 VOTE_BATTLE (Phonk Cypher)',   event: 'VOTE_BATTLE'  as const, slug: 'phonk-audio-locker',       ms: 45000  },
              { label: '💬 SEND_MESSAGE (Inbox Thread)',  event: 'SEND_MESSAGE' as const, slug: 'inbox-thread',             ms: 12000  },
              { label: '🔴 WATCH_LIVE (Chico Session)',   event: 'WATCH_LIVE'   as const, slug: 'chico-live-stage',         ms: 240000 },
            ].map(({ label, event, slug, ms }) => (
              <button
                key={event}
                onClick={() => { registerClickTelemetry(slug, ms); dispatchEngagementEvent(event, label); }}
                style={{ padding: 10, background: '#140f2e', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 10, fontWeight: 'bold' }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Evolution State */}
        <section style={{ background: '#0b081a', borderRadius: 10, padding: 14, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: 12, color: '#FF2DAA', textTransform: 'uppercase' }}>Evolution State</h3>
            <div style={{ background: '#060410', padding: 8, borderRadius: 6, fontSize: 10, borderLeft: '2px solid #FF2DAA', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>CYCLE</span><span style={{ color: '#FF2DAA', fontWeight: 'bold' }}>#{evolutionState.generationCycle}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>TOP SURFACE</span><span style={{ color: '#00FFFF', fontSize: 9 }}>{evolutionState.topPerformingLayoutSlug}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>GENRE FOCUS</span><span style={{ color: '#FFD700' }}>{evolutionState.optimizedGenreFocus}</span></div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Telemetry Nodes</span>
            <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', maxHeight: 200 }}>
              {telemetryLogs.map(t => (
                <div key={t.slug} style={{ background: '#070512', padding: 8, borderRadius: 6, fontSize: 9 }}>
                  <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>{t.slug}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)' }}>
                    <span>{t.clicks} clicks · {Math.round(t.averageSessionDurationMs / 1000)}s avg</span>
                    <span style={{ color: '#00FF88' }}>{t.conversionProbability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Claim History */}
        <section style={{ background: '#0b081a', borderRadius: 10, padding: 14, border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 12, color: '#FFD700', textTransform: 'uppercase' }}>Reward Claim Log</h3>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 280, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {claimHistory.length === 0 ? (
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 40 }}>No claims this session — fire an action above.</div>
            ) : (
              claimHistory.map((log, i) => (
                <div key={i} style={{ background: '#05030d', padding: 8, borderRadius: 6, fontSize: 10, color: '#00FF88', borderLeft: '2px solid #00FF88' }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Prize Reveal Modal */}
      {activeReveal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,2,10,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 16 }}>
          <div style={{ background: '#0e0922', border: `2px solid ${activeReveal.category === 'INTERNAL_COSMETIC' ? '#FF2DAA' : '#FFD700'}`, borderRadius: 16, padding: 24, maxWidth: 440, width: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2 }}>Prize Drop</span>
            <h2 style={{ fontSize: 18, margin: '8px 0', fontWeight: 900, color: '#fff' }}>{activeReveal.title}</h2>
            {activeReveal.sponsorName && (
              <div style={{ fontSize: 10, color: '#FFD700', textTransform: 'uppercase', marginBottom: 12 }}>Sponsor: {activeReveal.sponsorName}</div>
            )}
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, margin: '0 0 20px' }}>{activeReveal.description}</p>
            {activeReveal.claimCtaPath && (
              <Link href={activeReveal.claimCtaPath} style={{ display: 'block', padding: 10, background: '#FFD700', color: '#000', borderRadius: 6, textDecoration: 'none', fontWeight: 'bold', fontSize: 11, marginBottom: 8, textTransform: 'uppercase' }} onClick={clearRevealModal}>
                Claim Reward →
              </Link>
            )}
            <button onClick={clearRevealModal} style={{ width: '100%', padding: 10, background: '#FF2DAA', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', fontSize: 11, cursor: 'pointer', textTransform: 'uppercase' }}>
              Add to Vault
            </button>
          </div>
        </div>
      )}

      <footer style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 14, background: '#0b081a', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
        <Link href="/admin/live" style={{ color: '#00FFFF', fontSize: 10, textDecoration: 'none', fontWeight: 'bold' }}>← Admin Hub</Link>
        <Link href="/live-stage" style={{ color: '#FF2DAA', fontSize: 10, textDecoration: 'none', fontWeight: 'bold' }}>Live Stage</Link>
        <Link href="/magazine" style={{ color: '#FFD700', fontSize: 10, textDecoration: 'none', fontWeight: 'bold' }}>Magazine</Link>
      </footer>
    </div>
  );
}
