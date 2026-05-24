export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const SHOP_ITEMS = [
  { id: 'prop-001', name: 'Gold Chain',              price: 2.99, category: 'PROP',       emoji: '📿', rarity: 'RARE' },
  { id: 'prop-002', name: 'Neon Mic',                price: 1.99, category: 'PROP',       emoji: '🎙️', rarity: 'COMMON' },
  { id: 'prop-003', name: 'Diamond Grills',          price: 6.99, category: 'PROP',       emoji: '💎', rarity: 'LEGENDARY' },
  { id: 'prop-004', name: 'Producer Headphones',     price: 3.49, category: 'PROP',       emoji: '🎧', rarity: 'RARE' },
  { id: 'prop-005', name: 'Spray Can',               price: 1.49, category: 'PROP',       emoji: '🎨', rarity: 'COMMON' },
  { id: 'cloth-001', name: 'Crown Hat',              price: 4.99, category: 'CLOTHING',   emoji: '👑', rarity: 'LEGENDARY' },
  { id: 'cloth-002', name: 'Cypher Jacket',          price: 5.99, category: 'CLOTHING',   emoji: '🥼', rarity: 'EPIC' },
  { id: 'cloth-003', name: 'Battle Hoodie',          price: 3.99, category: 'CLOTHING',   emoji: '👔', rarity: 'RARE' },
  { id: 'cloth-004', name: 'Gold Chain Tee',         price: 2.49, category: 'CLOTHING',   emoji: '👕', rarity: 'COMMON' },
  { id: 'cloth-005', name: 'TMI Season Pass Drip',   price: 8.99, category: 'CLOTHING',   emoji: '🏆', rarity: 'LEGENDARY' },
  { id: 'emote-001', name: 'Dab Emote',              price: 0.99, category: 'EMOTE',      emoji: '💃', rarity: 'COMMON' },
  { id: 'emote-002', name: 'Clap It Up',             price: 0.99, category: 'EMOTE',      emoji: '👏', rarity: 'COMMON' },
  { id: 'emote-003', name: 'Mic Drop',               price: 1.99, category: 'EMOTE',      emoji: '🎤', rarity: 'RARE' },
  { id: 'emote-004', name: 'Winner Wave',            price: 2.49, category: 'EMOTE',      emoji: '🏅', rarity: 'EPIC' },
  { id: 'emote-005', name: 'Crown Toss',             price: 3.99, category: 'EMOTE',      emoji: '👑', rarity: 'LEGENDARY' },
  { id: 'bg-001',   name: 'Studio Background',       price: 3.99, category: 'BACKGROUND', emoji: '🎚️', rarity: 'RARE' },
  { id: 'bg-002',   name: 'Neon City',               price: 4.49, category: 'BACKGROUND', emoji: '🌆', rarity: 'EPIC' },
  { id: 'bg-003',   name: 'Live Stage',              price: 5.99, category: 'BACKGROUND', emoji: '🎭', rarity: 'LEGENDARY' },
  { id: 'bg-004',   name: 'Street Corner',           price: 2.99, category: 'BACKGROUND', emoji: '🏙️', rarity: 'COMMON' },
  { id: 'fx-001',   name: 'Stage Fire Effect',       price: 2.49, category: 'EFFECT',     emoji: '🔥', rarity: 'EPIC' },
  { id: 'fx-002',   name: 'Smoke Effect',            price: 1.99, category: 'EFFECT',     emoji: '💨', rarity: 'RARE' },
  { id: 'fx-003',   name: 'Gold Confetti',           price: 3.49, category: 'EFFECT',     emoji: '✨', rarity: 'EPIC' },
  { id: 'fx-004',   name: 'Lightning Strike',        price: 4.99, category: 'EFFECT',     emoji: '⚡', rarity: 'LEGENDARY' },
];

export async function GET() {
  return NextResponse.json(SHOP_ITEMS);
}
