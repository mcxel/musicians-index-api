'use client'

import { useState } from 'react'

// Simple inline SVG icons (no external deps)
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      // Handle search logic here
      console.log('Searching for:', query)
    }
  }

  const handleVoiceSearch = () => {
    setIsListening(true)
    // Voice search implementation would go here
    setTimeout(() => setIsListening(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artists, tracks, cyphers, articles..."
            className="w-full pl-12 pr-16 py-4 text-lg bg-white/10 backdrop-blur-md border border-purple-400/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`absolute right-4 p-2 rounded-full transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-gray-400 hover:text-white hover:bg-purple-600/20'
            }`}
          >
            <MicIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search Suggestions */}
        {query && (
          <div className="absolute top-full mt-2 w-full bg-black/80 backdrop-blur-md rounded-2xl border border-purple-400/30 overflow-hidden z-50">
            <div className="p-4">
              <div className="text-sm text-gray-400 mb-2">Quick Suggestions</div>
              <div className="space-y-2">
                {[
                  'Trending Artists',
                  'Live Cyphers',
                  'Featured Articles',
                  'New Releases',
                  'Producer Tools'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-600/20 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Popular Searches */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {['Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Rock', 'Pop'].map((genre) => (
          <button
            key={genre}
            onClick={() => setQuery(genre)}
            className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-400/30 rounded-full text-sm text-gray-300 hover:text-white transition-colors"
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  )
}
