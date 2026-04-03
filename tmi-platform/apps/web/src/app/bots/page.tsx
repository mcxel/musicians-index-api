'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import SectionTitle from '@/components/ui/SectionTitle';

type Bot = {
  id: string;
  name: string;
  role: string;
  type: string;
  status: 'RUNNING' | 'IDLE' | 'ERROR' | 'STOPPED';
  lastRun: string;
  jobsToday: number;
  icon: string;
  description: string;
};

const BOTS: Bot[] = [
  { id: '1', name: 'Reporter Bot', role: 'Writes articles & news', type: 'CONTENT', status: 'RUNNING', lastRun: '5 min ago', jobsToday: 12, icon: '✍️', description: 'Scans the platform for newsworthy events and auto-drafts articles for editorial review.' },
  { id: '2', name: 'Interview Bot', role: 'Interviews artists on schedule', type: 'CONTENT', status: 'IDLE', lastRun: '2 hrs ago', jobsToday: 2, icon: '🎤', description: 'Pulls artist data and generates interview Q&A content from platform activity.' },
  { id: '3', name: 'Sponsor Bot', role: 'Finds & contacts sponsors', type: 'BUSINESS', status: 'RUNNING', lastRun: '22 min ago', jobsToday: 4, icon: '💼', description: 'Matches platform metrics with potential sponsors and sends outreach proposals.' },
  { id: '4', name: 'Booking Bot', role: 'Books venues & events', type: 'BUSINESS', status: 'RUNNING', lastRun: '8 min ago', jobsToday: 9, icon: '📅', description: 'Scouts available venues and sends booking requests on behalf of platform artists.' },
  { id: '5', name: 'Ranking Bot', role: 'Updates charts & leaderboards', type: 'ANALYTICS', status: 'RUNNING', lastRun: '15 min ago', jobsToday: 6, icon: '🏆', description: 'Recalculates all ranking, chart, and leaderboard data on a live schedule.' },
  { id: '6', name: 'Crown Bot', role: 'Selects the weekly winner', type: 'CONTEST', status: 'IDLE', lastRun: '3 days ago', jobsToday: 0, icon: '👑', description: 'Runs the weekly crown algorithm — tallies votes, validates entries, declares the winner.' },
  { id: '7', name: 'Archive Bot', role: 'Saves magazine issues', type: 'CONTENT', status: 'RUNNING', lastRun: '1 hr ago', jobsToday: 1, icon: '📦', description: 'Generates and archives magazine issues every week from published content.' },
  { id: '8', name: 'Broadcast Bot', role: 'Live room previews & alerts', type: 'LIVE', status: 'RUNNING', lastRun: '1 min ago', jobsToday: 47, icon: '📡', description: 'Monitors live rooms and pushes preview cards and alerts to the homepage and feeds.' },
  { id: '9', name: 'Analytics Bot', role: 'Stats & reporting', type: 'ANALYTICS', status: 'RUNNING', lastRun: '30 min ago', jobsToday: 3, icon: '📊', description: 'Aggregates platform-wide stats and generates hourly/daily/weekly reports for admin.' },
  { id: '10', name: 'Security Bot', role: 'Anti-spam & moderation', type: 'SECURITY', status: 'RUNNING', lastRun: '1 min ago', jobsToday: 87, icon: '🛡️', description: 'Detects spam, fake accounts, vote manipulation, and flagged content in real time.' },
  { id: '11', name: 'Social Bot', role: 'Notifications & social alerts', type: 'SOCIAL', status: 'RUNNING', lastRun: '3 min ago', jobsToday: 234, icon: '🔔', description: 'Sends push notifications, email digests, and activity summaries to users.' },
  { id: '12', name: 'Store Bot', role: 'Recommendations & inventory', type: 'STORE', status: 'IDLE', lastRun: '45 min ago', jobsToday: 0, icon: '🛍️', description: 'Suggests store items to users based on platform behavior and purchase history.' },
];

