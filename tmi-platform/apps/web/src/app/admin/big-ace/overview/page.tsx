// /admin/big-ace/overview: Executive command center dashboard
'use client';
import { useEffect, useState } from 'react';
import AdminVisualCommandSummaryCard from '@/components/admin/AdminVisualCommandSummaryCard';
import AdminVideoObservatorySummaryCard from '@/components/admin/AdminVideoObservatorySummaryCard';
import AdminBotGovernanceSummaryCard from '@/components/admin/AdminBotGovernanceSummaryCard';
import Link from 'next/link';

interface SystemMetrics {
  liveUsers: number;
  liveRooms: number;
  liveVenues: number;
  liveEvents: number;
  activeBots: number;
  activePromotions: number;
  activeTickets: number;
  activeSubscriptions: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
}

interface RewardGovernorDecision {
  phase: 'launch' | 'growth' | 'cash';
  allowCashRewards: boolean;
  allowPlatformCredits: boolean;
  reasons: string[];
}

const defaultMetrics: SystemMetrics = {
  liveUsers: 2847,
  liveRooms: 156,
  liveVenues: 42,
  liveEvents: 18,
  activeBots: 12,
  activePromotions: 34,
  activeTickets: 823,
  activeSubscriptions: 5421,
  revenueToday: 12450,
  revenueWeek: 89200,
  revenueMonth: 356800,
};

export default function BigAceOverviewPage() {
  const [metrics] = useState<SystemMetrics>(defaultMetrics);
  const [governorDecision, setGovernorDecision] = useState<RewardGovernorDecision | null>(null);

  useEffect(() => {
    let stopped = false;

    async function loadGovernor() {
      try {
        const res = await fetch('/api/economy/reward-governor', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!stopped) {
          setGovernorDecision((data?.decision ?? null) as RewardGovernorDecision | null);
        }
      } catch {
        // Keep dashboard resilient on transient API errors.
      }
    }

    void loadGovernor();
    const id = setInterval(() => {
      void loadGovernor();
    }, 5000);

    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, []);

  const phase = governorDecision?.phase ?? 'launch';
  const phaseColor = phase === 'cash' ? 'text-green-400 border-green-500' : phase === 'growth' ? 'text-yellow-400 border-yellow-500' : 'text-pink-400 border-pink-500';

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <AdminBotGovernanceSummaryCard />
        </div>
        <div className="mb-6">
          <AdminVisualCommandSummaryCard />
        </div>
        <div className="mb-6">
          <AdminVideoObservatorySummaryCard />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Big Ace Command Center</h1>
          <p className="text-green-400">System Status: ACTIVE</p>
        </div>

        <div className="mb-8 bg-gray-900 border-2 border-cyan-500 rounded-lg p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-cyan-300 font-mono text-sm mb-2">REVENUE GOVERNOR MODE</h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded border text-xs font-bold uppercase tracking-widest ${phaseColor}`}>
                {phase}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="px-3 py-2 rounded border border-pink-500/40 bg-pink-500/10">
                <div className="text-pink-300 font-semibold">Cash Rewards</div>
                <div className="text-white font-bold">{governorDecision?.allowCashRewards ? 'Enabled' : 'Disabled'}</div>
              </div>
              <div className="px-3 py-2 rounded border border-yellow-500/40 bg-yellow-500/10">
                <div className="text-yellow-300 font-semibold">Credits</div>
                <div className="text-white font-bold">{governorDecision?.allowPlatformCredits ? 'Enabled' : 'Disabled'}</div>
              </div>
              <div className="px-3 py-2 rounded border border-cyan-500/40 bg-cyan-500/10">
                <div className="text-cyan-300 font-semibold">XP / Trophies</div>
                <div className="text-white font-bold">Enabled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Live Users */}
          <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-300 text-sm font-mono">LIVE USERS</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-4xl font-bold text-green-400">{metrics.liveUsers.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">Active across all systems</div>
          </div>

          {/* Live Rooms */}
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-300 text-sm font-mono">LIVE ROOMS</h3>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-4xl font-bold text-yellow-400">{metrics.liveRooms.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">Active performance spaces</div>
          </div>

          {/* Live Venues */}
          <div className="bg-gray-900 border-2 border-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-300 text-sm font-mono">LIVE VENUES</h3>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="text-4xl font-bold text-white">{metrics.liveVenues.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">Active venues streaming</div>
          </div>

          {/* Live Events */}
          <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-300 text-sm font-mono">LIVE EVENTS</h3>
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-4xl font-bold text-cyan-400">{metrics.liveEvents.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">Currently broadcasting</div>
          </div>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Active Systems */}
          <div className="bg-gray-900 border-2 border-green-500 rounded-lg p-6">
            <h3 className="text-green-400 font-mono text-sm mb-4">ACTIVE SYSTEMS</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Bots</span>
                <span className="text-green-400 font-bold">{metrics.activeBots}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Promotions</span>
                <span className="text-yellow-400 font-bold">{metrics.activePromotions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Tickets</span>
                <span className="text-cyan-400 font-bold">{metrics.activeTickets}</span>
              </div>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6">
            <h3 className="text-yellow-400 font-mono text-sm mb-4">SUBSCRIPTIONS</h3>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{metrics.activeSubscriptions.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Active across all tiers</div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Pro</span>
                <span className="text-yellow-400">1,200</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Gold</span>
                <span className="text-yellow-400">3,100</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Diamond</span>
                <span className="text-yellow-400">1,121</span>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gray-900 border-2 border-white rounded-lg p-6">
            <h3 className="text-white font-mono text-sm mb-4">REVENUE</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Today</span>
                <span className="text-white font-bold">${metrics.revenueToday.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Week</span>
                <span className="text-white font-bold">${metrics.revenueWeek.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Month</span>
                <span className="text-white font-bold">${metrics.revenueMonth.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Command Shortcuts */}
        <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6">
          <h3 className="text-white font-mono text-sm mb-4">COMMAND SHORTCUTS</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <a href="/admin/big-ace/sites" className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-mono text-xs text-center">Sites</a>
            <a href="/admin/big-ace/promotions" className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded font-mono text-xs text-center">Promotions</a>
            <a href="/admin/big-ace/events" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black rounded font-mono text-xs text-center">Events</a>
            <a href="/admin/big-ace/memory" className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-mono text-xs text-center">Memory</a>
            <a href="/admin/big-ace/emergency" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-mono text-xs text-center">Emergency</a>
            <a href="/admin" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono text-xs text-center">Back</a>
          </div>
          <div className="mt-4 text-right text-xs text-cyan-300">
            <Link href="/admin/visual-command">Open Visual Command Window →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
