'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import MusicStudioBrowser from './MusicStudioBrowser';
import SubmissionFlow from './SubmissionFlow';
import SubmissionStatusDashboard from './SubmissionStatusDashboard';

type Tab = 'BROWSE' | 'SUBMIT' | 'STATUS';

interface MusicStudioProps {
  performerId: string;
  performerName: string;
}

const C = {
  bg: '#050815',
  panel: 'rgba(8,14,38,.95)',
  card: 'rgba(12,20,50,.9)',
  border: '#1a1a3a',
  cyan: '#00E5FF',
  gold: '#FFD700',
  green: '#00FF88',
  accent: '#FF2DAA',
  muted: 'rgba(255,255,255,0.45)',
  text: '#FFFFFF',
};

export default function MusicStudio({ performerId, performerName }: MusicStudioProps) {
  const [activeTab, setActiveTab] = useState<Tab>('BROWSE');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'BROWSE', label: 'Browse', icon: '🎵' },
    { id: 'SUBMIT', label: 'Submit', icon: '📤' },
    { id: 'STATUS', label: 'Status', icon: '📊' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.cyan }}>
          🎵 MUSIC STUDIO
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: 12, color: C.muted }}>
          Upload, manage, and submit your music to publishing platforms
        </p>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 12,
        }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: activeTab === tab.id ? `${C.cyan}22` : 'transparent',
              border: activeTab === tab.id ? `1px solid ${C.cyan}` : `1px solid ${C.border}`,
              color: activeTab === tab.id ? C.cyan : C.muted,
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.icon} {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'BROWSE' && (
          <MusicStudioBrowser
            performerId={performerId}
            onSelectSong={setSelectedSongId}
          />
        )}
        {activeTab === 'SUBMIT' && (
          <SubmissionFlow
            performerId={performerId}
            performerName={performerName}
            selectedSongId={selectedSongId}
            onSongSelected={setSelectedSongId}
          />
        )}
        {activeTab === 'STATUS' && (
          <SubmissionStatusDashboard performerId={performerId} />
        )}
      </div>
    </motion.div>
  );
}
