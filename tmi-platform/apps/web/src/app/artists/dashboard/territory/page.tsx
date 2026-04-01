'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ArtistTerritoryPage() {
  const [radiusKm, setRadiusKm] = useState(100);
  const [travelNational, setTravelNational] = useState(false);
  const [travelIntl, setTravelIntl] = useState(false);
  const [onlineAvailable, setOnlineAvailable] = useState(true);
  const [budgetMin, setBudgetMin] = useState(300);
  const [homeCity, setHomeCity] = useState('Lagos');
  const [homeCountry, setHomeCountry] = useState('NG');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard/artist" className="text-gray-400 hover:text-white text-sm transition-colors">← Artist Dashboard</Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-300">Territory Settings</span>
      </div>
      <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">Territory & Availability</h1>
      <p className="text-gray-400 mb-8">
        Configure where you can perform. Venues use this to find and recommend you for shows.
      </p>

      {/* Home Location */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5">
        <h2 className="font-bold text-[#ff6b35] mb-4">Home Location</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">City</label>
            <input
              type="text"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff6b35]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Country Code</label>
            <input
              type="text"
              value={homeCountry}
              onChange={(e) => setHomeCountry(e.target.value)}
              maxLength={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff6b35] uppercase"
            />
          </div>
        </div>
      </div>

      {/* Travel Radius */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-5">
        <h2 className="font-bold text-[#ff6b35] mb-4">Travel Radius</h2>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Local radius</span>
            <span className="text-white font-semibold">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min={10}
            max={500}
            step={10}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full accent-[#ff6b35]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10 km</span>
            <span>500 km</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Willing to travel nationally', value: travelNational, set: setTravelNational },
            { label: 'Willing to travel internationally', value: travelIntl, set: setTravelIntl },
            { label: 'Available for online/livestream shows', value: onlineAvailable, set: setOnlineAvailable },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{label}</span>
              <button
                onClick={() => set(!value)}
                className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-[#ff6b35]' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-[#ff6b35] mb-4">Minimum Fee</h2>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Minimum booking fee</span>
            <span className="text-white font-semibold">${budgetMin}</span>
          </div>
          <input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={budgetMin}
            onChange={(e) => setBudgetMin(Number(e.target.value))}
            className="w-full accent-[#ff6b35]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0 (negotiable)</span>
            <span>$5,000</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`w-full py-3 font-bold rounded-xl transition-all ${
          saved ? 'bg-green-500 text-white' : 'bg-[#ff6b35] hover:bg-[#ff6b35]/80 text-white'
        }`}
      >
        {saved ? '✓ Saved!' : 'Save Territory Settings'}
      </button>
    </main>
  );
}
