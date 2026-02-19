'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  StarIcon,
  ShareIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface PointsSummary {
  balance: number
  todayEarned: number
  lifetimeEarned: number
}

interface Reward {
  id: string
  type: string
  amount: number
  description: string
  timestamp: string
  source: string
}

export default function DashboardPage() {
  const [pointsSummary, setPointsSummary] = useState<PointsSummary>({
    balance: 0,
    todayEarned: 0,
    lifetimeEarned: 0
  })
  const [rewards, setRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // TODO: Wire to actual API endpoints
      // const pointsResponse = await fetch('/api/points/summary')
      // const rewardsResponse = await fetch('/api/points/history')
      
      // Mock data for now
      setPointsSummary({
        balance: 1250,
        todayEarned: 85,
        lifetimeEarned: 3420
      })

      setRewards([
        {
          id: '1',
          type: 'STREAM_WIN',
          amount: 10,
          description: 'Completed play: Thunder Beats',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          source: 'Stream & Win'
        },
        {
          id: '2',
          type: 'STREAM_WIN',
          amount: 10,
          description: 'Completed play: Soul Dance',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          source: 'Stream & Win'
        },
        {
          id: '3',
          type: 'SEED_SUBMISSION',
          amount: 5,
          description: 'Submitted seed: Rock Anthem',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          source: 'Stream & Win'
        },
        {
          id: '4',
          type: 'BATTLE_VOTE',
          amount: 3,
          description: 'Voted in Battle: Thunder vs Lightning',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          source: 'Battle Arena'
        },
        {
          id: '5',
          type: 'STREAM_WIN',
          amount: -2,
          description: 'Skipped track: Jazz Flow',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          source: 'Stream & Win'
        }
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const shareCard = () => {
    // TODO: Generate shareable card image/link
    alert('Share card feature coming soon!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Fan Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Track your points, rewards, and achievements
          </p>
        </motion.div>

        {/* Points Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Current Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-md border border-purple-400/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <SparklesIcon className="w-8 h-8 text-purple-400" />
              </div>
              <button
                onClick={shareCard}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-gray-400 text-sm font-semibold mb-1">Current Balance</h3>
            <p className="text-4xl font-bold text-white">{pointsSummary.balance.toLocaleString()}</p>
            <p className="text-purple-300 text-sm mt-1">points</p>
          </motion.div>

          {/* Today's Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-pink-900/40 to-pink-800/40 backdrop-blur-md border border-pink-400/30 rounded-2xl p-6"
          >
            <div className="bg-pink-500/20 p-3 rounded-lg w-fit mb-4">
              <FireIcon className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-gray-400 text-sm font-semibold mb-1">Today's Earnings</h3>
            <p className="text-4xl font-bold text-white">+{pointsSummary.todayEarned}</p>
            <p className="text-pink-300 text-sm mt-1">points earned today</p>
          </motion.div>

          {/* Lifetime Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-900/40 to-orange-800/40 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-6"
          >
            <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4">
              <TrophyIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-gray-400 text-sm font-semibold mb-1">Lifetime Earnings</h3>
            <p className="text-4xl font-bold text-white">{pointsSummary.lifetimeEarned.toLocaleString()}</p>
            <p className="text-yellow-300 text-sm mt-1">total points earned</p>
          </motion.div>
        </div>

        {/* Rewards Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <ClockIcon className="w-6 h-6 text-purple-400" />
              <span>Rewards Received</span>
            </h2>
            <button className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 text-sm">
              <span>View All</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    reward.amount > 0 
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    <StarIcon className={`w-5 h-5 ${
                      reward.amount > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{reward.description}</p>
                    <p className="text-gray-400 text-sm">{reward.source}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${
                      reward.amount > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      {reward.amount > 0 ? '+' : ''}{reward.amount}
                    </p>
                    <p className="text-gray-500 text-xs">{formatTimestamp(reward.timestamp)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Share Card CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <button
            onClick={shareCard}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <ShareIcon className="w-5 h-5" />
            <span>Share Your Achievements</span>
          </button>
          <p className="text-gray-500 text-sm mt-3">Show off your points and rewards on social media</p>
        </motion.div>
      </div>
    </div>
  )
}
