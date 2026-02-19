'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/solid'

interface SpotlightArtist {
  id: string
  name: string
  genre: string
  participationScore: number
  isMock: boolean
  initials: string
  gradientFrom: string
  gradientTo: string
}

// Generate mock artists with gradient placeholders
const generateMockArtists = (count: number): SpotlightArtist[] => {
  const gradients = [
    { from: 'from-purple-600', to: 'to-purple-800' },
    { from: 'from-pink-600', to: 'to-pink-800' },
    { from: 'from-blue-600', to: 'to-blue-800' },
    { from: 'from-green-600', to: 'to-green-800' },
    { from: 'from-yellow-600', to: 'to-orange-800' },
    { from: 'from-red-600', to: 'to-red-800' },
    { from: 'from-indigo-600', to: 'to-indigo-800' },
    { from: 'from-cyan-600', to: 'to-cyan-800' },
    { from: 'from-teal-600', to: 'to-teal-800' },
    { from: 'from-violet-600', to: 'to-violet-800' }
  ]

  return Array.from({ length: count }, (_, i) => {
    const gradient = gradients[i % gradients.length]
    return {
      id: `mock-${i + 1}`,
      name: `Featured Slot ${i + 1}`,
      genre: 'Coming Soon',
      participationScore: 0,
      isMock: true,
      initials: `S${i + 1}`,
      gradientFrom: gradient.from,
      gradientTo: gradient.to
    }
  })
}

export default function SpotlightRail() {
  const [spotlightArtists, setSpotlightArtists] = useState<SpotlightArtist[]>([])
  const [isShuffling, setIsShuffling] = useState(false)

  useEffect(() => {
    loadSpotlightArtists()
  }, [])

  const loadSpotlightArtists = async () => {
    // TODO: Replace with actual API call to get featured artists
    // const response = await fetch('/api/spotlight/current')
    // const realArtists = await response.json()

    // For now, use mock data
    const realArtists: SpotlightArtist[] = [
      {
        id: '1',
        name: 'DJ Thunder',
        genre: 'Electronic',
        participationScore: 950,
        isMock: false,
        initials: 'DT',
        gradientFrom: 'from-purple-600',
        gradientTo: 'to-purple-800'
      },
      {
        id: '2',
        name: 'Soul Sister',
        genre: 'R&B',
        participationScore: 920,
        isMock: false,
        initials: 'SS',
        gradientFrom: 'from-pink-600',
        gradientTo: 'to-pink-800'
      },
      {
        id: '3',
        name: 'Rock Legend',
        genre: 'Rock',
        participationScore: 880,
        isMock: false,
        initials: 'RL',
        gradientFrom: 'from-red-600',
        gradientTo: 'to-red-800'
      }
    ]

    // Bootstrap: Fill remaining slots with mocks if less than 10
    const SPOTLIGHT_SLOTS = 10
    const needMocks = SPOTLIGHT_SLOTS - realArtists.length
    const mocks = needMocks > 0 ? generateMockArtists(needMocks) : []

    setSpotlightArtists([...realArtists, ...mocks])
  }

  const triggerShuffle = () => {
    setIsShuffling(true)
    setTimeout(() => setIsShuffling(false), 2000)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-black/0 to-black/40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <SparklesIcon className="w-10 h-10 text-yellow-400" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Spotlight <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Rail</span>
            </h2>
            <SparklesIcon className="w-10 h-10 text-yellow-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
            Featured artists rotating monthly based on participation
          </p>
          <button
            onClick={triggerShuffle}
            className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-2 mx-auto"
          >
            <span>Preview Shuffle</span>
            <StarIcon className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Spotlight Grid - 10 Slots */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <AnimatePresence mode="wait">
            {spotlightArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: isShuffling ? [0, -40, 40, -20, 20, 0] : 0,
                  rotate: isShuffling ? [0, 5, -5, 3, -3, 0] : 0
                }}
                transition={{
                  opacity: { duration: 0.6, delay: index * 0.05 },
                  y: { duration: isShuffling ? 1.5 : 0.6, delay: isShuffling ? index * 0.08 : index * 0.05 },
                  rotate: { duration: isShuffling ? 1.5 : 0, delay: isShuffling ? index * 0.08 : 0 }
                }}
                viewport={{ once: true }}
                className="relative group cursor-pointer"
              >
                {/* Card */}
                <div className={`relative bg-gradient-to-br ${artist.gradientFrom} ${artist.gradientTo} rounded-2xl overflow-hidden border-2 ${
                  artist.isMock ? 'border-gray-600/30' : 'border-yellow-400/50'
                } hover:border-yellow-400 transition-all duration-300 aspect-square`}>
                  
                  {/* Featured Badge */}
                  {!artist.isMock && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 z-10">
                      <StarIcon className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  )}

                  {/* Mock Placeholder */}
                  {artist.isMock && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl font-bold text-white">{artist.initials}</span>
                        </div>
                        <p className="text-white/60 text-sm">Available Slot</p>
                      </div>
                    </div>
                  )}

                  {/* Real Artist Content */}
                  {!artist.isMock && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                      {/* Large initials as placeholder for image */}
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <span className="text-3xl font-bold text-white">{artist.initials}</span>
                      </div>
                      
                      {/* Artist Info */}
                      <h3 className="text-white font-bold text-center text-sm mb-1 line-clamp-1">{artist.name}</h3>
                      <p className="text-white/80 text-xs mb-2">{artist.genre}</p>
                      
                      {/* Participation Score */}
                      <div className="bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                        <p className="text-yellow-300 text-xs font-semibold">{artist.participationScore} pts</p>
                      </div>
                    </div>
                  )}

                  {/* Hover Play Button */}
                  {!artist.isMock && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="bg-yellow-400 hover:bg-yellow-500 text-black p-3 rounded-full transform scale-75 group-hover:scale-100 transition-all duration-300">
                        <PlayIcon className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Slot Number */}
                <div className="text-center mt-2">
                  <span className="text-gray-500 text-xs font-semibold">Slot {index + 1}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-6 text-center"
        >
          <p className="text-yellow-200 text-sm">
            <strong>Monthly Rotation:</strong> Spotlight slots are awarded based on participation score. 
            Stay active to maintain your featured position!
          </p>
        </motion.div>
      </div>
    </section>
  )
}
