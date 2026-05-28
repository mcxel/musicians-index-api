export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// Seed catalog — replaced by DB query in production
const SEED_BEATS = [
  { id: 'beat-001', title: 'Late Night Frequencies', producer: 'DJ Blend', genre: 'Trap',     bpm: 140, price: 29.99, tags: ['dark', 'melodic'],   previewUrl: '/audio/beats/late-night.mp3',   available: true },
  { id: 'beat-002', title: 'Golden Hour Bounce',     producer: 'Ray Journey', genre: 'R&B',  bpm: 78,  price: 19.99, tags: ['smooth', 'chill'],    previewUrl: '/audio/beats/golden-hour.mp3',   available: true },
  { id: 'beat-003', title: 'Concrete Jungle',        producer: 'Nova Cipher', genre: 'Hip-Hop', bpm: 92, price: 24.99, tags: ['gritty', 'hard'],   previewUrl: '/audio/beats/concrete.mp3',      available: true },
  { id: 'beat-004', title: 'Digital Soul',           producer: 'DJ Blend', genre: 'EDM',     bpm: 128, price: 34.99, tags: ['electronic', 'hype'], previewUrl: '/audio/beats/digital-soul.mp3',  available: true },
  { id: 'beat-005', title: 'Afro Rain',              producer: 'Ray Journey', genre: 'Afrobeats', bpm: 97, price: 22.99, tags: ['afro', 'groove'], previewUrl: '/audio/beats/afro-rain.mp3',     available: true },
  { id: 'beat-006', title: 'Church Steps',           producer: 'Nova Cipher', genre: 'Gospel', bpm: 80, price: 19.99, tags: ['uplifting', 'choir'], previewUrl: '/audio/beats/church-steps.mp3', available: false },
];

export async function GET() {
  return NextResponse.json({ ok: true, beats: SEED_BEATS, total: SEED_BEATS.length });
}
