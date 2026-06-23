'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home3RandomRoomAndDanceCTA() {
  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {/* ─── JOIN RANDOM ROOM — STAR-SHAPED CTA ─── */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            window.location.href = '/live/lobby?mode=random';
          }}
          style={{
            position: 'relative',
            minHeight: 240,
            borderRadius: 0,
            border: 'none',
            background: 'linear-gradient(135deg, #FF2DAA 0%, #FFD700 100%)',
            color: '#000',
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            textTransform: 'uppercase',
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(255, 45, 170, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            clipPath:
              'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          }}
        >
          {/* Animated glow background */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,215,0,0.3)',
                '0 0 40px rgba(255,215,0,0.6)',
                '0 0 20px rgba(255,215,0,0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>⭐</div>
            <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.2 }}>
              JOIN RANDOM<br />ROOM
            </div>
            <div style={{ fontSize: 10, marginTop: 12, opacity: 0.85, fontWeight: 700 }}>
              Find your next broadcast
            </div>
          </div>
        </motion.button>

        {/* ─── WORLD DANCE PARTY — DEDICATED SECTION ─── */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          style={{
            position: 'relative',
            minHeight: 240,
            borderRadius: 14,
            border: '2px solid #FF6B35',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,107,53,0.05))',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            textAlign: 'center',
            boxShadow: '0 0 30px rgba(255,107,53,0.3)',
          }}
        >
          {/* Animated accent line */}
          <motion.div
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #FF6B35, transparent)',
              borderRadius: 1,
            }}
          />

          <div>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💃</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                color: '#FF6B35',
                letterSpacing: '0.08em',
                marginBottom: 6,
              }}
            >
              WORLD DANCE PARTY
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: 12 }}>
              Every Friday · All Styles Welcome
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
              60+ Countries · One Floor
            </div>
          </div>

          <Link
            href="/live/rooms/world-dance-party?from=home3"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FF6B35',
              color: '#000',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              cursor: 'pointer',
              border: 'none',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLAnchorElement).style.boxShadow = '0 0 20px rgba(255,107,53,0.8)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLAnchorElement).style.boxShadow = 'none';
            }}
          >
            JOIN →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
