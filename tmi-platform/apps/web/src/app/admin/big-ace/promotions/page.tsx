// /admin/big-ace/promotions: Promotion command center
'use client';
import { useState } from 'react';

interface Promotion {
  id: string;
  name: string;
  type: 'campaign' | 'billboard' | 'ad' | 'sponsor';
  status: 'active' | 'paused' | 'archived';
  reach: number;
  conversions: number;
  roi: number;
}

const promotions: Promotion[] = [
  { id: '1', name: 'Artist Summer Campaign', type: 'campaign', status: 'active', reach: 15240, conversions: 342, roi: 3.2 },
  { id: '2', name: 'Billboard - Times Square', type: 'billboard', status: 'active', reach: 8500, conversions: 156, roi: 2.8 },
  { id: '3', name: 'Sponsor Gold Tier', type: 'sponsor', status: 'active', reach: 12100, conversions: 287, roi: 3.5 },
  { id: '4', name: 'Summer Festival Ads', type: 'ad', status: 'paused', reach: 5200, conversions: 89, roi: 2.1 },
];

export default function BigAcePromotionsPage() {
  const [promoList, setPromoList] = useState<Promotion[]>(promotions);
  const [activePromo, setActivePromo] = useState<Promotion>(promotions[0]);
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [actionMsg, setActionMsg] = useState("");

  function updatePromo(id: string, patch: Partial<Promotion>) {
    setPromoList(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    setActivePromo(prev => prev.id === id ? { ...prev, ...patch } : prev);
  }

  function actOnActive(action: string) {
    setActionMsg(`${action}: ${activePromo.name}`);
    if (action === "Launch") updatePromo(activePromo.id, { status: "active" });
    else if (action === "Pause") updatePromo(activePromo.id, { status: "paused" });
    else if (action === "Archive") updatePromo(activePromo.id, { status: "archived" });
    else if (action === "Boost") updatePromo(activePromo.id, { reach: activePromo.reach + 500 });
    setTimeout(() => setActionMsg(""), 3000);
  }

  function batchAct(action: string) {
    selectedPromotions.forEach(id => {
      if (action === "Pause All") updatePromo(id, { status: "paused" });
      else if (action === "Boost All") setPromoList(prev => prev.map(p => selectedPromotions.includes(p.id) ? { ...p, reach: p.reach + 500 } : p));
    });
    setActionMsg(`${action} applied to ${selectedPromotions.length} item(s)`);
    setTimeout(() => setActionMsg(""), 3000);
  }

  const toggleSelection = (id: string) => {
    setSelectedPromotions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Promotions Command</h1>
          <p className="text-yellow-400 font-mono text-sm">Campaigns, billboards, ads, sponsors</p>
        </div>

        {/* Promotions List */}
        <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-6 mb-8">
          <h3 className="text-yellow-400 font-mono text-sm mb-4">ACTIVE PROMOTIONS</h3>
          {actionMsg && <div className="mb-4 p-3 bg-green-900 border border-green-500 rounded text-green-400 text-xs font-mono">{actionMsg}</div>}
          <div className="space-y-2">
            {promoList.map(promo => (
              <div
                key={promo.id}
                onClick={() => setActivePromo(promo)}
                className={`p-4 rounded border cursor-pointer transition ${
                  activePromo.id === promo.id
                    ? 'border-yellow-500 bg-gray-800'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold">{promo.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="bg-gray-700 px-2 py-1 rounded mr-2">{promo.type}</span>
                      <span className={`px-2 py-1 rounded ${promo.status === 'active' ? 'bg-green-900' : promo.status === 'paused' ? 'bg-yellow-900' : 'bg-gray-800'}`}>
                        {promo.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{promo.reach.toLocaleString()} reach</div>
                    <div className="text-yellow-400 text-xs mt-1">ROI: {promo.roi}x</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Promotion Control */}
        {activePromo && (
          <div className="bg-gray-900 border-2 border-yellow-500 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">{activePromo.name}</h2>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">REACH</div>
                <div className="text-2xl font-bold text-white">{activePromo.reach.toLocaleString()}</div>
              </div>
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">CONVERSIONS</div>
                <div className="text-2xl font-bold text-yellow-400">{activePromo.conversions}</div>
              </div>
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">ROI</div>
                <div className="text-2xl font-bold text-green-400">{activePromo.roi}x</div>
              </div>
              <div className="bg-gray-800 rounded p-4">
                <div className="text-gray-400 text-xs font-mono mb-1">CONVERSION RATE</div>
                <div className="text-2xl font-bold text-cyan-400">{((activePromo.conversions / activePromo.reach) * 100).toFixed(2)}%</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-8">
              <h3 className="text-yellow-400 font-mono text-sm mb-4">PROMOTION ACTIONS</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => actOnActive("Launch")} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-mono text-xs font-bold">Launch</button>
                <button onClick={() => actOnActive("Pause")} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded font-mono text-xs font-bold">Pause</button>
                <button onClick={() => actOnActive("Boost")} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black rounded font-mono text-xs font-bold">Boost</button>
                <button onClick={() => actOnActive("Archive")} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-mono text-xs font-bold">Archive</button>
              </div>
            </div>

            {/* Batch Actions */}
            <div className="bg-gray-800 rounded p-4 mb-8">
              <h3 className="text-white font-mono text-xs mb-3">BATCH ACTIONS</h3>
              <div className="flex gap-2 flex-wrap">
                {promoList.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPromotions.includes(p.id)}
                      onChange={() => toggleSelection(p.id)}
                      className="w-4 h-4"
                    />
                    {p.name.substring(0, 15)}
                  </label>
                ))}
              </div>
              {selectedPromotions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700 flex gap-2">
                  <button onClick={() => batchAct("Pause All")} className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-black rounded text-xs font-bold">Pause All</button>
                  <button onClick={() => batchAct("Boost All")} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black rounded text-xs font-bold">Boost All</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Return Button */}
        <a href="/admin/big-ace/overview" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-mono text-xs">← Back to Overview</a>
      </div>
    </div>
  );
}
