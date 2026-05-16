'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TMI_GOVERNANCE_CLUSTER } from '@/lib/auth/GovernanceClusterEngine';
import type { PersonaType } from '@/lib/auth/GovernanceClusterEngine';

const PERSONA_ICONS: Record<PersonaType, string> = { admin: '⚡', artist: '🎤', fan: '🎧' };
const PERSONA_COLORS: Record<PersonaType, string> = { admin: '#ff6b1a', artist: '#00FFFF', fan: '#FF2DAA' };

export default function GovernanceDiagnosticsPage() {
  const [clusterState, setClusterState] = useState<{ persona: string; member: string } | null>(null);
  const [switchLog, setSwitchLog]       = useState<Array<{ ts: string; from: string; to: string; ok: boolean }>>([]);
  const [testing, setTesting]           = useState<string | null>(null);

  useEffect(() => {
    const persona = document.cookie.match(/tmi_persona=([^;]*)/)?.[1] ?? null;
    const member  = document.cookie.match(/tmi_cluster_member=([^;]*)/)?.[1] ?? null;
    if (persona && member) setClusterState({ persona, member });
  }, []);

  async function testSwitch(memberId: string, personaType: PersonaType) {
    const key = `${memberId}-${personaType}`;
    setTesting(key);
    const from = clusterState ? `${clusterState.member}:${clusterState.persona}` : 'unknown';
    try {
      const res  = await fetch('/api/auth/switch-persona', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ memberId, personaType }),
      });
      const ok   = res.ok;
      const data = await res.json().catch(() => ({}));
      setSwitchLog((prev) => [{
        ts:   new Date().toISOString().slice(11, 19),
        from,
        to:   `${memberId}:${personaType}`,
        ok,
      }, ...prev.slice(0, 19)]);
      if (ok) setClusterState({ persona: personaType, member: memberId });
    } catch {
      setSwitchLog((prev) => [{ ts: new Date().toISOString().slice(11, 19), from, to: key, ok: false }, ...prev.slice(0, 19)]);
    }
    setTesting(null);
  }

  return (
    <main style={{ background: '#050510', minHeight: '100vh', padding: '40px 24px', fontFamily: 'inherit', color: '#fff' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link href="/admin/diagnostics/testers" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 10px' }}>
            ← Testers
          </Link>
          <Link href="/admin/observatory" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 10px' }}>
            Observatory →
          </Link>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#ff6b1a', marginBottom: 4 }}>
          Governance Cluster Diagnostics
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
          {TMI_GOVERNANCE_CLUSTER.name} · {TMI_GOVERNANCE_CLUSTER.clusterId}
        </p>

        {/* Active session state */}
        <div style={{ background: clusterState ? 'rgba(0,255,136,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${clusterState ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '18px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Active Persona (this browser)</div>
            {clusterState ? (
              <div style={{ fontSize: 16, fontWeight: 700, color: PERSONA_COLORS[clusterState.persona as PersonaType] ?? '#fff' }}>
                {clusterState.member} · {clusterState.persona}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>No governance session detected — not a cluster member or cookies cleared</div>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            Cookie: tmi_cluster_member + tmi_persona
          </div>
        </div>

        {/* Cluster members */}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
          Cluster Members — {TMI_GOVERNANCE_CLUSTER.members.length} members · {TMI_GOVERNANCE_CLUSTER.members.flatMap(m => m.personas).length} personas
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
          {TMI_GOVERNANCE_CLUSTER.members.map((member) => (
            <div key={member.memberId} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,107,26,0.2)', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{member.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{member.adminEmail} · @{member.artistSlug} · {member.tier}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {member.personas.map((persona) => {
                  const isActive = clusterState?.member === member.memberId && clusterState?.persona === persona.personaType;
                  const isTesting = testing === `${member.memberId}-${persona.personaType}`;
                  const color = PERSONA_COLORS[persona.personaType];
                  return (
                    <button
                      key={persona.personaId}
                      onClick={() => testSwitch(member.memberId, persona.personaType)}
                      disabled={!!testing}
                      style={{
                        display:     'flex',
                        alignItems:  'center',
                        gap:         8,
                        padding:     '10px 16px',
                        background:  isActive ? `${color}18` : 'rgba(255,255,255,0.04)',
                        border:      `1px solid ${isActive ? `${color}55` : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 9,
                        cursor:      testing ? 'default' : 'pointer',
                        color:       isActive ? color : 'rgba(255,255,255,0.6)',
                        fontSize:    12,
                        fontWeight:  700,
                        transition:  'all 0.15s',
                        minWidth:    130,
                      }}
                    >
                      <span>{PERSONA_ICONS[persona.personaType]}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div>{persona.personaType.toUpperCase()}</div>
                        <div style={{ fontSize: 9, opacity: 0.6, fontWeight: 500 }}>{persona.role}</div>
                      </div>
                      {isActive && <span style={{ marginLeft: 'auto', fontSize: 8, color }}>●</span>}
                      {isTesting && <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>…</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Shared capabilities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
          <div style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Shared Capabilities ({TMI_GOVERNANCE_CLUSTER.sharedCapabilities.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TMI_GOVERNANCE_CLUSTER.sharedCapabilities.map((cap) => (
                <div key={cap} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#00e5ff', opacity: 0.7 }}>✓</span> {cap}
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(255,107,26,0.04)', border: '1px solid rgba(255,107,26,0.15)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#ff6b1a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Separated Per-Persona ({TMI_GOVERNANCE_CLUSTER.separatedCapabilities.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TMI_GOVERNANCE_CLUSTER.separatedCapabilities.map((cap) => (
                <div key={cap} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#ff6b1a', opacity: 0.7 }}>≠</span> {cap}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Switch log */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Persona Switch Log (this session)
          </h3>
          {switchLog.length === 0 ? (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>No switches recorded yet. Click a persona above to test.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'monospace' }}>
              {switchLog.map((entry, i) => (
                <div key={i} style={{ fontSize: 11, color: entry.ok ? '#00ff88' : '#ff5252', display: 'flex', gap: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>{entry.ts}</span>
                  <span>{entry.ok ? '✓' : '✗'}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{entry.from}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>→</span>
                  <span>{entry.to}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
