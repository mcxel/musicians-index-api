/**
 * ==================================================================================
 * CASE MANAGEMENT PAGE
 * ==================================================================================
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LawBubbleWidget } from '@/components/law-bubble/LawBubbleWidget';

interface Case {
  id: string;
  caseNumber: string;
  client: string;
  caseType: 'Criminal' | 'Civil' | 'Family' | 'Corporate' | 'Tax';
  status: 'Active' | 'Pending' | 'Closed' | 'On Hold';
  attorney: string;
  filingDate: Date;
  nextHearing?: Date;
  priority: 'High' | 'Medium' | 'Low';
}

export default function CaseManagementPage() {
  const [cases] = useState<Case[]>([
    {
      id: 'case_001',
      caseNumber: 'DL-2026-001',
      client: 'Smith Corporation',
      caseType: 'Corporate',
      status: 'Active',
      attorney: 'Sarah Johnson',
      filingDate: new Date('2026-01-15'),
      nextHearing: new Date('2026-03-10'),
      priority: 'High',
    },
    {
      id: 'case_002',
      caseNumber: 'DL-2026-002',
      client: 'John Doe',
      caseType: 'Criminal',
      status: 'Active',
      attorney: 'Michael Chen',
      filingDate: new Date('2026-02-01'),
      nextHearing: new Date('2026-02-25'),
      priority: 'High',
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <LawBubbleWidget userId="demo-user-cases" position="bottom-right" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/danikaslaw" className="text-2xl">⚖️</Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
              <p className="text-sm text-gray-500">Track and manage all legal cases</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            + New Case
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cases</p>
                <p className="text-3xl font-bold text-blue-600">24</p>
              </div>
              <div className="text-4xl">📁</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Hearings</p>
                <p className="text-3xl font-bold text-orange-600">8</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-red-600">5</p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed This Month</p>
                <p className="text-3xl font-bold text-green-600">12</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Case Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Case #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attorney</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Hearing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cases.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-blue-600">{c.caseNumber}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{c.client}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {c.caseType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      c.status === 'Active' ? 'bg-green-100 text-green-800' :
                      c.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{c.attorney}</td>
                  <td className="px-6 py-4 text-sm">
                    {c.nextHearing ? c.nextHearing.toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                      View Details →
                    </button>
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
