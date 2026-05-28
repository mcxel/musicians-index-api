'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, Shield, Bell, Users, Palette, Radio, Database, Key } from 'lucide-react';

const SECTIONS = [
  { id: 'platform',     label: 'Platform',       icon: Settings, color: '#00FFFF',  desc: 'Visibility, soft launch, and feature flags' },
  { id: 'security',     label: 'Security',        icon: Shield,   color: '#FF2020',  desc: 'Auth, rate limits, and access control' },
  { id: 'notifications',label: 'Notifications',   icon: Bell,     color: '#FFD700',  desc: 'Email, SMS, and push notification routing' },
  { id: 'users',        label: 'User Roles',      icon: Users,    color: '#FF2DAA',  desc: 'Role assignments, invites, and admin grants' },
  { id: 'branding',     label: 'Branding',        icon: Palette,  color: '#AA2DFF',  desc: 'Colors, logos, and visual overrides' },
  { id: 'streaming',    label: 'Streaming',       icon: Radio,    color: '#00FF88',  desc: 'WebRTC config, bitrate, and room limits' },
  { id: 'database',     label: 'Data & Storage',  icon: Database, color: '#FFD700',  desc: 'Backups, retention, and export settings' },
  { id: 'api',          label: 'API Keys',        icon: Key,      color: '#00FFFF',  desc: 'Stripe, email, and third-party integrations' },
];

export default function AdminSettingsPage() {
  const [active, setActive] = useState('platform');

  return (
    <main className="min-h-screen text-white font-sans p-8" style={{ background: 'radial-gradient(ellipse at top, #0d0025 0%, #050510 55%, #000 100%)' }}>
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/overseer" style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: '0.14em', fontWeight: 700 }}>
            ← OVERSEER
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-[10px] font-black tracking-widest text-[#00FFFF]">ADMIN SETTINGS</span>
        </div>

        <h1 className="text-4xl font-black uppercase tracking-widest mb-8 text-white">
          Platform Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          {/* Sidebar */}
          <div className="flex flex-col gap-1">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                style={{
                  background: active === s.id ? `${s.color}12` : 'transparent',
                  border: `1px solid ${active === s.id ? s.color + '30' : 'transparent'}`,
                }}>
                <s.icon size={14} color={active === s.id ? s.color : 'rgba(255,255,255,0.3)'} />
                <span className="text-xs font-bold" style={{ color: active === s.id ? s.color : 'rgba(255,255,255,0.5)' }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div className="rounded-xl border p-6" style={{ background: '#0a0a1a', borderColor: 'rgba(255,255,255,0.08)' }}>
            {SECTIONS.filter(s => s.id === active).map(s => (
              <div key={s.id}>
                <div className="flex items-center gap-3 mb-2">
                  <s.icon size={18} color={s.color} />
                  <h2 className="text-lg font-black uppercase tracking-widest" style={{ color: s.color }}>{s.label}</h2>
                </div>
                <p className="text-xs text-white/40 mb-6">{s.desc}</p>
                <div className="rounded-lg border border-white/5 bg-black/30 p-4 text-xs text-white/30 font-mono">
                  Settings panel for <span style={{ color: s.color }}>{s.label}</span> will be wired to the platform engine in the next release.
                  <br /><br />
                  Navigate to <Link href="/admin/overseer" style={{ color: '#00FFFF', textDecoration: 'none' }}>/admin/overseer →</Link> for live controls.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
