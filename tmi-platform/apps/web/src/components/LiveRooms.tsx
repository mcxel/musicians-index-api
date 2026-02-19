'use client'

import { motion } from 'framer-motion'
import { UsersIcon, MicrophoneIcon, PlayIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

interface LiveRoom {
  id: string
  title: string
  host: string
  genre: string
  participants: number
  isLive: boolean
  thumbnail: string
  tags: string[]
  description: string
}

const liveRooms: LiveRoom[] = [
  {
    id: '1',
    title: 'Hip Hop Cypher Session',
    host: 'DJ Thunder',
    genre: 'Hip Hop',
    participants: 1247,
    isLive: true,
    thumbnail: '/rooms/hip-hop-cypher.jpg',
    tags: ['Freestyle', 'Rap', 'Cypher'],
    description: 'Weekly freestyle cypher with top MCs from around the world'
  },
  {
    id: '2',
    title: 'Electronic Production Live',
    host: 'Synth Master',
    genre: 'Electronic',
    participants: 892,
    isLive: true,
    thumbnail: '/rooms/electronic-production.jpg',
    tags: ['EDM', 'Production', 'Live'],
    description: 'Watch electronic music production in real-time'
  },
  {
    id: '3',
    title: 'Jazz Improv Night',
    host: 'Jazz Legend',
    genre: 'Jazz',
    participants: 567,
    isLive: true,
    thumbnail: '/rooms/jazz-improv.jpg',
    tags: ['Jazz', 'Improv', 'Live'],
    description: 'Spontaneous jazz improvisation with master musicians'
  },
  {
    id: '4',
    title: 'Songwriter Showcase',
    host: 'Melody Queen',
    genre: 'Pop',
    participants: 934,
    isLive: true,
    thumbnail: '/rooms/songwriter-showcase.jpg',
    tags: ['Songwriting', 'Pop', 'Original'],
    description: 'Original songs performed live by emerging songwriters'
  },
  {
    id: '5',
    title: 'Rock Band Jam',
    host: 'Guitar Hero',
    genre: 'Rock',
    participants: 756,
    isLive: true,
    thumbnail: '/rooms/rock-band-jam.jpg',
    tags: ['Rock', 'Band', 'Jam'],
    description: 'Full band performances and collaborations'
  },
  {
    id: '6',
    title: 'Classical Masterclass',
    host: 'Concerto Maestro',
    genre: 'Classical',
    participants: 445,
    isLive: true,
    thumbnail: '/rooms/classical-masterclass.jpg',
    tags: ['Classical', 'Education', 'Masterclass'],
    description: 'Learn classical techniques from world-renowned musicians'
  }
]

export default function LiveRooms() {
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
            Live <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Rooms</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join live music sessions, cyphers, and interactive performances happening right now
          </p>
        </motion.div>

        {/* Live Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {liveRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={room.thumbnail}
                  alt={room.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Live Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                  <span className="bg-purple-600/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {room.genre}
                  </span>
                </div>

                {/* Participants Count */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  <span>{room.participants.toLocaleString()}</span>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <PlayIcon className="w-8 h-8" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">
                  {room.title}
                </h3>
                <p className="text-purple-400 font-medium text-sm mb-3">
                  Hosted by {room.host}
                </p>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {room.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <MicrophoneIcon className="w-4 h-4" />
                    Join Room
                  </button>
                  <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <ChatBubbleLeftIcon className="w-4 h-4" />
                    Chat
                  </button>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            </motion.div>
          ))}
        </div>

        {/* Create Room CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-3xl p-8 max-w-2xl mx-auto border border-purple-400/30">
            <h3 className="text-2xl font-bold text-white mb-4">Start Your Own Live Room</h3>
            <p className="text-gray-300 mb-6">
              Share your music, host cyphers, or teach workshops. Connect with the global music community in real-time.
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
              Create Live Room
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
