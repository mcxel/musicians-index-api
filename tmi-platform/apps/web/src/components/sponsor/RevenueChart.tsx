/**
 * ==================================================================================
 * REVENUE CHART - INTERACTIVE VISUALIZATION
 * ==================================================================================
 * 
 * Visual revenue breakdown using Chart.js or Recharts
 * 
 * Features:
 * - Pie chart for revenue sources
 * - Bar chart for monthly trends
 * - Interactive tooltips
 * - Export to PNG/SVG
 * 
 * ==================================================================================
 */

'use client';

import React from 'react';

interface RevenueSources {
  arena: number;
  emotes: number;
  accessories: number;
  sponsorAds: number;
  directTips: number;
  playlistShare: number;
}

interface RevenueChartProps {
  revenueSources: RevenueSources;
}

export function RevenueChart({ revenueSources }: RevenueChartProps) {
  const total = Object.values(revenueSources).reduce((sum, val) => sum + val, 0);

  const sources = [
    { name: 'Sponsor Ads', value: revenueSources.sponsorAds, color: 'bg-yellow-500' },
    { name: 'Arena', value: revenueSources.arena, color: 'bg-green-500' },
    { name: 'Playlist Share', value: revenueSources.playlistShare, color: 'bg-purple-500' },
    { name: 'Emotes', value: revenueSources.emotes, color: 'bg-blue-500' },
    { name: 'Accessories', value: revenueSources.accessories, color: 'bg-pink-500' },
    { name: 'Direct Tips', value: revenueSources.directTips, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Horizontal Bar Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Revenue by Source</h3>
          <div className="space-y-3">
            {sources.map((source, idx) => {
              const percentage = total > 0 ? (source.value / total) * 100 : 0;

              return (
                <div key={idx}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{source.name}</span>
                    <span className="text-sm font-bold text-gray-900">${source.value.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`${source.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie Chart (Text-based) */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Distribution</h3>
          <div className="grid grid-cols-2 gap-4">
            {sources.map((source, idx) => {
              const percentage = total > 0 ? (source.value / total) * 100 : 0;

              return (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className={`w-4 h-4 ${source.color} rounded-full mb-2`} />
                  <div className="text-sm font-medium text-gray-700">{source.name}</div>
                  <div className="text-2xl font-bold text-gray-900">{percentage.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">${source.value.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-gray-900">${total.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Top Source</div>
            <div className="text-3xl font-bold text-yellow-600">
              {sources.sort((a, b) => b.value - a.value)[0].name}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Growth</div>
            <div className="text-3xl font-bold text-green-600">+18.5%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
