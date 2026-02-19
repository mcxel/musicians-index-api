'use client'

import { motion } from 'framer-motion'
import {
  MicrophoneIcon,
  UserGroupIcon,
  StarIcon,
  FireIcon,
  MusicalNoteIcon,
  FaceSmileIcon,
  SparklesIcon,
  TvIcon
} from '@heroicons/react/24/outline'

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
    icon: MicrophoneIcon,
    gradient: 'from-purple-600 to-purple-800',
    requiresArtist: false
  },
  {
    id: 'audience',
    title: 'Audience Member',
    description: 'Join as a fan and support your favorite artists',
    icon: UserGroupIcon,
    gradient: 'from-blue-600 to-blue-800',
    requiresArtist: false
  },
  {
    id: 'monthly-idol',
    title: 'Monthly Idol',
    description: 'Compete to become this month\'s featured idol',
    icon: StarIcon,
    gradient: 'from-yellow-600 to-orange-800',
    requiresArtist: true
  },
  {
    id: 'battle',
    title: 'Battle Arena',
    description: 'Challenge another artist to a head-to-head battle',
    icon: FireIcon,
    gradient: 'from-red-600 to-red-800',
    requiresArtist: true
  },
  {
    id: 'cypher',
    title: 'Cypher Circle',
    description: 'Join collaborative cypher sessions with other artists',
    icon: MusicalNoteIcon,
    gradient: 'from-green-600 to-green-800',
    requiresArtist: true
  },
  {
    id: 'comedy',
    title: 'Saturday Night Stand-Up',
    description: 'Submit your comedy set for Saturday night showcase',
    icon: FaceSmileIcon,
    gradient: 'from-pink-600 to-pink-800',
    requiresArtist: true
  },
  {
    id: 'dance',
    title: 'Dance Showcase',
    description: 'Show off your dance moves in our weekly showcase',
    icon: SparklesIcon,
    gradient: 'from-cyan-600 to-cyan-800',
    requiresArtist: true
  },
  {
    id: 'shows',
    title: 'Live Shows',
    description: 'Apply to host your own live show',
    icon: TvIcon,
    gradient: 'from-indigo-600 to-indigo-800',
    requiresArtist: true,
    comingSoon: true
  }
]

export default function SubmitPage() {
  const handleSubmissionClick = (submission: SubmissionTile) => {
    if (submission.comingSoon) {
      alert('Coming soon! Stay tuned for updates.')
      return
    }

    if (submission.requiresArtist) {
      // TODO: Check if user has artist profile
      // For now, just show placeholder
      const hasArtistProfile = false // Replace with actual check
      
      if (!hasArtistProfile) {
        if (confirm('This requires an artist profile. Would you like to create one now?')) {
          // TODO: Navigate to artist profile creation
          // eslint-disable-next-line no-console
          console.log('Navigate to create artist profile')
        }
        return
      }
    }

    if (submission.id === 'audience') {
      // TODO: Check if user has fan profile
      const hasFanProfile = false // Replace with actual check
      
      if (!hasFanProfile) {
        if (confirm('This requires a fan profile. Would you like to create one now?')) {
          // TODO: Navigate to fan profile creation
          // eslint-disable-next-line no-console
          console.log('Navigate to create fan profile')
        }
        return
      }
    }

    // TODO: Navigate to submission form for this type
    // eslint-disable-next-line no-console
    console.log('Open submission form for:', submission.id)
    alert(`${submission.title} submission coming soon!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Submit & Participate
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose how you want to participate in The Musicians Index. Artists, comedians, dancers, and fans all welcome!
          </p>
        </motion.div>

        {/* Submission Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {submissionTypes.map((submission, index) => (
            <motion.button
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
                <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
        >
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
        </motion.div>
      </div>
    </div>
  )
}
