'use client'

import { motion } from 'framer-motion'
import { ClockIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { SponsorTile, SponsorStrip } from '@/../../program/modules/sponsors/components'
import { TMI_PLACEMENTS } from '@/../../program/modules/sponsors/placements/tmi'

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Featured <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Articles</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Exclusive interviews, industry insights, and expert advice from the world of music
          </p>
        </motion.div>

        {/* Featured Article */}
        {featuredArticles.filter(article => article.featured).map((article) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
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
                        <UserIcon className="w-4 h-4" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{article.views}</span>
                    </div>
                  </div>

                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 self-start">
                    Read Full Article
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Article Grid with Sponsor Placements */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Sponsor Tile - Top Placement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <SponsorTile
              productId="tmi"
              placementId={TMI_PLACEMENTS.ARTICLES_GRID_TILE_SPONSOR_TOP}
              className="h-full"
              fallbackLabel="Sponsor"
            />
          </motion.div>

          {featuredArticles.filter(article => !article.featured).map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300"
            >
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
                    <EyeIcon className="w-3 h-3" />
                    <span>{article.views}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/40 hover:to-pink-600/40 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 border border-purple-400/30 hover:border-purple-400/60">
                  Read Article
                </button>
              </div>
            </motion.div>
          ))}

          {/* Sponsor Tile - Right Placement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <SponsorTile
              productId="tmi"
              placementId={TMI_PLACEMENTS.ARTICLES_GRID_TILE_SPONSOR_RIGHT}
              className="h-full"
              fallbackLabel="Sponsor"
            />
          </motion.div>

          {/* Sponsor Tile - Inline Placement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <SponsorTile
              productId="tmi"
              placementId={TMI_PLACEMENTS.ARTICLES_GRID_TILE_SPONSOR_INLINE}
              className="h-full"
              fallbackLabel="Sponsor"
            />
          </motion.div>
        </div>

        {/* View All Articles Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-white font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
            View All Articles
          </button>
        </motion.div>

        {/* Footer Sponsor Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <SponsorStrip
            productId="tmi"
            placementId={TMI_PLACEMENTS.ARTICLES_FOOTER_ADVERTISE_STRIP}
            fallbackLabel="Advertise with us"
          />
        </motion.div>
      </div>
    </section>
  )
}
