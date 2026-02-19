/**
 * ==================================================================================
 * DOCUMENT VAULT PAGE
 * ==================================================================================
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LawBubbleWidget } from '@/components/law-bubble/LawBubbleWidget';

export default function DocumentVaultPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LawBubbleWidget userId="demo-user-docs" position="bottom-right" />

      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/danikaslaw" className="text-2xl">⚖️</Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
              <p className="text-sm text-gray-500">Secure encrypted document storage</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            📤 Upload Document
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg cursor-pointer">
            <div className="text-5xl mb-3">📁</div>
            <h3 className="font-semibold">Contracts</h3>
            <p className="text-sm text-gray-500 mt-1">142 files</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg cursor-pointer">
            <div className="text-5xl mb-3">📜</div>
            <h3 className="font-semibold">Court Filings</h3>
            <p className="text-sm text-gray-500 mt-1">89 files</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg cursor-pointer">
            <div className="text-5xl mb-3">📊</div>
            <h3 className="font-semibold">Evidence</h3>
            <p className="text-sm text-gray-500 mt-1">256 files</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg cursor-pointer">
            <div className="text-5xl mb-3">🔒</div>
            <h3 className="font-semibold">Confidential</h3>
            <p className="text-sm text-gray-500 mt-1">34 files</p>
          </div>
        </div>
      </div>
    </div>
  );
}
