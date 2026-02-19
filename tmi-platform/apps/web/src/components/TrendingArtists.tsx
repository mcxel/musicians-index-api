'use client'

import { motion } from 'framer-motion'
import { PlayIcon, HeartIcon, UserGroupIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

interface Artist {
  id: string
  name: string
  genre: string
  followers: string
  image: string
  isLive?: boolean
  monthlyListeners: string
}

const trendingArtists: Artist[] = [
  {
    id: '1',
    name: 'DJ Thunder',
    genre: 'Electronic',
    followers: '2.1M',
    monthlyListeners: '45.2M',
    image: '/artists/dj-thunder.jpg',
    isLive: true
  },
  {
    id: '2',
    name: 'Soul Sister',
    genre: 'R&B',
    followers: '1.8M',
    monthlyListeners: '38.9M',
    image: '/artists/soul-sister.jpg'
  },
  {
    id: '3',
    name: 'Rock Legend',
    genre: 'Rock',
    followers: '3.2M',
    monthlyListeners: '67.1M',
    image: '/artists/rock-legend.jpg'
  },
  {
    id: '4',
    name: 'Jazz Master',
    genre: 'Jazz',
    followers: '890K',
    monthlyListeners: '23.4M',
    image: '/artists/jazz-master.jpg',
    isLive: true
  },
  {
    id: '5',
    name: 'Hip Hop King',
    genre: 'Hip Hop',
    followers: '4.1M',
    monthlyListeners: '89.3M',
    image: '/artists/hip-hop-king.jpg'
  },
  {
    id: '6',
    name: 'Pop Star',
    genre: 'Pop',
    followers: '5.2M',
    monthlyListeners: '112.8M',
    image: '/artists/pop-star.jpg'
  }
]

export default function TrendingArtists() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Trending <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Artists</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the hottest artists making waves in the music industry right now
          </p>
        </motion.div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingArtists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300"
            >
              {/* Artist Image */}
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Live Badge */}
                {artist.isLive && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 z-20">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <PlayIcon className="w-8 h-8" />
                  </button>
                </div>
              </div>

              {/* Artist Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{artist.name}</h3>
                    <p className="text-purple-400 font-medium">{artist.genre}</p>
                  </div>
                  <button className="text-gray-400 hover:text-red-400 transition-colors">
                    <HeartIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{artist.followers} followers</span>
                  </div>
                  <span>{artist.monthlyListeners} monthly listeners</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <PlayIcon className="w-4 h-4" />
                    Play
                  </button>
                  <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
                    Follow
                  </button>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
            View All Artists
          </button>
        </motion.div>
      </div>
    </section>
  )
}
