/**
 * Level 1: magazine P → N → R rotation lock.
 * Global #1 first, no genre #2 before leftover #1s, PNR rhythm,
 * no consecutive same Random subtype when the pool has alternatives.
 */

import {
  buildMagazineIssueSequence,
  mulberry32,
  orderPerformersRankFirstShuffleSecond,
} from "../lib/magazine/MagazineRotationEngine";
import {
  isPnrRhythm,
  type MagazineNewsSlotSource,
  type MagazinePerformerSlotSource,
  type MagazineRandomSlotSource,
} from "../lib/magazine/MagazineIssueContract";

function performer(partial: Partial<MagazinePerformerSlotSource> & Pick<MagazinePerformerSlotSource, "slug" | "name" | "category" | "xp">): MagazinePerformerSlotSource {
  return {
    rank: 0,
    profileRoute: `/performers/${partial.slug}`,
    liveRoomRoute: `/live/rooms/room-${partial.slug}`,
    isLive: false,
    profileImageUrl: "/images/tmi-placeholder.jpg",
    ...partial,
  };
}

const NEWS: MagazineNewsSlotSource[] = [
  { slug: "news-a", title: "News A", subtitle: "A", href: "/magazine/article/news-a" },
  { slug: "news-b", title: "News B", subtitle: "B", href: "/magazine/article/news-b" },
];

function runMagazinePnrRotationTest() {
  const results: Record<string, boolean> = {};
  const rng = mulberry32(42);

  const performers: MagazinePerformerSlotSource[] = [
    performer({ slug: "alpha", name: "Alpha", category: "Hip-Hop", xp: 900 }),
    performer({ slug: "bravo", name: "Bravo", category: "R&B", xp: 800 }),
    performer({ slug: "charlie", name: "Charlie", category: "Pop", xp: 700 }),
    performer({ slug: "delta", name: "Delta", category: "Hip-Hop", xp: 400 }),
    performer({ slug: "echo", name: "Echo", category: "R&B", xp: 300, publishable: false }),
  ];

  const ordered = orderPerformersRankFirstShuffleSecond(performers, rng);
  results["skips_unpublishable"] = ordered.every((p) => p.slug !== "echo");
  results["global_one_first"] = ordered[0]?.slug === "alpha";

  const bravoIdx = ordered.findIndex((p) => p.slug === "bravo");
  const charlieIdx = ordered.findIndex((p) => p.slug === "charlie");
  const deltaIdx = ordered.findIndex((p) => p.slug === "delta");
  results["no_genre_two_before_leftover_ones"] =
    bravoIdx >= 0 && charlieIdx >= 0 && deltaIdx > bravoIdx && deltaIdx > charlieIdx;

  const randomPool: MagazineRandomSlotSource[] = [
    {
      id: "paid-sponsor",
      subtype: "DIRECT_SPONSOR",
      paidObligation: true,
      title: "Paid Sponsor",
      href: "/sponsors/advertise",
      monetizationLayer: "TMI_DIRECT_SPONSOR",
    },
    {
      id: "shop-1",
      subtype: "SHOP",
      paidObligation: false,
      title: "Shop One",
      href: "/marketplace",
      monetizationLayer: "NONE",
    },
    {
      id: "shop-2",
      subtype: "SHOP",
      paidObligation: false,
      title: "Shop Two",
      href: "/marketplace",
      monetizationLayer: "NONE",
    },
    {
      id: "rankings",
      subtype: "RANKINGS",
      paidObligation: false,
      title: "Rankings",
      href: "/rankings",
      monetizationLayer: "NONE",
    },
    {
      id: "venue",
      subtype: "VENUE",
      paidObligation: false,
      title: "Venue",
      href: "/venues/arena-prime",
      monetizationLayer: "NONE",
    },
  ];

  const slots = buildMagazineIssueSequence({
    performers,
    news: NEWS,
    randomPool,
    rng: mulberry32(7),
    maxPerformerSlots: 4,
  });

  const interiorClasses = slots.map((s) => s.pageClass);
  results["pnr_rhythm"] = isPnrRhythm(interiorClasses);
  results["first_slot_is_global_one"] = slots[0]?.performerSlug === "alpha";
  results["first_random_is_paid"] =
    slots.find((s) => s.pageClass === "RANDOM")?.randomSubtype === "DIRECT_SPONSOR";

  const randomSubtypes = slots.filter((s) => s.pageClass === "RANDOM").map((s) => s.randomSubtype);
  let consecutiveSame = false;
  for (let i = 1; i < randomSubtypes.length; i += 1) {
    if (randomSubtypes[i] && randomSubtypes[i] === randomSubtypes[i - 1]) consecutiveSame = true;
  }
  results["no_consecutive_same_random_subtype"] = !consecutiveSame && randomSubtypes.length >= 2;

  results["paid_not_editorial"] = slots
    .filter((s) => s.monetizationLayer === "TMI_DIRECT_SPONSOR" || s.monetizationLayer === "ADSENSE")
    .every((s) => s.pageClass === "RANDOM" && s.xpEligible === false);

  const allPassed = Object.values(results).every(Boolean);
  console.log("[MAGAZINE_PNR_ROTATION_TEST_ASSERT]", { allPassed, results });
  if (!allPassed) {
    const failed = Object.entries(results).filter(([, ok]) => !ok).map(([k]) => k);
    throw new Error(`[MAGAZINE_PNR_ROTATION_TEST] FAILED: ${failed.join(", ")}`);
  }
}

runMagazinePnrRotationTest();
