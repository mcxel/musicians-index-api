'use client'

import { motion } from 'framer-motion'
import { CalendarDaysIcon, UserGroupIcon, EyeIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { SponsorTile, SponsorBadge, SponsorStrip } from '@/../../program/modules/sponsors/components'
import { TMI_PLACEMENTS } from '@/../../program/modules/sponsors/placements/tmi'

interface MagazineIssue {
  id: string
  title: string
  subtitle: string
  coverImage: string
  issueNumber: number
  publishDate: string
  featuredArtist: string
  articleCount: number
  views: string
  isLatest?: boolean
}

const magazineIssues: MagazineIssue[] = [
  {
    id: 'latest',
    title: 'The Future of Music',
    subtitle: 'AI, Blockchain, and the Digital Revolution',
    coverImage: '/magazine/latest-cover.jpg',
    issueNumber: 47,
    publishDate: 'January 2024',
    featuredArtist: 'Various Artists',
    articleCount: 24,
    views: '125K',
    isLatest: true
  },
  {
    id: 'previous1',
    title: 'Hip Hop Renaissance',
    subtitle: 'The Golden Era Returns',
    coverImage: '/magazine/hip-hop-cover.jpg',
    issueNumber: 46,
    publishDate: 'December 2023',
    featuredArtist: 'Dr. Dre & Kendrick Lamar',
    articleCount: 18,
    views: '89K'
  },
  {
    id: 'previous2',
    title: 'Electronic Music Evolution',
    subtitle: 'From Underground to Mainstream',
    coverImage: '/magazine/electronic-cover.jpg',
    issueNumber: 45,
    publishDate: 'November 2023',
    featuredArtist: 'Deadmau5 & Skrillex',
    articleCount: 22,
    views: '67K'
  }
]

export default function MagazineCover() {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
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
            Latest <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Magazine</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Exclusive interviews, industry insights, and in-depth features from the world of music
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Latest Issue - Featured */}
          {magazineIssues.filter(issue => issue.isLatest).map((issue) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="relative group">
                {/* Featured Badge */}
                <div className="absolute -top-4 -left-4 z-20">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    LATEST ISSUE
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-3xl overflow-hidden border border-purple-400/30 shadow-2xl">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Cover Image */}
                    <div className="relative h-96 md:h-auto overflow-hidden">
                      <Image
                        src={issue.coverImage}
                        alt={issue.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Issue Number Overlay */}
                      <div className="absolute bottom-6 left-6">
                        <div className="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full">
                          <span className="text-2xl font-bold">#{issue.issueNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col justify-center">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
                          <CalendarDaysIcon className="w-4 h-4" />
                          <span>{issue.publishDate}</span>
                        </div>

                        {/* Sponsor Badge - Presented By */}
                        <div className="mb-4">
                          <SponsorBadge
                            productId="tmi"
                            placementId={TMI_PLACEMENTS.WEEKLY_CYPHERS_HERO_PRESENTED_BY}
                            presentedByText="Presented by"
                            className="mb-3"
                          />
                        </div>

                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                          {issue.title}
                        </h3>
                        <p className="text-xl text-gray-300 mb-4">
                          {issue.subtitle}
                        </p>
                        <p className="text-purple-400 font-medium">
                          Featuring: {issue.featuredArtist}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 mb-6 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{issue.articleCount} articles</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{issue.views} views</span>
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex gap-4">
                        <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300">
                          Read Now
                        </button>
                        <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 border border-purple-400/30 hover:border-purple-400/60">
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Previous Issues */}
          <div className="space-y-6">
            {magazineIssues.filter(issue => !issue.isLatest).map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300"
              >
                <div className="flex">
                  {/* Cover Thumbnail */}
                  <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden">
                    <Image
                      src={issue.coverImage}
                      alt={issue.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-1 left-1 text-white text-xs font-bold">
                      #{issue.issueNumber}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <h4 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-tight">
                      {issue.title}
                    </h4>
                    <p className="text-sm text-gray-400 mb-2">
                      {issue.publishDate}
                    </p>
                    <p className="text-xs text-purple-400 mb-3">
                      {issue.featuredArtist}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{issue.articleCount} articles</span>
                      <span>{issue.views} views</span>
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors">
                    Read Issue
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Sponsor Tile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <SponsorTile
                productId="tmi"
                placementId={TMI_PLACEMENTS.WEEKLY_CYPHERS_CARD_SPONSOR}
                fallbackLabel="Sponsor"
              />
            </motion.div>

            {/* Archive Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center pt-4"
            >
              <button className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/40 hover:to-pink-600/40 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 border border-purple-400/30 hover:border-purple-400/60">
                View Magazine Archive
              </button>
            </motion.div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-md rounded-3xl p-8 max-w-2xl mx-auto border border-purple-400/30">
            <h3 className="text-2xl font-bold text-white mb-4">Never Miss an Issue</h3>
            <p className="text-gray-300 mb-6">
              Get notified when new magazine issues are released and access exclusive content
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border border-purple-400/30 rounded-full px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-full text-white font-semibold transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
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
            placementId={TMI_PLACEMENTS.WEEKLY_CYPHERS_FOOTER_SPONSORS}
            fallbackLabel="Advertise with us"
          />
        </motion.div>
      </div>
    </section>
  )
}
