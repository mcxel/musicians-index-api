/**
 * GET /api/performers — Dynamic performer list with real avatar propagation
 * 
 * P0 Avatar Certification: Merges hardcoded PERFORMER_REGISTRY with real Prisma data
 * so that avatar uploads propagate to Home 1, Live rooms, and discovery surfaces.
 * 
 * This endpoint bridges the gap until the full registry is migrated to Prisma-only.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PERFORMER_REGISTRY, type PerformerIdentity } from '@/lib/performers/PerformerRegistry';
import { isQAAccount } from '@/lib/qa/QACertificationFleet';

/**
 * Merge: For each performer in the registry, if they have a real avatar/profile in Prisma,
 * use that instead of the hardcoded placeholder.
 */
async function mergeRegistryWithRealData(): Promise<PerformerIdentity[]> {
  // Fetch all user profiles with real avatar data
  // TODO: after `prisma generate` for migration 20260705, add where: { user: { isQA: false } }
  const allProfiles = await prisma.userProfile.findMany({
    select: {
      userId: true,
      avatarUrl: true,
      bannerUrl: true,
      displayName: true,
      bio: true,
      user: { select: { email: true } },
    },
  });
  const profiles = allProfiles.filter(p => !isQAAccount(p.user?.email ?? ''));

  const profilesByUserId = new Map(profiles.map(p => [p.userId, p]));

  // Merge: iterate registry and override with real data if available
  return PERFORMER_REGISTRY.map(perf => {
    // Try to find profile by matching slugs/names
    // In a real migration, we'd have userId in the registry, but for now use slug matching
    const profile = profiles.find(p => 
      p.displayName?.toLowerCase().includes(perf.slug) || 
      p.displayName?.toLowerCase() === perf.name.toLowerCase()
    );

    if (!profile || !profile.avatarUrl) {
      // No real avatar yet, return registry default
      return perf;
    }

    // Override with real avatar data
    return {
      ...perf,
      profileImageUrl: profile.avatarUrl,
      coverImageUrl: profile.bannerUrl || perf.coverImageUrl,
      bio: profile.bio || perf.bio,
    };
  });
}

export async function GET() {
  try {
    const performers = await mergeRegistryWithRealData();
    return NextResponse.json({ ok: true, performers, count: performers.length });
  } catch (error) {
    console.error('Failed to fetch performers:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch performers' },
      { status: 500 }
    );
  }
}
