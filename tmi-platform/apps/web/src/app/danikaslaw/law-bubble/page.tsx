/**
 * ==================================================================================
 * LAW BUBBLE - FULL PAGE VERSION
 * ==================================================================================
 * 
 * Full-page interface for Law Bubble Q&A platform
 * Widget version available via <LawBubbleWidget /> component
 * 
 * ==================================================================================
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LawBubblePage() {
  const [question, setQuestion] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/danikaslaw" className="text-2xl">⚖️</Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Law Bubble</h1>
              <p className="text-sm text-gray-500">Quick legal Q&A - $1 per question</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">⚖️💬</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Get Legal Answers in Minutes
          </h2>
          <p className="text-xl text-gray-600">
            Ask any legal question for just $1. AI-powered responses with attorney review.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-orange-300">
          <h3 className="text-2xl font-bold mb-4">Ask Your Question</h3>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Example: What are my rights if I'm pulled over for a traffic stop?"
            className="w-full border-2 border-gray-300 rounded-lg p-4 text-lg resize-none focus:outline-none focus:ring-4 focus:ring-orange-500"
            rows={6}
          />
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              💳 $1.00 per question • Instant AI response • Optional attorney review
            </p>
            <button className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-orange-700 transition">
              Submit Question
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-bold mb-2">Instant Answers</h4>
            <p className="text-sm text-gray-600">AI-powered responses in under 60 seconds</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-3">👨‍⚖️</div>
            <h4 className="font-bold mb-2">Attorney Verified</h4>
            <p className="text-sm text-gray-600">Optional human review for complex questions</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-3">🔒</div>
            <h4 className="font-bold mb-2">100% Confidential</h4>
            <p className="text-sm text-gray-600">All questions encrypted and private</p>
          </div>
        </div>
      </div>
    </div>
  );
}
