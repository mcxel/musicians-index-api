"use client"

import { useState, useEffect } from "react"

// Lightweight inline icons (avoids external heroicons dependency)
function IconSparkles(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 2l1.2 3.8L17 7l-3.8 1.2L12 12l-1.2-3.8L7 7l3.8-1.2L12 2z" />
    </svg>
  )
}

function IconTrophy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={2} d="M7 3h10v2a4 4 0 01-4 4H11a4 4 0 01-4-4V3zM5 7v3a6 6 0 006 6v3" />
    </svg>
  )
}

function IconFire(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={2} d="M12 2s4 3 4 7a4 4 0 11-8 0c0-4 4-7 4-7z" />
    </svg>
  )
}

function IconClock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
      <path strokeWidth={2} d="M12 7v6l4 2" />
    </svg>
  )
}

function IconStar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={2} d="M12 17.3L7.6 20l1-5.1L4.8 11l5.2-.7L12 6l1.9 4.3 5.2.7-3.8 3.9 1 5.1z" />
    </svg>
  )
}

function IconShare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={2} d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
      <path strokeWidth={2} d="M12 3v12" />
      <path strokeWidth={2} d="M8 7l4-4 4 4" />
    </svg>
  )
}

function IconChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  )
}

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
  const [pointsSummary, setPointsSummary] = useState<PointsSummary>({ balance: 0, todayEarned: 0, lifetimeEarned: 0 })
  const [rewards, setRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data for now
      setPointsSummary({ balance: 1250, todayEarned: 85, lifetimeEarned: 3420 })
      setRewards([
        { id: '1', type: 'STREAM_WIN', amount: 10, description: 'Completed play: Thunder Beats', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), source: 'Stream & Win' },
        { id: '2', type: 'STREAM_WIN', amount: 10, description: 'Completed play: Soul Dance', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), source: 'Stream & Win' },
        { id: '3', type: 'SEED_SUBMISSION', amount: 5, description: 'Submitted seed: Rock Anthem', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), source: 'Stream & Win' }
      ])
    } catch (err) {
      // keep simple for now
      // eslint-disable-next-line no-console
      console.error('Failed to load dashboard data:', err)
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
    // placeholder
    // eslint-disable-next-line no-alert
    alert('Share card coming soon')
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">Fan Dashboard</h1>
          <p className="text-gray-400 text-lg">Track your points, rewards, and achievements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 backdrop-blur-md border border-purple-400/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg"><IconSparkles className="w-8 h-8 text-purple-400" /></div>
              <button onClick={shareCard} className="text-purple-400 hover:text-purple-300 transition-colors"><IconShare className="w-5 h-5" /></button>
            </div>
            <h3 className="text-gray-400 text-sm font-semibold mb-1">Current Balance</h3>
            <p className="text-4xl font-bold text-white">{pointsSummary.balance.toLocaleString()}</p>
            <p className="text-purple-300 text-sm mt-1">points</p>
          </div>

          <div className="bg-gradient-to-br from-pink-900/40 to-pink-800/40 backdrop-blur-md border border-pink-400/30 rounded-2xl p-6">
            <div className="bg-pink-500/20 p-3 rounded-lg w-fit mb-4"><IconFire className="w-8 h-8 text-pink-400" /></div>
            <h3 className="text-gray-400 text-sm font-semibold mb-1">Today&apos;s Earnings</h3>
            <p className="text-4xl font-bold text-white">+{pointsSummary.todayEarned}</p>
            <p className="text-pink-300 text-sm mt-1">points earned today</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/40 to-orange-800/40 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-6">
            <div className="bg-yellow-500/20 p-3 rounded-lg w-fit mb-4"><IconTrophy className="w-8 h-8 text-yellow-400" /></div>
            <h3 className="text-gray-400 text-sm font-semibold mb-1">Lifetime Earnings</h3>
            <p className="text-4xl font-bold text-white">{pointsSummary.lifetimeEarned.toLocaleString()}</p>
            <p className="text-yellow-300 text-sm mt-1">total points earned</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2"><IconClock className="w-6 h-6 text-purple-400" /><span>Rewards Received</span></h2>
            <button className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 text-sm"><span>View All</span><IconChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="space-y-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-2 rounded-lg ${reward.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}><IconStar className={`w-5 h-5 ${reward.amount > 0 ? 'text-green-400' : 'text-red-400'}`} /></div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{reward.description}</p>
                    <p className="text-gray-400 text-sm">{reward.source}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${reward.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{reward.amount > 0 ? '+' : ''}{reward.amount}</p>
                    <p className="text-gray-500 text-xs">{formatTimestamp(reward.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button onClick={shareCard} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"><IconShare className="w-5 h-5" /><span>Share Your Achievements</span></button>
          <p className="text-gray-500 text-sm mt-3">Show off your points and rewards on social media</p>
        </div>
      </div>
    </div>
  )
}
