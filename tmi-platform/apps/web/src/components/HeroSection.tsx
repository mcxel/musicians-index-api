'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PlayIcon, MicrophoneIcon, MusicalNoteIcon } from '@heroicons/react/24/solid'

interface FloatingNote {
  id: number
  startX: number
  endX: number
  startY: number
  scale: number
  duration: number
  delay: number
}

export default function HeroSection() {
  const [notes, setNotes] = useState<FloatingNote[]>([])

  useEffect(() => {
    const width = window.innerWidth
    const height = window.innerHeight

    const generated = Array.from({ length: 8 }, (_, index) => ({
      id: index,
      startX: Math.random() * width,
      endX: Math.random() * width,
      startY: height + 100,
      scale: 0.5 + Math.random() * 0.5,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 5,
    }))

    setNotes(generated)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
        <div
          className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-20`}
        ></div>
      </div>

      {/* Floating Music Notes Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {notes.map(note => (
          <motion.div
            key={note.id}
            className="absolute text-purple-400/30"
            initial={{
              x: note.startX,
              y: note.startY,
              rotate: 0,
              scale: note.scale
            }}
            animate={{
              y: -100,
              rotate: 360,
              x: note.endX
            }}
            transition={{
              duration: note.duration,
              repeat: Infinity,
              delay: note.delay
            }}
          >
            <MusicalNoteIcon className="w-8 h-8" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
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
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/25">
            <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Start Exploring
          </button>
          <button className="group bg-white/10 backdrop-blur-md border border-purple-400/30 hover:border-purple-400/60 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2">
            <MicrophoneIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Join Live Session
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
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
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-purple-400 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
