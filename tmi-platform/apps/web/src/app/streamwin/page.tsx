'use client'

import React, { useState } from 'react'
import { logger } from '@/lib/logger'

// Use local icons and plain elements for CI builds
function Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="8" strokeWidth={1} />
    </svg>
  )
}

import { SponsorTile, SponsorBadge, SponsorStrip } from '@/components/sponsor/SponsorDashboard'
// Inline streamwin placements to avoid path-alias resolution during CI
const streamwinPlacements = {
  HOME_VIDEO_SPONSOR_BADGE: 'home-video-sponsor-badge',
  HOME_WATCHING_SPONSOR_OVERLAY: 'home-watching-sponsor-overlay',
  HOME_TRIVIA_SPONSOR_TILE: 'home-trivia-sponsor-tile',
  HOME_ANALYTICS_SPONSOR_TILE: 'home-analytics-sponsor-tile',
  PLAYLISTS_GENRE_TILE_SPONSOR: 'playlists-genre-tile-sponsor',
  PLAYLISTS_FOOTER_SPONSOR_BUTTONS: 'playlists-footer-sponsor-buttons',
}

// Local no-deps fallbacks for Cloudflare builds
function VideoFrameFX(props: React.PropsWithChildren<Record<string, unknown> & { className?: string }>) {
  const { className, children } = props
  return <div className={className}>{children}</div>
}

function NeonPulse(props: React.PropsWithChildren<Record<string, unknown> & { className?: string }>) {
  const { className, children } = props
  return <div className={className}>{children}</div>
}
import { LawBubbleWidget } from '@/components/law-bubble/LawBubbleWidget'

function PlaySVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  )
}

function ForwardSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 6v12l8-6-8-6zm9 0v12l8-6-8-6z" />
    </svg>
  )
}

interface PlaylistItem {
  id: string
  position: number
  title: string
  artistKey: string
  mediaType: 'SONG' | 'VIDEO'
  externalUrl?: string
  playedAt?: string
}

interface Playlist {
  id: string
  userId: string
  generatedAt: string
  items: PlaylistItem[]
}

