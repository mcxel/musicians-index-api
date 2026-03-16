'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

// Simple inline placeholder icon to replace heroicons in CI
function IconPlaceholder(props: Readonly<React.SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

const navigationItems = [
  { name: 'Home', href: '/', icon: IconPlaceholder },
  { name: 'Stream & Win', href: '/streamwin', icon: IconPlaceholder },
  { name: 'Submit', href: '/submit', icon: IconPlaceholder },
  { name: 'Dashboard', href: '/dashboard', icon: IconPlaceholder },
  { name: 'Artists', href: '/artists', icon: IconPlaceholder },
  { name: 'Live Rooms', href: '/live-rooms', icon: IconPlaceholder },
  { name: 'Articles', href: '/articles', icon: IconPlaceholder },
  { name: 'Community', href: '/community', icon: IconPlaceholder },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as {
          authenticated?: boolean
          csrfToken?: string
          user?: { email?: string; image?: string; name?: string }
        }
        setIsAuthenticated(Boolean(data.authenticated))
        setCsrfToken(data.csrfToken || null)
        setDisplayName(data.user?.name || data.user?.email || null)
        setAvatar(data.user?.image || null)
      } catch {
        setIsAuthenticated(false)
      }
    }

    void loadSession()
  }, [])

  const logout = async () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }

    await fetch('/api/auth/logout', {
      method: 'POST',
      headers,
      body: '{}',
    })

    setIsAuthenticated(false)
    setDisplayName(null)
    setAvatar(null)
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-400/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TMI</span>
            </div>
            <span className="text-white font-bold text-lg">The Musicians Index</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-purple-600/20"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </a>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <IconPlaceholder className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search artists, tracks, articles..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-400/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                  <span className="text-white text-sm hidden sm:block">{displayName ?? 'Member'}</span>
                  {avatar && (
                    <Image
                      src={avatar}
                      alt={displayName || 'User Avatar'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <button
                    onClick={() => {
                      void logout()
                    }}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full border border-purple-400/30 transition-all"
                    title="Sign Out"
                    type="button"
                  >
                    <IconPlaceholder className="w-5 h-5 text-purple-400" />
                  </button>
                </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-full text-white font-semibold transition-all duration-300"
                  onClick={() => {
                    window.location.href = '/auth'
                  }}
                  type="button"
                >
                  <IconPlaceholder className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-300 hover:text-white transition-colors p-2"
              type="button"
            >
              <IconPlaceholder className="w-6 h-6" />
            </button>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-purple-400/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <div className="relative">
                  <IconPlaceholder className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-purple-400/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Mobile Navigation Items */}
              {navigationItems.map((item, _index) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-purple-600/20 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              ))}

              {/* Mobile User Actions */}
              {!isAuthenticated && (
                <div className="px-3 py-2">
                  <button
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300"
                    onClick={() => {
                      window.location.href = '/auth';
                      setIsOpen(false);
                    }}
                    type="button"
                  >
                     <IconPlaceholder className="w-5 h-5" />
                     <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
