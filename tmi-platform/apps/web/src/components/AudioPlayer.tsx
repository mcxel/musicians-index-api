'use client'

import React from 'react'
import { SponsorTile, SponsorBadge, SponsorStrip } from '@/components/sponsor/SponsorDashboard'

// Inline icons to avoid external heroicons dependency during CI builds
function PlayIconSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
    </svg>
  )
}
function HeartIconSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 21s-7-4.35-9-7.03C1.9 11.9 3.6 6 8.5 6 10.2 6 12 7.2 12 7.2s1.8-1.2 3.5-1.2c4.9 0 6.6 5.9 5.5 7.97-2 2.68-9 7.03-9 7.03z" fill="currentColor" />
    </svg>
  )
}
function ShareIconSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 6l-4-4-4 4" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2v13" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Minimal placements mapping used during CI to avoid out-of-root imports
const TMI_PLACEMENTS = {
  ARTIST_PROFILE_PLAYER_SPONSOR_BADGE: 'artist_player_badge',
  ARTIST_PROFILE_MERCH_SPONSOR_TILE: 'artist_merch_tile',
  ARTIST_PROFILE_FOOTER_SPONSOR_ROW: 'artist_footer_row'
}

export default function AudioPlayer() {
  return (
    <section className="py-16 bg-black/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Audio Player Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-3xl overflow-hidden border border-purple-400/30 p-8">
              {/* Artist Info */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">JD</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white mb-2">Featured Artist</h3>
                  <p className="text-gray-300">Latest Release</p>

                  {/* Sponsor Badge on Player */}
                  <div className="mt-4">
                    <SponsorBadge
                      productId="tmi"
                      placementId={TMI_PLACEMENTS.ARTIST_PROFILE_PLAYER_SPONSOR_BADGE}
                      presentedByText="Presented by"
                    />
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className="bg-black/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <button className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center transition-all duration-300">
                    <PlayIconSVG className="w-8 h-8 text-white" />
                  </button>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-1">Track Title</h4>
                    <p className="text-gray-400 text-sm">Artist Name</p>
                  </div>
                  <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300">
                    <HeartIconSVG className="w-6 h-6 text-white" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300">
                    <ShareIconSVG className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>1:23</span>
                  <span>3:45</span>
                </div>
              </div>
            </div>
          </div>

          {/* Merch Section with Sponsor */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-purple-400/20 p-6">
              <h4 className="text-xl font-bold text-white mb-4">Merch & More</h4>
              <p className="text-gray-300 text-sm mb-4">
                Exclusive merchandise and content from your favorite artists
              </p>
            </div>

            {/* Sponsor Tile - Merch */}
            <SponsorTile
              productId="tmi"
              placementId={TMI_PLACEMENTS.ARTIST_PROFILE_MERCH_SPONSOR_TILE}
              fallbackLabel="Sponsor"
            />
          </div>
        </div>

        {/* Footer Sponsor Row */}
        <div className="mt-12">
          <SponsorStrip
            productId="tmi"
            placementId={TMI_PLACEMENTS.ARTIST_PROFILE_FOOTER_SPONSOR_ROW}
            fallbackLabel="Advertise with us"
          />
        </div>
      </div>
    </section>
  )
}
