'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  NewspaperIcon,
  MicrophoneIcon,
  Cog6ToothIcon,
  UserIcon,
  SparklesIcon,
  ChartBarIcon,
  PaperAirplaneIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

const navigationItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Stream & Win', href: '/streamwin', icon: SparklesIcon },
  { name: 'Submit', href: '/submit', icon: PaperAirplaneIcon },
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Artists', href: '/artists', icon: UserGroupIcon },
  { name: 'Live Rooms', href: '/live-rooms', icon: MicrophoneIcon },
  { name: 'Articles', href: '/articles', icon: NewspaperIcon },
  { name: 'Community', href: '/community', icon: ChatBubbleLeftIcon },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userMode, setUserMode] = useState<'artist' | 'fan'>('fan')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-400/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TMI</span>
            </div>
            <span className="text-white font-bold text-lg">The Musicians Index</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-purple-600/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search artists, tracks, articles..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-400/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* Mode Switcher */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMode(userMode === 'artist' ? 'fan' : 'artist')}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full border border-purple-400/30 transition-all"
                  title="Switch between Artist and Fan mode"
                >
                  <ArrowPathIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white capitalize">{userMode} Mode</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <Cog6ToothIcon className="w-6 h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-full text-white font-semibold transition-all duration-300"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-purple-600/20"
                  onClick={() => setIsLoggedIn(true)}
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-full text-white font-semibold transition-all duration-300"
                  onClick={() => setIsLoggedIn(true)}
                >
                  Get Started
                </motion.button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-300 hover:text-white transition-colors p-2"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-purple-400/20"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* Mobile Search */}
                <div className="px-3 py-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-400/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Mobile Navigation Items */}
                {navigationItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-purple-600/20 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </motion.a>
                ))}

                {/* Mobile User Actions */}
                {!isLoggedIn && (
                  <div className="px-3 py-2 space-y-2">
                    <button
                      className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-purple-600/20 rounded-lg transition-colors"
                      onClick={() => {
                        setIsLoggedIn(true)
                        setIsOpen(false)
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300"
                      onClick={() => {
                        setIsLoggedIn(true)
                        setIsOpen(false)
                      }}
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
