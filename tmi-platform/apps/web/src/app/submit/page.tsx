'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'

// Minimal inline icon used as a replacement for heroicons in CI
function Icon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

interface SubmissionTile {
  id: string
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  gradient: string
  requiresArtist: boolean
  comingSoon?: boolean
}

const submissionTypes: SubmissionTile[] = [
  {
    id: 'join-game',
    title: 'Join Game',
    description: 'Register as an artist and start your journey',
    icon: Icon,
    gradient: 'from-purple-600 to-purple-800',
    requiresArtist: false
  },
  {
    id: 'audience',
    title: 'Audience Member',
    description: 'Join as a fan and support your favorite artists',
    icon: Icon,
    gradient: 'from-blue-600 to-blue-800',
    requiresArtist: false
  },
  {
    id: 'monthly-idol',
    title: 'Monthly Idol',
    description: 'Compete to become this month\'s featured idol',
    icon: Icon,
    gradient: 'from-yellow-600 to-orange-800',
    requiresArtist: true
  },
  {
    id: 'battle',
    title: 'Battle Arena',
    description: 'Challenge another artist to a head-to-head battle',
    icon: Icon,
    gradient: 'from-red-600 to-red-800',
    requiresArtist: true
  },
  {
    id: 'cypher',
    title: 'Cypher Circle',
    description: 'Join collaborative cypher sessions with other artists',
    icon: Icon,
    gradient: 'from-green-600 to-green-800',
    requiresArtist: true
  },
  {
    id: 'comedy',
    title: 'Saturday Night Stand-Up',
    description: 'Submit your comedy set for Saturday night showcase',
    icon: Icon,
    gradient: 'from-pink-600 to-pink-800',
    requiresArtist: true,
    comingSoon: true
  },
  {
    id: 'dance',
    title: 'Dance Showcase',
    description: 'Show off your dance moves in our weekly showcase',
    icon: Icon,
    gradient: 'from-cyan-600 to-cyan-800',
    requiresArtist: true,
    comingSoon: true
  },
  {
    id: 'shows',
    title: 'Live Shows',
    description: 'Apply to host your own live show',
    icon: Icon,
    gradient: 'from-indigo-600 to-indigo-800',
    requiresArtist: true,
    comingSoon: true
  }
]

export default function SubmitPage() {
  const router = useRouter()

  const ROUTE_MAP: Record<string, string> = {
    'join-game': '/signup/performer',
    'audience': '/signup/fan',
    'monthly-idol': '/signup/performer',
    'battle': '/signup/performer',
    'cypher': '/signup/performer',
  }

  const handleSubmissionClick = (submission: SubmissionTile) => {
    if (submission.comingSoon) return

    const destination = ROUTE_MAP[submission.id]
    if (destination) {
      logger.log('Routing to:', destination)
      router.push(destination)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Submit & Participate
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose how you want to participate in The Musicians Index. Artists, comedians, dancers, and fans all welcome!
          </p>
        </div>

        {/* Submission Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {submissionTypes.map((submission, _index) => (
            <button
              key={submission.id}
              onClick={() => handleSubmissionClick(submission)}
              className="relative group"
            >
              <div className={`bg-gradient-to-br ${submission.gradient} rounded-2xl p-8 h-full transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl ${
                submission.comingSoon ? 'opacity-60' : ''
              }`}>
                {/* Icon */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                  <submission.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-xl mb-2">{submission.title}</h3>

                {/* Description */}
                <p className="text-white/80 text-sm mb-4">{submission.description}</p>

                {/* Badge */}
                <div className="flex items-center justify-between">
                  {submission.requiresArtist ? (
                    <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                      Artist Only
                    </span>
                  ) : (
                    <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                      Open to All
                    </span>
                  )}
                  {submission.comingSoon && (
                    <span className="text-xs bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-yellow-300 border border-yellow-500/30">
                      Coming Soon
                    </span>
                  )}
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-purple-400 font-semibold mb-2">1. Choose Your Path</h3>
              <p className="text-gray-400 text-sm">
                Select whether you want to participate as an artist, comedian, dancer, or fan. Each path has unique opportunities.
              </p>
            </div>
            <div>
              <h3 className="text-pink-400 font-semibold mb-2">2. Create Your Profile</h3>
              <p className="text-gray-400 text-sm">
                Artist submissions require an artist profile. Fan activities require a fan profile. You can have both!
              </p>
            </div>
            <div>
              <h3 className="text-cyan-400 font-semibold mb-2">3. Start Participating</h3>
              <p className="text-gray-400 text-sm">
                Submit your work, vote in battles, join cyphers, and earn points for your engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
