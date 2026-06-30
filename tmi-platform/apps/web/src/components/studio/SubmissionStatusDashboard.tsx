'use client';

import { motion } from 'framer-motion';

interface Submission {
  id: string;
  title: string;
  destinations: string[];
  status: 'pending' | 'approved' | 'scheduled' | 'live' | 'featured' | 'archived';
  submittedAt: string;
  approvedAt?: string;
  plays?: number;
  stats?: {
    plays: number;
    saves: number;
    shares: number;
  };
}

interface SubmissionStatusDashboardProps {
  performerId: string;
}

const C = {
  bg: '#050815',
  panel: 'rgba(8,14,38,.95)',
  card: 'rgba(12,20,50,.9)',
  border: '#1a1a3a',
  cyan: '#00E5FF',
  gold: '#FFD700',
  green: '#00FF88',
  red: '#FF4444',
  accent: '#FF2DAA',
  muted: 'rgba(255,255,255,0.45)',
  text: '#FFFFFF',
};

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: C.gold, icon: '⏳' },
  approved: { label: 'Approved', color: C.green, icon: '✅' },
  scheduled: { label: 'Scheduled', color: C.cyan, icon: '📅' },
  live: { label: 'Live', color: C.green, icon: '🔴' },
  featured: { label: 'Featured', color: C.accent, icon: '⭐' },
  archived: { label: 'Archived', color: C.muted, icon: '📦' },
};

const mockSubmissions: Submission[] = [
  {
    id: 'sub-001',
    title: 'Neon Dreams',
    destinations: ['Stream Radio', 'One Prayer Radio'],
    status: 'pending',
    submittedAt: '2026-06-29T10:30:00Z',
  },
  {
    id: 'sub-002',
    title: 'Golden Hour',
    destinations: ['Stream Radio'],
    status: 'approved',
    submittedAt: '2026-06-27T14:15:00Z',
    approvedAt: '2026-06-28T09:00:00Z',
  },
  {
    id: 'sub-003',
    title: 'Midnight City',
    destinations: ['Stream Radio', 'One Prayer Radio', 'Magazine Feature'],
    status: 'live',
    submittedAt: '2026-06-25T09:45:00Z',
    approvedAt: '2026-06-26T10:00:00Z',
    stats: {
      plays: 247,
      saves: 42,
      shares: 18,
    },
  },
];

export default function SubmissionStatusDashboard({ performerId }: SubmissionStatusDashboardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group submissions by status
  const submissionsByStatus = {
    pending: mockSubmissions.filter((s) => s.status === 'pending'),
    approved: mockSubmissions.filter((s) => s.status === 'approved'),
    scheduled: mockSubmissions.filter((s) => s.status === 'scheduled'),
    live: mockSubmissions.filter((s) => s.status === 'live'),
    featured: mockSubmissions.filter((s) => s.status === 'featured'),
    archived: mockSubmissions.filter((s) => s.status === 'archived'),
  };

  return (
    <div>
      {/* Summary Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          marginBottom: 20,
        }}
      >
        {[
          { label: 'Pending', value: submissionsByStatus.pending.length, color: C.gold },
          { label: 'Approved', value: submissionsByStatus.approved.length, color: C.green },
          { label: 'Live', value: submissionsByStatus.live.length, color: C.cyan },
          {
            label: 'Total Plays',
            value: mockSubmissions.reduce((sum, s) => sum + (s.stats?.plays || 0), 0),
            color: C.accent,
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: 12,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 900, color: stat.color, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Submissions by Status */}
      <div style={{ display: 'grid', gap: 20 }}>
        {(['pending', 'approved', 'live', 'archived'] as const).map((statusKey) => {
          const submissions = submissionsByStatus[statusKey];
          if (submissions.length === 0) return null;

          const config = STATUS_CONFIG[statusKey];

          return (
            <motion.div
              key={statusKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3
                style={{
                  margin: '0 0 12px 0',
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.muted,
                  letterSpacing: '0.1em',
                }}
              >
                {config.icon} {config.label.toUpperCase()} ({submissions.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {submissions.map((sub, idx) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                          🎵 {sub.title}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: C.muted,
                            marginBottom: 8,
                            display: 'flex',
                            gap: 6,
                            flexWrap: 'wrap',
                          }}
                        >
                          {sub.destinations.map((dest) => (
                            <span
                              key={dest}
                              style={{
                                background: C.cyan + '22',
                                border: `1px solid ${C.cyan}44`,
                                color: C.cyan,
                                padding: '2px 6px',
                                borderRadius: 3,
                                fontSize: 9,
                              }}
                            >
                              {dest}
                            </span>
                          ))}
                        </div>
                        <div style={{ fontSize: 9, color: C.muted }}>
                          Submitted {formatDate(sub.submittedAt)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: 100 }}>
                        <div
                          style={{
                            fontSize: 10,
                            background: config.color + '22',
                            border: `1px solid ${config.color}`,
                            color: config.color,
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontWeight: 600,
                            marginBottom: 8,
                          }}
                        >
                          {config.label}
                        </div>

                        {sub.stats && (
                          <div style={{ fontSize: 9, color: C.muted }}>
                            <div>📊 {sub.stats.plays} plays</div>
                            <div>💾 {sub.stats.saves} saves</div>
                            <div>📤 {sub.stats.shares} shares</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {mockSubmissions.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 40,
            color: C.muted,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 12 }}>No submissions yet. Start submitting songs to track their progress!</div>
        </div>
      )}
    </div>
  );
}
