'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MeUser { id: string; email: string; name?: string; role: string; }

const ACCENT = '#FFD700';

const STATS = [
  { label: 'Active Ads',       value: '0',    icon: '📢', color: '#FFD700' },
  { label: 'Impressions',      value: '0',    icon: '👁️', color: '#FF2DAA' },
  { label: 'Click-Through',    value: '0%',   icon: '🖱️', color: '#00FFFF' },
  { label: 'Budget Remaining', value: '$0',   icon: '💳', color: '#AA2DFF' },
];

const PRIMARY_ACTIONS = [
  { label: 'NEW CAMPAIGN',    icon: '📢', href: '/advertiser/campaigns',  color: '#FFD700', desc: 'Launch a new ad campaign' },
  { label: 'AD PLACEMENTS',   icon: '📍', href: '/advertiser/placements', color: '#FF2DAA', desc: 'Manage placement zones' },
  { label: 'ANALYTICS',       icon: '📊', href: '/advertiser/analytics',  color: '#00FFFF', desc: 'Impressions, CTR, spend' },
  { label: 'CONTRACTS',       icon: '📋', href: '/advertiser/contracts',  color: '#AA2DFF', desc: 'View signed agreements' },
  { label: 'PAYMENTS',        icon: '💳', href: '/advertiser/payments',   color: '#FFD700', desc: 'Billing & invoices' },
  { label: 'AD CREATIVE',     icon: '🎨', href: '/advertiser/creative',   color: '#FF2DAA', desc: 'Upload banners & video' },
  { label: 'TARGETING',       icon: '🎯', href: '/advertiser/targeting',  color: '#00FFFF', desc: 'Audience & genre filters' },
  { label: 'AD PACKAGES',     icon: '📦', href: '/advertiser/payments',   color: '#AA2DFF', desc: 'Buy ad bundles' },
];

const PLACEMENT_ZONES = [
  { label: 'Home Billboard #1',  icon: '🏠', href: '/home/1',           color: '#FFD700', desc: 'Highest-traffic placement' },
  { label: 'Live Room Banners',  icon: '📺', href: '/live/rooms',       color: '#FF2DAA', desc: 'Shown during live events' },
  { label: 'Live Billboards',    icon: '📡', href: '/live/billboards',  color: '#AA2DFF', desc: 'Billboard loop screen' },
  { label: 'Lobby Wall Ads',     icon: '🎨', href: '/live/lobby-wall',  color: '#00FFFF', desc: 'Fan lobby display' },
  { label: 'Performer Profiles', icon: '🎤', href: '/performers',       color: '#FFD700', desc: 'Sidebar & banner slots' },
  { label: 'Magazine Pages',     icon: '📰', href: '/magazine',         color: '#FF2DAA', desc: 'In-article placements' },
];

const PLATFORM_LINKS = [
  { label: 'HOME RAIL',    icon: '🏠', href: '/home/1',                desc: 'Billboard #1',    color: '#FFD700' },
  { label: 'ADMIN PANEL',  icon: '👑', href: '/admin/owner-dashboard', desc: 'Owner access',    color: '#FF9500' },
  { label: 'LIVE LOBBY',   icon: '🏟️', href: '/live/lobby',           desc: 'Active live hub', color: '#00FFFF' },
  { label: 'STORE HUB',    icon: '🛒', href: '/store',                 desc: 'TMI store',       color: '#AA2DFF' },
];

const AD_PACKAGES = [
  { name: 'Starter',    price: '$99/mo',  features: ['3 placements', '10K impressions', 'Basic analytics'], color: '#FFD700' },
  { name: 'Growth',     price: '$299/mo', features: ['10 placements', '50K impressions', 'Home rail slot'], color: '#FF2DAA' },
  { name: 'Billboard',  price: '$799/mo', features: ['Unlimited slots', 'Live room feature', 'Home #1 priority'], color: '#AA2DFF' },
];

