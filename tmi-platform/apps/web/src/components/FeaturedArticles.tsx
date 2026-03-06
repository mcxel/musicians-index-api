'use client'

import React from 'react'
import Image from 'next/image'
import { SponsorTile, SponsorStrip } from '@/components/sponsor/SponsorDashboard'

// Lightweight inline icons to avoid external heroicons dependency in CI
function UserIconSVG({ className }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" fill="currentColor" />
    </svg>
  )
}
function ClockIconSVG({ className }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 11h4v-2h-3V6h-2v7z" fill="currentColor" />
    </svg>
  )
}
function EyeIconSVG({ className }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 5c-7 0-11 6-11 7s4 7 11 7 11-6 11-7-4-7-11-7zm0 11a4 4 0 110-8 4 4 0 010 8z" fill="currentColor" />
    </svg>
  )
}

// Local placements used to avoid out-of-root imports in CI
const TMI_PLACEMENTS = {
  ARTICLES_GRID_TILE_SPONSOR_TOP: 'articles_grid_top',
  ARTICLES_GRID_TILE_SPONSOR_RIGHT: 'articles_grid_right',
  ARTICLES_GRID_TILE_SPONSOR_INLINE: 'articles_grid_inline',
  ARTICLES_FOOTER_ADVERTISE_STRIP: 'articles_footer_strip'
}

interface Article {
  id: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  readTime: string
  views: string
  image: string
  category: string
  featured?: boolean
}

const featuredArticles: Article[] = [
  {
    id: '1',
    title: 'The Future of Music Production: AI and Machine Learning',
    excerpt: 'Explore how artificial intelligence is revolutionizing the way we create, produce, and distribute music in the modern era.',
    author: 'Dr. Sarah Chen',
    publishedAt: '2024-01-15',
    readTime: '8 min read',
    views: '12.5K',
    image: '/articles/ai-music-production.jpg',
    category: 'Technology',
    featured: true
  },
  {
    id: '2',
    title: 'Building a Successful Career in the Music Industry',
    excerpt: 'Essential strategies and insights from top artists and industry professionals on navigating the competitive music landscape.',
    author: 'Marcus Johnson',
    publishedAt: '2024-01-12',
    readTime: '12 min read',
    views: '8.9K',
    image: '/articles/music-career.jpg',
    category: 'Career'
  },
  {
    id: '3',
    title: 'The Art of Sound Design: Creating Immersive Audio Experiences',
    excerpt: 'A deep dive into the techniques and tools used by professional sound designers to create captivating audio worlds.',
    author: 'Elena Rodriguez',
    publishedAt: '2024-01-10',
    readTime: '10 min read',
    views: '15.2K',
    image: '/articles/sound-design.jpg',
    category: 'Production'
  },
  {
    id: '4',
    title: 'NFTs and Music: The New Frontier of Artist Monetization',
    excerpt: 'Understanding blockchain technology and how NFTs are changing how musicians monetize their work and connect with fans.',
    author: 'Alex Thompson',
    publishedAt: '2024-01-08',
    readTime: '6 min read',
    views: '22.1K',
    image: '/articles/nft-music.jpg',
    category: 'Business'
  }
]

export default function FeaturedArticles() {
  return (
    <section className="py-16 bg-black/20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Featured <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Articles</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Exclusive interviews, industry insights, and expert advice from the world of music
          </p>
        </div>

        {/* Featured Article */}
        {featuredArticles.filter(article => article.featured).map((article) => (
          <div key={article.id} className="mb-12">
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-3xl overflow-hidden border border-purple-400/30">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-80 md:h-auto">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      FEATURED
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <UserIconSVG className="w-4 h-4" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIconSVG className="w-4 h-4" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    <div className="flex items-center gap-1">
                    <EyeIconSVG className="w-4 h-4" />
                    <span>{article.views}</span>
                  </div>
                  </div>

                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 self-start">
                    Read Full Article
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Article Grid with Sponsor Placements */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Sponsor Tile - Top Placement */}
          <div>
            <SponsorTile
              productId="tmi"
              placementId={TMI_PLACEMENTS.ARTICLES_GRID_TILE_SPONSOR_TOP}
              className="h-full"
              fallbackLabel="Sponsor"
            />
          </div>

          {featuredArticles.filter(article => !article.featured).map((article) => (
            <div key={article.id} className="group bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-purple-600/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-tight">
                  {article.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <div className="flex items-center gap-3">
                    <span>{article.author}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIconSVG className="w-3 h-3" />
                    <span>{article.views}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/40 hover:to-pink-600/40 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 border border-purple-400/30 hover:border-purple-400/60">
                  Read Article
                </button>
              </div>
            </div>
          ))}

          {/* Sponsor Tile - Right Placement */}
          <div>
            <SponsorTile
              productId="tmi"
              placementId={TMI_PLACEMENTS.ARTICLES_GRID_TILE_SPONSOR_RIGHT}
              className="h-full"
              fallbackLabel="Sponsor"
            />
          </div>

          {/* Sponsor Tile - Inline Placement */}
          <div>
            <SponsorTile
              productId="tmi"
              placementId={TMI_PLACEMENTS.ARTICLES_GRID_TILE_SPONSOR_INLINE}
              className="h-full"
              fallbackLabel="Sponsor"
            />
          </div>
        </div>

        {/* View All Articles Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
            View All Articles
          </button>
        </div>

        {/* Footer Sponsor Strip */}
        <div className="mt-12">
          <SponsorStrip
            productId="tmi"
            placementId={TMI_PLACEMENTS.ARTICLES_FOOTER_ADVERTISE_STRIP}
            fallbackLabel="Advertise with us"
          />
        </div>
      </div>
    </section>
  )
}
