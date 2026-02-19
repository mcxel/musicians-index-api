/**
 * ==================================================================================
 * COMPLIANCE PORTAL PAGE
 * ==================================================================================
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { LawBubbleWidget } from '@/components/law-bubble/LawBubbleWidget';

export default function CompliancePortalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LawBubbleWidget userId="demo-user-compliance" position="bottom-right" />

      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/danikaslaw" className="text-2xl">⚖️</Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Compliance Portal</h1>
              <p className="text-sm text-gray-500">Warrants, subpoenas & legal requests</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Pending Requests
            </h3>
            <p className="text-4xl font-bold text-orange-600 mb-2">7</p>
            <p className="text-sm text-gray-600">Require immediate attention</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Completed
            </h3>
            <p className="text-4xl font-bold text-green-600 mb-2">142</p>
            <p className="text-sm text-gray-600">Successfully processed</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              Avg Response Time
            </h3>
            <p className="text-4xl font-bold text-blue-600 mb-2">4.2</p>
            <p className="text-sm text-gray-600">Days (target: 5 days)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
