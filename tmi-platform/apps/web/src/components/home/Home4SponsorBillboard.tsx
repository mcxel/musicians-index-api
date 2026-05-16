'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GovernedMonitorSlot from '@/components/monitors/GovernedMonitorSlot';

interface Home4SponsorBillboardProps {
  title?: string;
  roomId?: string;
}

// Governed image IDs for sponsor campaigns (authority-bound)
const CAMPAIGN_A_IMAGES = [
  'home4-campaign-a-slot-1',
  'home4-campaign-a-slot-2',
  'home4-campaign-a-slot-3',
];

const CAMPAIGN_B_IMAGES = [
  'home4-campaign-b-slot-1',
  'home4-campaign-b-slot-2',
  'home4-campaign-b-slot-3',
];

const FEATURED_CAMPAIGN_IMAGES = [
  'home4-featured-campaign-slot-1',
  'home4-featured-campaign-slot-2',
  'home4-featured-campaign-slot-3',
];

// Fallback images (cached, governed degradation)
const FALLBACK_IMAGES = [
  '/tmi-curated/profile-advertiser.jpg',
  '/tmi-curated/signup-sponsor.png',
  '/tmi-curated/season-pass.jpg',
];

export default function Home4SponsorBillboard({ title = 'SPONSOR BILLBOARD', roomId = 'home-4' }: Home4SponsorBillboardProps) {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '40px 24px',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#FFD700', fontWeight: 800, marginBottom: 24 }}>
        {title}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            width: '100%',
          }}
        >
          <GovernedMonitorSlot
            governedImageIds={CAMPAIGN_A_IMAGES}
            roomId={roomId}
            fallbackImages={FALLBACK_IMAGES}
            label="CAMPAIGN A"
            priority="high"
          />
          <GovernedMonitorSlot
            governedImageIds={FEATURED_CAMPAIGN_IMAGES}
            roomId={roomId}
            fallbackImages={FALLBACK_IMAGES}
            label="FEATURED"
            priority="high"
          />
          <GovernedMonitorSlot
            governedImageIds={CAMPAIGN_B_IMAGES}
            roomId={roomId}
            fallbackImages={FALLBACK_IMAGES}
            label="CAMPAIGN B"
            priority="high"
          />
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link
            href="/sponsors/campaigns"
            style={{
              display: 'inline-block',
              padding: '11px 26px',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#050510',
              background: '#FFD700',
              borderRadius: 7,
              textDecoration: 'none',
            }}
          >
            VIEW CAMPAIGNS →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
