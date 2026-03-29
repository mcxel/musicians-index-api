/**
 * TMI — BIO STORY ENGINE
 * Rotating short magazine-style paragraphs.
 * Never shows the same block twice in a row.
 * Tier-aware depth. Group/solo mode.
 */

// ─────────────────────────────────────────────
// BIO BLOCK TYPES
// ─────────────────────────────────────────────
export const BIO_BLOCK_TYPES = {
  ORIGIN:       'origin',
  SOUND:        'sound',
  CURRENT_ERA:  'current_era',
  BACKSTAGE:    'backstage',
  FAN_CONNECT:  'fan_connect',
  PHILOSOPHY:   'philosophy',
  COLLABORATION:'collaboration',
  MEMBER_SPOT:  'member_spotlight',  // groups only
  INTERVIEW:    'interview',
  TRIVIA:       'trivia',
  POLL:         'poll',
  QUOTE:        'quote',
};

// ─────────────────────────────────────────────
// BLOCK GENERATOR
// ─────────────────────────────────────────────
export function generateBioBlocks(artistData, tier = 'free') {
  const {
    stageName, hometown, genre, bio, influences,
    currentProject, mission, quote, members,
    lineupStatus = 'solo', studioHabits
  } = artistData;

  const isGroup = lineupStatus !== 'solo' && members?.length > 1;
  const blocks = [];

  // ── ORIGIN ──
  blocks.push({
    type: BIO_BLOCK_TYPES.ORIGIN,
    text: hometown
      ? `Emerging from ${hometown}'s ${genre || 'independent'} music scene, ${stageName} built their sound through years of dedication to the craft. What started as a personal creative outlet quickly evolved into a distinctive artistic identity that resonates with fans across the globe.`
      : `${stageName} has been crafting their signature sound in the underground music world, developing a unique style that defies easy categorization. Their journey from bedroom recordings to live stages reflects the kind of raw artistic drive that defines genuine talent.`,
  });

  // ── SOUND ──
  if (genre || influences) {
    blocks.push({
      type: BIO_BLOCK_TYPES.SOUND,
      text: `Rooted in ${genre || 'eclectic'} influences${influences ? ` — particularly ${influences}` : ''}, ${stageName}'s sound occupies a space between emotional authenticity and sonic innovation. Each track carries the weight of real experience while pushing into new creative territory.`,
    });
  }

  // ── CURRENT ERA ──
  if (currentProject) {
    blocks.push({
      type: BIO_BLOCK_TYPES.CURRENT_ERA,
      text: `Currently focused on ${currentProject}, ${stageName} is entering one of the most exciting chapters of their career. The creative energy behind this era feels both intentional and alive — exactly the kind of momentum that builds lasting legacies.`,
    });
  }

  // ── MISSION / PHILOSOPHY ──
  if (mission) {
    blocks.push({
      type: BIO_BLOCK_TYPES.PHILOSOPHY,
      text: `${stageName}'s artistic mission centers around ${mission}. This isn't just a creative philosophy — it's the thread that connects every song, every performance, and every fan interaction into something meaningful and lasting.`,
    });
  }

  // ── BACKSTAGE (free+) ──
  blocks.push({
    type: BIO_BLOCK_TYPES.BACKSTAGE,
    text: studioHabits
      ? `Inside the studio, ${stageName} approaches every session with ${studioHabits}. This disciplined creative process has produced some of their most celebrated material and continues to drive the standard they hold themselves to.`
      : `Behind the scenes, ${stageName} maintains a creative process that balances spontaneity with discipline. The studio becomes a laboratory where ideas get tested, broken apart, and rebuilt into something greater.`,
  });

  // ── FAN CONNECTION ──
  blocks.push({
    type: BIO_BLOCK_TYPES.FAN_CONNECT,
    text: `What sets ${stageName} apart isn't just the music — it's the genuine connection built with the people who support it. Fans describe the experience of discovering ${stageName}'s work as finding something that was missing, a sound that feels personal even when heard for the first time.`,
  });

  // ── GROUP: MEMBER SPOTLIGHT (paid+) ──
  if (isGroup && tier !== 'free' && members) {
    members.forEach(m => {
      blocks.push({
        type: BIO_BLOCK_TYPES.MEMBER_SPOT,
        memberName: m.name,
        text: `${m.name}${m.role ? `, who handles ${m.role}` : ''}, brings ${m.contribution || 'a unique perspective'} to the group's sound. Their influence on the collective's direction has been one of the defining forces behind what makes ${stageName} work as a creative unit.`,
      });
    });
  }

  // ── QUOTE (if exists) ──
  if (quote) {
    blocks.push({
      type: BIO_BLOCK_TYPES.QUOTE,
      text: quote,
      isQuote: true,
    });
  }

  // Filter by tier depth
  const TIER_LIMITS = { free: 3, bronze: 4, gold: 5, platinum: 6, diamond: 999 };
  return blocks.slice(0, TIER_LIMITS[tier] || 3);
}

// ─────────────────────────────────────────────
// ROTATION ENGINE
// ─────────────────────────────────────────────
export class BioRotationEngine {
  constructor() {
    this.history = new Map(); // artistId → last shown block indices
  }

  getNextBlocks(artistId, blocks, count = 3) {
    if (!blocks || blocks.length === 0) return [];
    const seen = this.history.get(artistId) || [];
    
    // Prioritize unseen blocks
    const unseen = blocks.filter((_, i) => !seen.includes(i));
    const pool = unseen.length >= count ? unseen : blocks;
    
    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    // Update history
    const selectedIndices = selected.map(b => blocks.indexOf(b));
    this.history.set(artistId, [...seen, ...selectedIndices].slice(-6));

    return selected;
  }

  clearHistory(artistId) {
    this.history.delete(artistId);
  }
}

// Singleton rotation engine
export const rotationEngine = new BioRotationEngine();

// ─────────────────────────────────────────────
// REACT HOOK
// ─────────────────────────────────────────────
import { useState, useCallback, useEffect } from 'react';

export function useBioRotation(artistData, options = {}) {
  const {
    tier = 'free',
    rotateOnMount = true,
    rotateInterval = null, // ms, null = no auto-rotate
  } = options;

  const blocks = generateBioBlocks(artistData, tier);
  const artistId = artistData?.id || artistData?.stageName;

  const [currentBlocks, setCurrentBlocks] = useState(() =>
    rotationEngine.getNextBlocks(artistId, blocks, 3)
  );

  const rotate = useCallback(() => {
    setCurrentBlocks(rotationEngine.getNextBlocks(artistId, blocks, 3));
  }, [artistId, blocks]);

  useEffect(() => {
    if (!rotateInterval) return;
    const t = setInterval(rotate, rotateInterval);
    return () => clearInterval(t);
  }, [rotate, rotateInterval]);

  return { currentBlocks, rotate, allBlocks: blocks };
}
