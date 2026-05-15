 'use client'

// Inline fallback icons to avoid external dependencies in CI
function IconPlay(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 5v14l11-7-11-7z" />
    </svg>
  )
}

function IconMic(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" />
      <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 11z" />
    </svg>
  )
}

function IconMusic(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19 3v12.26A3 3 0 1 0 21 18V7h-6V3h4z" />
      <path d="M11 5v10.26A3 3 0 1 0 13 18V9h-6V5h4z" />
    </svg>
  )
}

import React from 'react'
import { ImageSlotWrapper } from '@/components/visual-enforcement'
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
        <ImageSlotWrapper
          imageId="hero-pattern-dots"
          roomId="hero-surface"
          priority="normal"
          fallbackUrl="data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"
          altText="Hero surface pattern"
          className="w-full h-full object-cover"
          containerStyle={{ position: 'absolute', inset: 0, opacity: 0.2 }}
        />
      </div>

      {/* Floating Music Notes (static placeholders for CI builds) */}
      <div className="absolute inset-0 pointer-events-none">
        {(() => {
          const STAR_IDS = Array.from({ length: 8 }, (_, i) => i + 1)
          return STAR_IDS.map((id) => (
            <div key={`star-${id}`} className="absolute text-purple-400/30" style={{ left: `${Math.floor(Math.random() * 90)}%`, top: `${60 + Math.floor(Math.random() * 30)}%` }}>
              <IconMusic className="w-8 h-8" />
            </div>
          ))
        })()}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        {/* Main Headline */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              The Musicians
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Index
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Where Music Meets Opportunity. Discover trending artists, join live cypher sessions,
            read exclusive interviews, and connect with the global music community.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/25" type="button">
            <IconPlay className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Start Exploring
          </button>
          <button className="group bg-white/10 backdrop-blur-md border border-purple-400/30 hover:border-purple-400/60 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2" type="button">
            <IconMic className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Join Live Session
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              50K+
            </div>
            <div className="text-gray-400 text-sm">Artists</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              1M+
            </div>
            <div className="text-gray-400 text-sm">Tracks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-gray-400 text-sm">Live Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              100+
            </div>
            <div className="text-gray-400 text-sm">Countries</div>
          </div>
        </div>

        {/* Scroll Indicator (static for CI) */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-purple-400 rounded-full mt-2" />
          </div>
        </div>
      </div>
    </section>
  )
}
