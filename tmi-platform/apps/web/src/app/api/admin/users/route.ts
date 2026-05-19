import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_utils/require-admin';

const SEEDED_USERS = [
  { id: 'u-marcel-001', role: 'ADMIN',  email: 'admin@themusiciansindex.com',  name: 'Marcel Dickens', createdAt: '2026-01-01' },
  { id: 'u-kreach-001', role: 'ARTIST', email: 'kreach@themusiciansindex.com', name: 'Kreach',         createdAt: '2026-05-01' },
  { id: 'u-kg-001',     role: 'ARTIST', email: 'kg@themusiciansindex.com',     name: 'KG',             createdAt: '2026-05-01' },
  { id: 'u-savage-001', role: 'USER',   email: 'savage@themusiciansindex.com', name: 'Savage Guns',    createdAt: '2026-05-01' },
  { id: 'u-jason-001',  role: 'USER',   email: 'jason@themusiciansindex.com',  name: 'Jason Smith',    createdAt: '2026-05-01' },
];

const SEEDED_ARTISTS = [
  { id: 'a-kreach-001', name: 'Kreach',      userId: 'u-kreach-001', slug: 'kreach',      genre: 'Hip-Hop', bio: 'Diamond producer / performer — Lifetime VIP', verified: true  },
  { id: 'a-kg-001',     name: 'KG',          userId: 'u-kg-001',     slug: 'kg',          genre: 'Hip-Hop', bio: 'Diamond producer / performer — Lifetime VIP', verified: true  },
  { id: 'a-savage-001', name: 'Savage Guns', userId: 'u-savage-001', slug: 'savage-guns', genre: 'Hip-Hop', bio: 'Performer — 90-day Diamond trial',            verified: false },
];

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({ users: SEEDED_USERS, artists: SEEDED_ARTISTS });
}