const STATUS_COLORS: Record<string, string> = { RUNNING: '#22c55e', IDLE: '#FFD700', ERROR: '#FF4444', STOPPED: '#555' };
const TYPE_COLORS: Record<string, string> = { CONTENT: '#FF2DAA', BUSINESS: '#FFD700', ANALYTICS: '#00FFFF', CONTEST: '#AA2DFF', LIVE: '#FF4444', SECURITY: '#FF2DAA', SOCIAL: '#00FFFF', STORE: '#AA2DFF' };
const TYPES = ['ALL', 'CONTENT', 'BUSINESS', 'ANALYTICS', 'CONTEST', 'LIVE', 'SECURITY', 'SOCIAL', 'STORE'];

export default function BotsDashboardPage() {
  const [bots, setBots] = useState<Bot[]>(BOTS);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState<Bot | null>(null);

  useEffect(() => {
    fetch('/api/bots/status')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length) setBots(data); })
      .catch(() => {});
  }, []);

  const filtered = filter === 'ALL' ? bots : bots.filter((b) => b.type === filter);
  const running = bots.filter((b) => b.status === 'RUNNING').length;

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
          {/* Hero */}
          <div style={{ background: 'linear-gradient(160deg, #021a10 0%, #050510 60%)', padding: '48px 32px 32px', borderBottom: '1px solid #00FF8833' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#00FF88', textTransform: 'uppercase', marginBottom: 8 }}>PLATFORM ENGINE</div>
              <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>BOT ENGINE</h1>
              <p style={{ color: '#aaa', fontSize: 14, maxWidth: 480 }}>The automated workforce that keeps the platform alive — content, rankings, security, and more.</p>
              <div style={{ marginTop: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#22c55e', fontWeight: 900, fontSize: 28 }}>{running}</div>
                  <div style={{ color: '#555', fontSize: 11, letterSpacing: 1 }}>RUNNING</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 28 }}>{bots.length}</div>
                  <div style={{ color: '#555', fontSize: 11, letterSpacing: 1 }}>TOTAL BOTS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#00FFFF', fontWeight: 900, fontSize: 28 }}>{bots.reduce((s, b) => s + b.jobsToday, 0)}</div>
                  <div style={{ color: '#555', fontSize: 11, letterSpacing: 1 }}>JOBS TODAY</div>
                </div>
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 28 }}>
              {TYPES.map((t) => (
                <button key={t} onClick={() => setFilter(t)} style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${filter === t ? '#00FF88' : '#333'}`, background: filter === t ? '#00FF8822' : 'transparent', color: filter === t ? '#00FF88' : '#888', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontWeight: 700 }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '48px 32px 0' }}>
            <SectionTitle accent="#00FF88">ACTIVE BOTS</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 24 }}>
              {filtered.map((bot, i) => {
                const sc = STATUS_COLORS[bot.status] ?? '#555';
                const tc = TYPE_COLORS[bot.type] ?? '#00FFFF';
                return (
                  <motion.div key={bot.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setSelected(bot === selected ? null : bot)} style={{ background: '#0a0a1a', border: `1px solid ${selected?.id === bot.id ? tc : '#1a1a2e'}`, borderLeft: `3px solid ${sc}`, borderRadius: 12, padding: '18px 20px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 28 }}>{bot.icon}</span>
                        <div>
                          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{bot.name}</div>
                          <div style={{ color: '#555', fontSize: 11 }}>{bot.role}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <div style={{ background: `${sc}22`, color: sc, fontSize: 9, fontWeight: 800, letterSpacing: 2, padding: '3px 8px', borderRadius: 10, border: `1px solid ${sc}44` }}>{bot.status}</div>
                        <div style={{ color: tc, fontSize: 9, letterSpacing: 1 }}>{bot.type}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#444', marginTop: 8 }}>
                      <span>Last run: <span style={{ color: '#666' }}>{bot.lastRun}</span></span>
                      <span><span style={{ color: '#00FFFF' }}>{bot.jobsToday}</span> jobs today</span>
                    </div>
                    <AnimatePresence>
                      {selected?.id === bot.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #1a1a2e', color: '#888', fontSize: 12, lineHeight: 1.6 }}>{bot.description}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
