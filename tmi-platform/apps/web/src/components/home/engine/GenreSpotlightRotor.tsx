"use client";

import { AnimatePresence, motion } from 'framer-motion';
import type { HomepageSpotlightEntry } from './types';

interface GenreSpotlightRotorProps {
  spotlight: HomepageSpotlightEntry | null;
  genres: string[];
  dataSourceLabel: string;
  hiddenBotNames: boolean;
}

export default function GenreSpotlightRotor({
  spotlight,
  genres,
  dataSourceLabel,
  hiddenBotNames,
}: Readonly<GenreSpotlightRotorProps>) {
  if (!spotlight) return null;
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 5,
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'linear-gradient(120deg, rgba(13,21,44,0.88), rgba(12,26,37,0.86))',
        padding: '14px 16px',
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.78 }}>
            Weekly Crown Rotation
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${spotlight.name}-${spotlight.genre}`}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.98 }}
              transition={{ duration: 0.45 }}
            >
              <div style={{ marginTop: 8, fontSize: 22, fontWeight: 900, letterSpacing: '0.06em' }}>{spotlight.name}</div>
              <div style={{ marginTop: 6, color: '#64e6ff', fontWeight: 700 }}>{spotlight.genre} crown candidate</div>
              <div style={{ marginTop: 4, fontSize: 12, opacity: 0.74 }}>{spotlight.scoreLabel}</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ display: 'grid', gap: 6, justifyItems: 'end' }}>
          <div
            style={{
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '4px 10px',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.11em',
            }}
          >
            source {dataSourceLabel}
          </div>
          <div
            style={{
              borderRadius: 999,
              border: '1px solid rgba(100,230,255,0.35)',
              padding: '4px 10px',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.11em',
              color: '#64e6ff',
            }}
          >
            {hiddenBotNames ? 'automation hidden mode' : 'automation visible mode'}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {genres.map((genre) => {
          const active = genre === spotlight.genre;
          return (
            <span
              key={genre}
              style={{
                borderRadius: 999,
                border: active ? '1px solid rgba(255,188,68,0.8)' : '1px solid rgba(255,255,255,0.18)',
                background: active ? 'rgba(255,188,68,0.16)' : 'rgba(255,255,255,0.04)',
                color: active ? '#ffcf6f' : 'rgba(236,240,255,0.88)',
                fontSize: 11,
                padding: '4px 9px',
              }}
            >
              {genre}
            </span>
          );
        })}
      </div>
    </section>
  );
}
