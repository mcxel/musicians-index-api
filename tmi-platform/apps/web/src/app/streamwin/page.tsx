'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  SparklesIcon,
  UserGroupIcon,
  PuzzlePieceIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { SponsorTile, SponsorBadge, SponsorStrip } from '@/../../program/modules/sponsors/components'
import { STREAMWIN_PLACEMENTS } from '@/../../program/modules/sponsors/placements/streamwin'
import { VideoFrameFX, NeonPulse } from '@/../../program/modules/animations'
import { LawBubbleWidget } from '@/components/law-bubble/LawBubbleWidget'

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
  const [isShuffling, setIsShuffling] = useState(false)

  const generatePlaylist = async () => {
    setIsGenerating(true)
    try {
      // TODO: Replace with actual API call
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
      setIsShuffling(true)
      setTimeout(() => setIsShuffling(false), 1500)
    } catch (error) {
      console.error('Failed to generate playlist:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const recordPlayback = async (eventType: 'STARTED' | 'COMPLETED' | 'SKIPPED') => {
    if (!playlist) return
    const currentItem = playlist.items[currentIndex]
    
    // TODO: Wire to API
    // await fetch('/api/streamwin/playback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     playlistId: playlist.id,
    //     playlistItemId: currentItem.id,
    //     eventType
    //   })
    // })
    
    // eslint-disable-next-line no-console
    console.log('Playback event:', eventType, currentItem)
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
    
    if (!isPlaying) {
      // Skipping without playing
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
      recordPlayback('SKIPPED')
    } else {
      recordPlayback('COMPLETED')
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <SparklesIcon className="w-12 h-12 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Stream & Win
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Generate your personalized radio playlist. Complete plays earn points!
            </p>
          </motion.div>

          {/* Warning Banner */}
          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6 flex items-center space-x-3"
              >
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <p className="text-yellow-200">
                  <strong>Warning:</strong> Skipping tracks loses points! Complete plays earn +10 points, skips lose -2 points.
                </p>
                <button
                  onClick={() => setShowWarning(false)}
                  className="ml-auto text-yellow-400 hover:text-yellow-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Button */}
          {!playlist && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <button
                onClick={generatePlaylist}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 px-12 py-4 rounded-full text-white font-bold text-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
              >
                {isGenerating ? 'Generating Playlist...' : 'Generate Playlist'}
              </button>
            </motion.div>
          )}

          {/* Playlist Cards */}
          {playlist && (
            <div className="space-y-6">
              {/* Current Playing Card with Video Frame FX */}
              <motion.div
                key={`current-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-md border border-purple-400/30 rounded-2xl p-8"
              >
                <VideoFrameFX enableScanline enableVignette enableGlow>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      {currentItem?.mediaType === 'SONG' ? (
                        <MusicalNoteIcon className="w-8 h-8 text-purple-400" />
                      ) : (
                        <VideoCameraIcon className="w-8 h-8 text-pink-400" />
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
                        placementId={STREAMWIN_PLACEMENTS.HOME_VIDEO_SPONSOR_BADGE}
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
                        <PauseIcon className="w-8 h-8 text-white" />
                      ) : (
                        <PlayIcon className="w-8 h-8 text-white" />
                      )}
                    </button>
                  </NeonPulse>
                  <NeonPulse color="#ec4899" intensity="medium">
                    <button
                      onClick={handleNext}
                      disabled={currentIndex >= playlist.items.length - 1}
                      className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-700 p-4 rounded-full transition-colors"
                    >
                      <ForwardIcon className="w-8 h-8 text-white" />
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
              </motion.div>

              {/* Dashboard Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Watching Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 backdrop-blur-md border border-purple-400/20 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <UserGroupIcon className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Now Watching</h3>
                  </div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">1,247</div>
                  <p className="text-gray-400 text-sm">Active listeners</p>
                  <div className="mt-4">
                    <SponsorTile
                      productId="streamwin"
                      placementId={STREAMWIN_PLACEMENTS.HOME_WATCHING_SPONSOR_OVERLAY}
                      className="h-24"
                      fallbackLabel="Sponsor"
                    />
                  </div>
                </motion.div>

                {/* Trivia Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-md border border-purple-400/20 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <PuzzlePieceIcon className="w-6 h-6 text-pink-400" />
                    <h3 className="text-lg font-bold text-white">Trivia Challenge</h3>
                  </div>
                  <SponsorTile
                    productId="streamwin"
                    placementId={STREAMWIN_PLACEMENTS.HOME_TRIVIA_SPONSOR_TILE}
                    fallbackLabel="Sponsor"
                  />
                  <NeonPulse color="#ec4899" intensity="low">
                    <button className="w-full mt-4 bg-pink-600 hover:bg-pink-700 py-2 px-4 rounded-lg text-white font-semibold transition-colors">
                      Answer & Win +5 Points
                    </button>
                  </NeonPulse>
                </motion.div>

                {/* Analytics Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 backdrop-blur-md border border-purple-400/20 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <ChartBarIcon className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Your Stats</h3>
                  </div>
                  <SponsorTile
                    productId="streamwin"
                    placementId={STREAMWIN_PLACEMENTS.HOME_ANALYTICS_SPONSOR_TILE}
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
                </motion.div>
              </div>

              {/* Playlist Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sponsor Tile in Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-sm border border-purple-400/20 rounded-xl overflow-hidden"
                >
                  <SponsorTile
                    productId="streamwin"
                    placementId={STREAMWIN_PLACEMENTS.PLAYLISTS_GENRE_TILE_SPONSOR}
                    fallbackLabel="Sponsor"
                  />
                </motion.div>
                {playlist.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: index === currentIndex ? 0.5 : 1,
                      y: isShuffling ? [0, -20, 20, 0] : 0,
                      scale: index === currentIndex ? 0.95 : 1
                    }}
                    transition={{
                      duration: isShuffling ? 1.5 : 0.3,
                      delay: isShuffling ? index * 0.1 : 0
                    }}
                    className={`bg-white/5 backdrop-blur-sm border rounded-xl p-4 transition-all ${
                      index === currentIndex
                        ? 'border-purple-400/50 bg-purple-900/20'
                        : 'border-white/10 hover:border-purple-400/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.mediaType === 'SONG' ? (
                        <MusicalNoteIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                      ) : (
                        <VideoCameraIcon className="w-6 h-6 text-pink-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{item.title}</p>
                        <p className="text-gray-400 text-sm truncate">{item.artistKey}</p>
                      </div>
                      <div className="text-xs text-gray-500">#{index + 1}</div>
                    </div>
                  </motion.div>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12"
              >
                <SponsorStrip
                  productId="streamwin"
                  placementId={STREAMWIN_PLACEMENTS.PLAYLISTS_FOOTER_SPONSOR_BUTTONS}
                  fallbackLabel="Advertise with us"
                />
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Law Bubble Widget - Embeddable anywhere (proof of portability) */}
      <LawBubbleWidget userId="demo-user-streamwin" position="bottom-left" />

      {/* Starfield CSS */}
      <style jsx>{`
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
