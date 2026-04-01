'use client';

import { useState } from 'react';
import Link from 'next/link';

const VENUES = [
  { id: '1', name: 'The Underground', city: 'Lagos, NG', cooldownDays: 30, repeatPenalty: 20, exposureThreshold: 100 },
  { id: '2', name: 'Jakarta Arena', city: 'Jakarta, ID', cooldownDays: 45, repeatPenalty: 20, exposureThreshold: 150 },
  { id: '3', name: 'Blue Note NYC', city: 'New York, US', cooldownDays: 60, repeatPenalty: 15, exposureThreshold: 200 },
];

export default function AdminBookingRulesPage() {
  const [globalCooldown, setGlobalCooldown] = useState(30);
  const [globalRepeatPenalty, setGlobalRepeatPenalty] = useState(20);
  const [globalExposureThreshold, setGlobalExposureThreshold] = useState(100);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/admin" className="text-gray-400 hover:text-white text-sm transition-colors">← Admin</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-300">Booking Rules</span>
      </div>
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Booking Rules Config</h1>
      <p className="text-gray-400 mb-8">Configure cooldown periods, scoring penalties, and exposure thresholds for the recommendation engine.</p>

      {/* Scoring Formula Reference */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 text-xs text-gray-400">
        <p className="font-semibold text-white mb-1">Locked Scoring Formula</p>
        <p>Distance(25) + Genre(20) + Availability(15) + Budget(15) + ExposureBoost(15) + Participation(5) + Subscription(5) − RepeatPenalty(20) − RecentBooking(10)</p>
      </div>

      {/* Global Defaults */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-[#ff6b35] mb-5">Global Defaults</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Default Cooldown (days)</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={7} max={90} step={1} value={globalCooldown}
                onChange={(e) => setGlobalCooldown(Number(e.target.value))}
                aria-label="Default cooldown days"
                className="flex-1 accent-[#ff6b35]"
              />
              <span className="text-white font-bold w-8 text-right">{globalCooldown}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Repeat Penalty (pts)</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={0} max={30} step={1} value={globalRepeatPenalty}
                onChange={(e) => setGlobalRepeatPenalty(Number(e.target.value))}
                aria-label="Repeat penalty points"
                className="flex-1 accent-[#ff6b35]"
              />
              <span className="text-white font-bold w-8 text-right">{globalRepeatPenalty}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Exposure Boost Threshold (views)</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={10} max={500} step={10} value={globalExposureThreshold}
                onChange={(e) => setGlobalExposureThreshold(Number(e.target.value))}
                aria-label="Exposure boost threshold"
                className="flex-1 accent-[#ff6b35]"
              />
              <span className="text-white font-bold w-12 text-right">{globalExposureThreshold}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`mt-5 px-6 py-2 font-semibold rounded-lg text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white'}`}
        >
          {saved ? '✓ Saved' : 'Save Global Defaults'}
        </button>
      </div>

      {/* Per-Venue Overrides */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-sm text-gray-300">Per-Venue Overrides</h2>
        </div>
        <div className="divide-y divide-white/5">
          {VENUES.map((venue) => (
            <div key={venue.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{venue.name}</p>
                <p className="text-xs text-gray-400">{venue.city}</p>
              </div>
              <div className="flex items-center gap-6 text-xs text-gray-400">
                <span>Cooldown: <span className="text-white font-semibold">{venue.cooldownDays}d</span></span>
                <span>Penalty: <span className="text-white font-semibold">-{venue.repeatPenalty}pts</span></span>
                <span>Threshold: <span className="text-white font-semibold">{venue.exposureThreshold} views</span></span>
                <button className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
