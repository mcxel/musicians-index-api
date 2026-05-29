'use client';

import { useEffect, useState } from 'react';
import { AgentRegistry, BusinessRegistry, type AgentEntity, type BusinessEntity } from '@bernout/agent-network';

export default function MichaelCharlieDashboard() {
  const [mc, setMc] = useState<AgentEntity | null>(null);
  const [businesses, setBusinesses] = useState<BusinessEntity[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMc(AgentRegistry.get('michael-charlie') ?? null);
    setBusinesses(BusinessRegistry.getAll());
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setMc(AgentRegistry.get('michael-charlie') ?? null);
      setTick((s) => s + 1);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  if (!mc) return null;

  const passed = mc.checkpoints.filter((c) => c.passed).length;
  const total  = mc.checkpoints.length;
  const pct    = Math.round((passed / total) * 100);

  const STATUS_COLOR: Record<string, string> = {
    LIVE: '#00FF88', BETA: '#FFD700', PLANNING: '#AA2DFF', OFFLINE: '#FF4444',
  };

  return (
    <div style={{ background: 'rgba(5,5,16,0.96)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 14, overflow: 'hidden', fontFamily: "'Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,255,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: '#00FF88', textTransform: 'uppercase' }}>Michael Charlie</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>TMI CONDUCTOR · Reports to: Big Ace · {mc.currentAssignment?.toUpperCase()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 8px #00FF88', animation: tick % 2 === 0 ? 'none' : 'none' }} />
          <span style={{ fontSize: 9, fontWeight: 900, color: '#00FF88', letterSpacing: '0.1em' }}>ONLINE</span>
        </div>
      </div>

      {/* Current Goal */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 5 }}>CURRENT GOAL</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#FFD700' }}>{mc.currentGoal}</div>
      </div>

      {/* Launch Gate Progress */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)' }}>LAUNCH CHECKPOINTS</div>
          <div style={{ fontSize: 10, fontWeight: 900, color: pct === 100 ? '#00FF88' : '#FFD700' }}>{passed}/{total}</div>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 10 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#00FF88' : '#FFD700', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {mc.checkpoints.map((cp) => (
            <div key={cp.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: cp.passed ? '#00FF88' : 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                {cp.passed ? '✓' : '○'}
              </span>
              <span style={{ fontSize: 10, color: cp.passed ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>
                {cp.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Tasks */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>ACTIVE TASKS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {mc.tasks.map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
              <span style={{ color: '#00FF88', fontSize: 8 }}>▸</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Business Registry */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>BUSINESS REGISTRY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {businesses.map((biz) => (
            <div key={biz.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: biz.id === mc.currentAssignment ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: biz.id === mc.currentAssignment ? 700 : 400 }}>
                {biz.name}
              </span>
              <span style={{ fontSize: 8, fontWeight: 900, color: STATUS_COLOR[biz.status] ?? '#fff', letterSpacing: '0.1em' }}>
                {biz.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