export default function AdvertiserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' });
        if (res.status === 401 || res.status === 403) { router.replace('/auth'); return; }
        const data = await res.json() as { authenticated: boolean; user?: MeUser };
        if (!data.authenticated || !data.user) { router.replace('/auth'); return; }
        setUser(data.user);
      } catch { router.replace('/auth'); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: ACCENT, fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING ADVERTISER HUB...</span>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: 'rgba(0,0,0,0.85)', borderBottom: '1px solid rgba(255,215,0,0.2)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: ACCENT, fontWeight: 800 }}>ADVERTISER COMMAND CENTER</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{user?.name ?? 'Advertiser'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/hub/advertiser" style={{ fontSize: 10, color: ACCENT, border: '1px solid rgba(255,215,0,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em' }}>ADVERTISER HUB</Link>
          <Link href="/admin/owner-dashboard" style={{ fontSize: 10, color: '#FF9500', border: '1px solid rgba(255,149,0,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700, letterSpacing: '0.1em' }}>ADMIN</Link>
          <Link href="/advertiser/analytics" style={{ fontSize: 10, color: ACCENT, border: '1px solid rgba(255,215,0,0.3)', padding: '5px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>ANALYTICS</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}30`, borderRadius: 12, padding: '18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: '#555', marginTop: 4, textTransform: 'uppercase' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(170,45,255,0.08))', border: '1.5px solid rgba(255,215,0,0.3)', borderRadius: 16, padding: '24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.3em', color: ACCENT, fontWeight: 800, marginBottom: 6 }}>📢 REACH THOUSANDS OF MUSIC FANS</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Your Brand on Every Stage</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Place ads on live rooms, home billboard, performer profiles, and the magazine.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Link href="/advertiser/campaigns" style={{ padding: '13px 28px', background: `linear-gradient(90deg,${ACCENT},#FFA500)`, borderRadius: 9, color: '#000', fontWeight: 900, fontSize: 13, textDecoration: 'none', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>NEW CAMPAIGN</Link>
            <Link href="/advertiser/payments" style={{ padding: '13px 20px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 9, color: ACCENT, fontWeight: 800, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>AD PACKAGES</Link>
          </div>
        </motion.div>

        {/* Primary Actions */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 14 }}>QUICK ACTIONS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {PRIMARY_ACTIONS.map((a, i) => (
              <motion.div key={a.href + a.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <Link href={a.href} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', background: `${a.color}08`, border: `1px solid ${a.color}25`, borderRadius: 10, textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{a.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: a.color, letterSpacing: '0.1em' }}>{a.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{a.desc}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ad Placement Zones */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', fontWeight: 800, marginBottom: 14 }}>ACTIVE PLACEMENT ZONES</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 10 }}>
            {PLACEMENT_ZONES.map((z, i) => (
              <motion.div key={z.href + z.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
                <Link href={z.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: `${z.color}06`, border: `1px solid ${z.color}20`, borderRadius: 10, textDecoration: 'none' }}>
                  <span style={{ fontSize: 22 }}>{z.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: z.color }}>{z.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{z.desc}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ad Packages + Platform Links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
          {/* Packages */}
          <div style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 14, padding: '20px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: ACCENT, fontWeight: 800, marginBottom: 14 }}>AD PACKAGES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AD_PACKAGES.map((p) => (
                <Link key={p.name} href="/advertiser/payments" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: `${p.color}08`, border: `1px solid ${p.color}25`, borderRadius: 9, textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: p.color }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{p.features.join(' · ')}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: p.color }}>{p.price}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div style={{ background: 'rgba(170,45,255,0.04)', border: '1px solid rgba(170,45,255,0.12)', borderRadius: 14, padding: '20px' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#AA2DFF', fontWeight: 800, marginBottom: 14 }}>PLATFORM CONNECTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PLATFORM_LINKS.map((p) => (
                <Link key={p.href} href={p.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: `${p.color}08`, border: `1px solid ${p.color}20`, borderRadius: 8, textDecoration: 'none' }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: p.color }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{p.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
