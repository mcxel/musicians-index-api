import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Fallback lookup for /profile/performer/[slug] when a performer isn't in
// the static PERFORMER_REGISTRY seed list (i.e. any real signup — that
// registry is a hardcoded demo list, never populated from real accounts).
// Returns a PerformerIdentity-shaped object built from real ArtistProfile/
// User data, with honest zero/empty defaults for engagement metrics that
// don't exist yet for a brand-new performer (Rule 20 — no fabricated stats).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    let artistProfile = await prisma.artistProfile.findUnique({
      where: { slug },
      include: {
        user: {
          include: { userProfile: true },
        },
      },
    });

    // Fallback: the global nav's profile link passes the raw user ID, not
    // a chosen slug (TMIGlobalNav.tsx builds `/profile/performer/${userId}`
    // directly) — so a performer who hasn't set a stage-name slug yet, or
    // whose profile link was built this way, still resolves correctly.
    if (!artistProfile) {
      artistProfile = await prisma.artistProfile.findUnique({
        where: { userId: slug },
        include: {
          user: {
            include: { userProfile: true },
          },
        },
      });
    }

    // Final fallback: no ArtistProfile row exists at all yet (performer
    // hasn't completed the "Artist Details" onboarding step) — a bare User
    // record is still enough to render an honest, mostly-empty profile
    // instead of a 404, as long as the account is real and matches by ID.
    let bareUser: Awaited<ReturnType<typeof prisma.user.findUnique>> & { userProfile?: { displayName: string | null; bio: string | null; avatarUrl: string | null; bannerUrl: string | null; location: string | null } | null } | null = null;
    if (!artistProfile) {
      bareUser = await prisma.user.findUnique({
        where: { id: slug },
        include: { userProfile: true },
      });
      if (!bareUser) {
        return NextResponse.json({ error: "Performer not found" }, { status: 404 });
      }
    }

    const user = artistProfile?.user ?? bareUser!;
    const profile = user.userProfile;
    const displayName = artistProfile?.stageName ?? profile?.displayName ?? user.displayName ?? user.email?.split("@")[0] ?? "Performer";

    // DB stores tier uppercase (FREE/PRO/RUBY/SILVER/GOLD/PLATINUM/DIAMOND);
    // PerformerIdentity's PerformerTier type mixes case for the top tiers.
    const tierMap: Record<string, string> = {
      FREE: "FREE", PRO: "PRO", RUBY: "RUBY",
      SILVER: "Silver", GOLD: "Gold", PLATINUM: "Platinum", DIAMOND: "Diamond",
    };
    const tier = tierMap[user.tier?.toUpperCase() ?? "FREE"] ?? "FREE";

    return NextResponse.json({
      ok: true,
      performer: {
        id: user.id,
        slug: artistProfile?.slug ?? user.id,
        name: displayName,
        profileImageUrl: profile?.avatarUrl ?? "/images/tmi-placeholder.jpg",
        coverImageUrl: profile?.bannerUrl ?? "/images/tmi-placeholder.jpg",
        bio: profile?.bio ?? undefined,
        songs: [],
        city: profile?.location ?? "",
        countryName: "",
        flag: "",
        category: artistProfile?.genres?.[0] ?? "Hip-Hop",
        tier,
        lineupType: "solo",
        rank: 0,
        xp: 0,
        fanCount: artistProfile?.followers ?? 0,
        likes: 0,
        isLive: false,
        audienceCount: 0,
        timeLive: "",
        roomId: "",
        achievementIds: [],
        articleIds: [],
        profileRoute: `/profile/performer/${artistProfile?.slug ?? user.id}`,
        liveRoomRoute: "",
        ownerId: user.id,
      },
    });
  } catch (err) {
    console.error("[api/performers/by-slug] failed:", err);
    return NextResponse.json({ error: "Failed to query performer" }, { status: 500 });
  }
}
