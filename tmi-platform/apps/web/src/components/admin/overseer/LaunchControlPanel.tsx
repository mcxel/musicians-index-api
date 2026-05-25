'use client';

import { useCallback, useEffect, useState } from 'react';

type PlatformVisibility = 'private' | 'soft-launch' | 'public';
interface Flags { onboardingOpen: boolean; invitesAllowed: boolean; visibility: PlatformVisibility; telemetryOn: boolean; }
interface Snap extends Flags { updatedAt: number; updatedBy: string; }
interface ApiState { flags: Flags; history: Snap[]; ready: boolean; }

const VIS_COLOR: Record<PlatformVisibility, string> = { private: '#FF4444', 'soft-launch': '#FFD700', public: '#00FF88' };

export default function LaunchControlPanel() {
  const [state,  setState]  = useState<ApiState | null>(null);
  const [acting, setActing] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try { const r = await fetch('/api/admin/overseer'); if (r.ok) setState(await r.json() as ApiState); } catch {}
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function act(action: string) {
    setActing(true); setNotice('');
    try {
      const r    = await fetch('/api/admin/overseer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      const data = await r.json() as { message?: string };
      setNotice(data.message ?? (r.ok ? 'Done.' : 'Error — are you logged in as ADMIN?'));
      await load();
    } finally { setActing(false); }
  }

  async function toggle(key: keyof Flags) {
    if (!state) return;
    setActing(true);
    const val = !state.flags[key];
    try { const r = await fetch('/api/admin/overseer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flags: { [key]: val } }) }); if (r.ok) await load(); }
    finally { setActing(false); }
  }

  async function setVis(v: PlatformVisibility) {
    setActing(true);
    try { const r = await fetch('/api/admin/overseer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flags: { visibility: v } }) }); if (r.ok) await load(); }
    finally { setActing(false); }
  }

  const f   = state?.flags;
  const vis = f?.visibility ?? 'private';

  return (
    <section style={{ marginBottom: 24, borderRadius: 16, border: `1.5px solid ${VIS_COLOR[vis]}55`, background: `${VIS_COLOR[vis]}07`, padding: '20px 22px' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: VIS_COLOR[vis], boxShadow: `0 0 10px ${VIS_COLOR[vis]}`, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', color: VIS_COLOR[vis] }}>PLATFORM LAUNCH CONTROLS</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            Status: <strong style={{ color: VIS_COLOR[vis] }}>{vis.toUpperCase()}</strong>
            {state?.ready && <span style={{ color: '#00FF88', marginLeft: 8 }}>✅ SOFT LAUNCH READY</span>}
          </div>
        </div>
        {state?.history?.[0] && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>
            {state.history[0].updatedBy}<br />{new Date(state.history[0].updatedAt).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* One-click actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: '📡 SOFT LAUNCH',  action: 'soft-launch', color: '#FFD700' },
          { label: '🌐 GO PUBLIC',    action: 'public',      color: '#00FF88' },
          { label: '🔒 LOCK DOWN',    action: 'lockdown',    color: '#FF4444' },
        ].map(btn => (
          <button key={btn.action} onClick={() => void act(btn.action)} disabled={acting}
            style={{ padding: '8px 16px', background: `${btn.color}14`, border: `1.5px solid ${btn.color}60`, borderRadius: 8, color: btn.color, fontWeight: 900, fontSize: 10, cursor: acting ? 'wait' : 'pointer', letterSpacing: '0.08em' }}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Flag toggles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 12 }}>
        {([
          { key: 'onboardingOpen', label: 'Onboarding Open' },
          { key: 'invitesAllowed', label: 'Invites Allowed' },
          { key: 'telemetryOn',    label: 'Telemetry On' },
        ] as { key: keyof Flags; label: string }[]).map(item => {
          const on = f?.[item.key] === true;
          return (
            <button key={item.key} onClick={() => void toggle(item.key)} disabled={acting}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: on ? 'rgba(0,255,136,0.07)' : 'rgba(255,255,255,0.02)', border: `1px solid ${on ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: on ? '#00FF88' : 'rgba(255,255,255,0.5)' }}>{item.label}</span>
              <span style={{ width: 32, height: 18, borderRadius: 9, background: on ? '#00FF88' : 'rgba(255,255,255,0.12)', position: 'relative', display: 'inline-block', flexShrink: 0 }}>
                <span style={{ position: 'absolute', top: 2, left: on ? 15 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.18s' }} />
              </span>
            </button>
          );
        })}
        {/* Visibility pills */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {(['private', 'soft-launch', 'public'] as PlatformVisibility[]).map(v => (
            <button key={v} onClick={() => void setVis(v)} disabled={acting}
              style={{ padding: '4px 10px', borderRadius: 5, border: `1px solid ${vis === v ? VIS_COLOR[v] : 'rgba(255,255,255,0.1)'}`, background: vis === v ? `${VIS_COLOR[v]}18` : 'transparent', color: vis === v ? VIS_COLOR[v] : 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>
              {v === 'soft-launch' ? 'SOFT' : v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {notice && <div style={{ fontSize: 11, color: notice.includes('Error') ? '#FF6B6B' : '#00FF88', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 6 }}>{notice}</div>}
    </section>
  );
}
