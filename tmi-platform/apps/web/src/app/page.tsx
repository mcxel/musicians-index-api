import { Metadata } from 'next'
import HeroSection from '@/components/HeroSection'
import SpotlightRail from '@/components/SpotlightRail'
import FeaturedArticles from '@/components/FeaturedArticles'
import LiveRooms from '@/components/LiveRooms'
import AudioPlayer from '@/components/AudioPlayer'
import SearchBar from '@/components/SearchBar'

export const metadata: Metadata = {
  title: 'The Musicians Index - Where Music Meets Opportunity',
  description: 'The ultimate platform for musicians, producers, and music enthusiasts. Discover trending artists, read exclusive interviews, join live cypher sessions, and connect with the music community.',
  keywords: 'music, musicians, producers, artists, cypher, streaming, interviews, music production',
  openGraph: {
    title: 'The Musicians Index - Where Music Meets Opportunity',
    description: 'Discover trending artists, exclusive interviews, and live cypher sessions on the ultimate music platform.',
    type: 'website',
    url: 'https://themusiciansindex.com',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Musicians Index',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Musicians Index - Where Music Meets Opportunity',
    description: 'Discover trending artists, exclusive interviews, and live cypher sessions.',
    images: ['/og-image.jpg'],
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                The Musicians Index
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#artists" className="text-gray-300 hover:text-white transition-colors">Artists</a>
              <a href="#articles" className="text-gray-300 hover:text-white transition-colors">Articles</a>
              <a href="#live" className="text-gray-300 hover:text-white transition-colors">Live Rooms</a>
              <a href="#magazine" className="text-gray-300 hover:text-white transition-colors">Magazine</a>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                Join Community
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Search Bar */}
      <section className="py-8 bg-black/20">
        <div className="max-w-4xl mx-auto px-4">
          <SearchBar />
        </div>
      </section>

      {/* Spotlight Rail */}
      <section id="artists" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <SpotlightRail />
        </div>
      </section>

      {/* Featured Articles */}
      <section id="articles" className="py-16 bg-black/10">
        <div className="max-w-7xl mx-auto px-4">
          <FeaturedArticles />
        </div>
      </section>

      {/* Live Rooms */}
      <section id="live" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <LiveRooms />
        </div>
      </section>

      {/* Magazine Preview */}
      <section id="magazine" className="py-16 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Latest Magazine Issue</h2>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
            <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl p-6 mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Issue #47</h3>
              <p className="text-purple-100">The Future of Music Production</p>
            </div>
            <button className="w-full bg-white text-purple-900 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors">
              Read Now
            </button>
          </div>
        </div>
      </section>

      {/* Audio Player (Fixed at bottom) */}
      <AudioPlayer />

      {/* Footer */}
      <footer className="bg-black/80 backdrop-blur-md border-t border-purple-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 The Musicians Index. Powered by BerntoutGlobal XXL.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
