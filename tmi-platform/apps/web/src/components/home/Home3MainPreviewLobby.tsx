'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TripleMonitorWall from '@/components/monitors/TripleMonitorWall';

interface Home3MainPreviewLobbyProps {
  title?: string;
}

const SAMPLE_IMAGES = [
  '/assets/generated/venues/main-lobby-cam-1.jpg',
  '/assets/generated/venues/main-lobby-cam-2.jpg',
  '/assets/generated/venues/main-lobby-cam-3.jpg',
];

export default function Home3MainPreviewLobby({ title = 'MAIN LOBBY' }: Home3MainPreviewLobbyProps) {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '40px 24px',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#00FFFF', fontWeight: 800, marginBottom: 24 }}>
        {title}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <TripleMonitorWall
          leftImages={SAMPLE_IMAGES as [string, string, string]}
          centerImages={SAMPLE_IMAGES as [string, string, string]}
          rightImages={SAMPLE_IMAGES as [string, string, string]}
          leftLabel="STAGE LEFT"
          centerLabel="MAIN STAGE"
          rightLabel="VIP LOUNGE"
        />
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link
            href="/rooms/live"
            style={{
              display: 'inline-block',
              padding: '11px 26px',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#050510',
              background: '#00FFFF',
              borderRadius: 7,
              textDecoration: 'none',
            }}
          >
            ENTER LOBBY →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