export default function StreamWinPage() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  // shuffle visual state not yet required for CI build

  const generatePlaylist = async () => {
    setIsGenerating(true)
    try {
      // placeholder: replace with actual API call
      // const response = await fetch('/api/streamwin/playlists/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ seedValue: Math.random() * 1000000 })
      // })
      // const data = await response.json()
      
      // Mock response for now
      const mockPlaylist: Playlist = {
        id: `playlist-${Date.now()}`,
        userId: 'user-1',
        generatedAt: new Date().toISOString(),
        items: [
          { id: '1', position: 0, title: 'Thunder Beats', artistKey: 'dj-thunder', mediaType: 'SONG', externalUrl: 'https://example.com/song1' },
          { id: '2', position: 1, title: 'Soul Dance', artistKey: 'soul-sister', mediaType: 'VIDEO', externalUrl: 'https://example.com/video1' },
          { id: '3', position: 2, title: 'Rock Anthem', artistKey: 'rock-legend', mediaType: 'SONG', externalUrl: 'https://example.com/song2' },
          { id: '4', position: 3, title: 'Jazz Flow', artistKey: 'jazz-master', mediaType: 'SONG', externalUrl: 'https://example.com/song3' },
          { id: '5', position: 4, title: 'Hip Hop Story', artistKey: 'hip-hop-king', mediaType: 'VIDEO', externalUrl: 'https://example.com/video2' },
        ]
      }
      
      setPlaylist(mockPlaylist)
      setCurrentIndex(0)
    } catch (error) {
      logger.error('Failed to generate playlist:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const recordPlayback = async (eventType: 'STARTED' | 'COMPLETED' | 'SKIPPED') => {
    if (!playlist) return
    const currentItem = playlist.items[currentIndex]
    
    // placeholder: wire to real API when available
    // await fetch('/api/streamwin/playback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     playlistId: playlist.id,
    //     playlistItemId: currentItem.id,
    //     eventType
    //   })
    // })
    
    logger.log('Playback event:', eventType, currentItem)
  }

  const handlePlay = () => {
    setIsPlaying(true)
    recordPlayback('STARTED')
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleNext = () => {
    if (!playlist) return
    
    if (isPlaying) {
      recordPlayback('COMPLETED')
    } else {
      // Skipping without playing
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
      recordPlayback('SKIPPED')
    }
    
    if (currentIndex < playlist.items.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsPlaying(false)
    }
  }

  const currentItem = playlist?.items[currentIndex]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 z-0">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Icon className="w-12 h-12 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Stream & Win
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Generate your personalized radio playlist. Complete plays earn points!
            </p>
          </div>

          {/* Warning Banner */}
          {showWarning && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <Icon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <p className="text-yellow-200">
                <strong>Warning:</strong> Skipping tracks loses points! Complete plays earn +10 points, skips lose -2 points.
              </p>
              <button onClick={() => setShowWarning(false)} className="ml-auto text-yellow-400 hover:text-yellow-300">
                <Icon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={generatePlaylist}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 px-12 py-4 rounded-full text-white font-bold text-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isGenerating ? 'Generating Playlist...' : 'Generate Playlist'}
            </button>
          </div>

          {/* Playlist Cards */}
          {playlist && (
            <div className="space-y-6">
              {/* Current Playing Card with Video Frame FX */}
              <div key={`current-${currentIndex}`} className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-md border border-purple-400/30 rounded-2xl p-8">
                <VideoFrameFX enableScanline enableVignette enableGlow>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {currentItem?.mediaType === 'SONG' ? (
                        <Icon className="w-8 h-8 text-purple-400" />
                      ) : (
                        <Icon className="w-8 h-8 text-pink-400" />
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-white">{currentItem?.title}</h3>
                        <p className="text-gray-400">by {currentItem?.artistKey}</p>
                      </div>
                    </div>
                      <div className="flex items-center gap-4">
                      <div className="text-gray-400 text-sm">
                        {currentIndex + 1} / {playlist.items.length}
                      </div>
                      <SponsorBadge
                        productId="streamwin"
                        placementId={streamwinPlacements.HOME_VIDEO_SPONSOR_BADGE}
                        presentedByText="Presented by"
                      />
                    </div>
                  </div>
                </VideoFrameFX>

                {/* Playback Controls */}
                <div className="flex items-center justify-center space-x-6">
                  <NeonPulse color="#a78bfa" intensity="medium">
                    <button
                      onClick={isPlaying ? handlePause : handlePlay}
                      className="bg-purple-600 hover:bg-purple-700 p-4 rounded-full transition-colors"
                    >
                      {isPlaying ? (
                        <PauseSVG className="w-8 h-8 text-white" />
                      ) : (
                        <PlaySVG className="w-8 h-8 text-white" />
                      )}
                    </button>
                  </NeonPulse>
                  <NeonPulse color="#ec4899" intensity="medium">
                    <button
                      onClick={handleNext}
                      disabled={currentIndex >= playlist.items.length - 1}
                      className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 p-4 rounded-full transition-colors"
                    >
                      <ForwardSVG className="w-8 h-8 text-white" />
                    </button>
                  </NeonPulse>
                </div>

                {/* External Link */}
                {currentItem?.externalUrl && (
                  <div className="mt-6 text-center">
                    <a
                      href={currentItem.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Open in External Platform
                    </a>
                  </div>
                )}
              </div>

              {/* Dashboard Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Watching Panel */}
                <div className="bg-white/5 backdrop-blur-md border border-purple-400/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Now Watching</h3>
                  </div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">1,247</div>
                  <p className="text-gray-400 text-sm">Active listeners</p>
                  <div className="mt-4">
                    <SponsorTile
                      productId="streamwin"
                      placementId={streamwinPlacements.HOME_WATCHING_SPONSOR_OVERLAY}
                      className="h-24"
                      fallbackLabel="Sponsor"
                    />
                  </div>
                </div>

                {/* Trivia Card */}
                <div className="bg-white/5 backdrop-blur-md border border-purple-400/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6 text-pink-400" />
                    <h3 className="text-lg font-bold text-white">Trivia Challenge</h3>
                  </div>
                  <SponsorTile
                    productId="streamwin"
                    placementId={streamwinPlacements.HOME_TRIVIA_SPONSOR_TILE}
                    fallbackLabel="Sponsor"
                  />
                  <NeonPulse color="#ec4899" intensity="low">
                    <button className="w-full mt-4 bg-pink-600 hover:bg-pink-700 py-2 px-4 rounded-lg text-white font-semibold transition-colors">
                      Answer & Win +5 Points
                    </button>
                  </NeonPulse>
                </div>

                {/* Analytics Card */}
                <div className="bg-white/5 backdrop-blur-md border border-purple-400/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Your Stats</h3>
                  </div>
                  <SponsorTile
                    productId="streamwin"
                    placementId={streamwinPlacements.HOME_ANALYTICS_SPONSOR_TILE}
                    fallbackLabel="Sponsor"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Points Earned</span>
                      <span className="text-green-400 font-bold">+120</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tracks Completed</span>
                      <span className="text-purple-400 font-bold">12</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Playlist Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sponsor Tile in Grid */}
                <div className="bg-white/5 backdrop-blur-sm border border-purple-400/20 rounded-xl overflow-hidden">
                  <SponsorTile
                    productId="streamwin"
                    placementId={streamwinPlacements.PLAYLISTS_GENRE_TILE_SPONSOR}
                    fallbackLabel="Sponsor"
                  />
                </div>
                {playlist.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`bg-white/5 backdrop-blur-sm border rounded-xl p-4 transition-all ${
                      index === currentIndex
                        ? 'border-purple-400/50 bg-purple-900/20'
                        : 'border-white/10 hover:border-purple-400/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.mediaType === 'SONG' ? (
                        <Icon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                      ) : (
                        <Icon className="w-6 h-6 text-pink-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{item.title}</p>
                        <p className="text-gray-400 text-sm truncate">{item.artistKey}</p>
                      </div>
                      <div className="text-xs text-gray-500">#{index + 1}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Playlist Button */}
              <div className="text-center pt-6">
                <button
                  onClick={generatePlaylist}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 hover:from-purple-600 hover:to-pink-600 border border-purple-400/30 px-8 py-3 rounded-full text-white font-semibold transition-all duration-300"
                >
                  Generate New Playlist
                </button>
              </div>

              {/* Footer Sponsor Strip */}
              <div className="mt-12">
                <SponsorStrip
                  productId="streamwin"
                  placementId={streamwinPlacements.PLAYLISTS_FOOTER_SPONSOR_BUTTONS}
                  fallbackLabel="Advertise with us"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Law Bubble Widget - Embeddable anywhere (proof of portability) */}
      <LawBubbleWidget userId="demo-user-streamwin" position="bottom-left" />

      {/* Starfield CSS */}
      <style>{`
        @keyframes stars-float {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }

        .stars-small, .stars-medium, .stars-large {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 200%;
          background: transparent;
        }

        .stars-small {
          background-image: 
            radial-gradient(1px 1px at 20px 30px, white, transparent),
            radial-gradient(1px 1px at 60px 70px, white, transparent),
            radial-gradient(1px 1px at 50px 120px, white, transparent),
            radial-gradient(1px 1px at 80px 160px, white, transparent),
            radial-gradient(1px 1px at 110px 200px, white, transparent);
          background-size: 200px 200px;
          animation: stars-float 120s linear infinite;
          opacity: 0.4;
        }

        .stars-medium {
          background-image: 
            radial-gradient(2px 2px at 40px 60px, #a78bfa, transparent),
            radial-gradient(2px 2px at 120px 140px, #ec4899, transparent);
          background-size: 300px 300px;
          animation: stars-float 180s linear infinite;
          opacity: 0.3;
        }

        .stars-large {
          background-image: 
            radial-gradient(3px 3px at 90px 120px, #c084fc, transparent);
          background-size: 400px 400px;
          animation: stars-float 240s linear infinite;
          opacity: 0.2;
        }
      `}</style>
    </div>
  )
}
