/**
 * ==================================================================================
 * SPONSOR DASHBOARD - MUSICIAN INDEX
 * ==================================================================================
 * 
 * Earnings overview and analytics for musicians/sponsors
 * 
 * Features:
 * - Total earnings (all-time, monthly, daily)
 * - Revenue breakdown by source (arena, emotes, ads, direct)
 * - Sponsor placement analytics (impressions, clicks, CTR)
 * - Payment history table
 * - Revenue graphs and charts
 * - Export capabilities
 * 
 * ==================================================================================
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RevenueChart } from './RevenueChart';

export interface RevenueSources {
  arena: number;
  emotes: number;
  accessories: number;
  sponsorAds: number;
  directTips: number;
  playlistShare: number;
}

export interface SponsorPlacement {
  id: string;
  platform: string;
  location: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
}

export interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  type: string;
  status: 'pending' | 'completed' | 'failed';
}

interface SponsorDashboardProps {
  artistId: string;
  artistName: string;
  tier: 'FREE' | 'PREMIUM' | 'VIP' | 'SPONSOR' | 'OVERSEER';
}

export function SponsorDashboard({ artistId, artistName, tier }: SponsorDashboardProps) {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Mock data - would be fetched from API
  const mockRevenue: RevenueSources = {
    arena: 2450.50,
    emotes: 1200.00,
    accessories: 850.75,
    sponsorAds: 5600.00,
    directTips: 380.25,
    playlistShare: 1850.00,
  };

  const totalRevenue = Object.values(mockRevenue).reduce((sum, val) => sum + val, 0);

  const mockPlacements: SponsorPlacement[] = [
    {
      id: 'sp_001',
      platform: 'DanikaLaw',
      location: 'Home Page Banner',
      impressions: 45678,
      clicks: 1234,
      ctr: 2.7,
      revenue: 2800.00,
    },
    {
      id: 'sp_002',
      platform: 'Arena',
      location: 'Stage Backdrop',
      impressions: 32100,
      clicks: 890,
      ctr: 2.8,
      revenue: 2800.00,
    },
  ];

  const mockPayments: PaymentRecord[] = [
    {
      id: 'pay_001',
      date: new Date('2026-02-01'),
      amount: 5600.00,
      type: 'Monthly Sponsor Revenue',
      status: 'completed',
    },
    {
      id: 'pay_002',
      date: new Date('2026-01-15'),
      amount: 2450.50,
      type: 'Arena Performance',
      status: 'completed',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sponsor Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            {artistName} • {tier} Tier
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6 flex gap-2">
          {(['today', 'week', 'month', 'all'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                timeframe === t
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-6 text-white"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm font-medium mb-2 opacity-90">Total Revenue</div>
            <div className="text-4xl font-bold mb-1">${totalRevenue.toFixed(2)}</div>
            <div className="text-sm opacity-75">This Month</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm font-medium text-gray-600 mb-2">Sponsor Ads</div>
            <div className="text-3xl font-bold text-yellow-600">${mockRevenue.sponsorAds.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">+12% vs last month</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm font-medium text-gray-600 mb-2">Arena Revenue</div>
            <div className="text-3xl font-bold text-green-600">${mockRevenue.arena.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">8 performances</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-sm font-medium text-gray-600 mb-2">Playlist Share</div>
            <div className="text-3xl font-bold text-purple-600">${mockRevenue.playlistShare.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">12 URLs ranked</div>
          </motion.div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Revenue Breakdown</h2>
          <RevenueChart revenueSources={mockRevenue} />
        </div>

        {/* Sponsor Placements */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Sponsor Placements</h2>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impressions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockPlacements.map(placement => (
                <tr key={placement.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{placement.platform}</td>
                  <td className="px-4 py-3">{placement.location}</td>
                  <td className="px-4 py-3">{placement.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3">{placement.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3">{placement.ctr}%</td>
                  <td className="px-4 py-3 font-bold text-green-600">${placement.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Payment History</h2>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{payment.date.toLocaleDateString()}</td>
                  <td className="px-4 py-3">{payment.type}</td>
                  <td className="px-4 py-3 font-bold">${payment.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
