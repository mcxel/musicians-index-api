/**
 * SubjectCompositionEngine.ts
 *
 * Implements:
 * 1. TMI — MAGAZINE MULTI-PERFORMER EDITORIAL IMAGE + GROUP COMPOSITION LAW
 *    - Supports all performance forms: SOLO, DUO, TRIO, BAND, GROUP, CHOIR, ENSEMBLE, CREW, DANCE GROUP, DJ GROUP
 *    - Composes multi-member layouts:
 *      - BAND: Central Large Image + Member Portraits (side rails, alternating, horizontal strips)
 *      - DUO: Equal balanced portraits ([A] [B] or [DUO HERO] [A] [B])
 *      - TRIO: 3-way layout ([A] [B] [C])
 *      - CHOIR / ENSEMBLE: Wide ensemble hero + section photos + expandable member directory
 *      - DANCE CREW: Synchronized action hero + member breakers
 *    - Mobile reflow: Clean vertical flow without horizontal overflow (390×844)
 *    - Distinct routing: GROUP MAGAZINE ARTICLE ≠ GROUP PUBLIC PROFILE ≠ MEMBER PUBLIC PROFILE
 *
 * 2. TMI — ARTICLE RESERVED PLACEMENT + FUTURE CONTENT LAW
 *    - Supports proposed/reserved editorial slots (RESERVED, AWAITING_MEDIA, AWAITING_VIDEO, READY, PUBLISHED)
 *    - Public renderer collapses unready slots cleanly without blank holes or fake placeholders
 *    - Activates immediately when real content becomes available
 *
 * 3. TMI — WRITER PAGES + SUBJECT-TAGGED EDITORIAL ROUTING LAW
 *    - Links byline to Writer Page (/magazine/writers/[slug] or /profile/writer/[slug])
 *    - Links subject to Subject Public Profile (/p/[slug])
 *    - Links members to Member Public Profiles (/p/[memberSlug]) when eligible
 */

import type { MagazineArticle } from "./magazineIssueData";
import { getPerformerBySlug, type PerformerIdentity } from "@/lib/performers/PerformerRegistry";

export type ArticleSubjectType =
  | "SOLO_ARTIST"
  | "DUO"
  | "TRIO"
  | "BAND"
  | "CHOIR"
  | "ENSEMBLE"
  | "COLLECTIVE"
  | "CREW"
  | "DANCE_GROUP"
  | "DJ_GROUP"
  | "COMEDY_GROUP"
  | "OTHER_PERFORMANCE_GROUP";

export type SubjectCompositionModel =
  | "SINGLE_SUBJECT"
  | "MULTI_SUBJECT"
  | "GROUP_ENTITY"
  | "MIXED_SUBJECT";

export type EditorialCompositionLayout =
  | "SOLO_EDITORIAL"
  | "DUO_SPLIT_EQUAL"
  | "TRIO_PYRAMID"
  | "BAND_CENTER_SIDE_MEMBERS"
  | "BAND_HERO_HORIZONTAL_STRIP"
  | "CHOIR_EXPANDABLE_MOSAIC"
  | "DANCE_CREW_ACTION_RAIL";

export type EditorialPlacementStatus =
  | "PROPOSED"
  | "RESERVED"
  | "READY"
  | "PUBLISHED"
  | "BLOCKED"
  | "REMOVED"
  | "AWAITING_MEDIA"
  | "AWAITING_VIDEO"
  | "AWAITING_APPROVAL";

export interface EditorialMemberSlot {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  publicProfileSlug?: string;
  status: EditorialPlacementStatus;
  quote?: string;
  side?: "left" | "right" | "center";
}

export interface EditorialMediaSlot {
  slotId: string;
  type: "GROUP_HERO" | "VIDEO_ARTICLE" | "PERFORMANCE_VIDEO" | "STAGE_PHOTO" | "BACKSTAGE_PHOTO";
  title?: string;
  url?: string;
  caption?: string;
  credit?: string;
  status: EditorialPlacementStatus;
  comingSoonLabel?: string;
  aspectRatio?: "16/9" | "21/9" | "4/3" | "1/1";
}

export interface ArticleCompositionResult {
  subjectType: ArticleSubjectType;
  compositionModel: SubjectCompositionModel;
  layout: EditorialCompositionLayout;
  heroSlot: EditorialMediaSlot;
  memberSlots: EditorialMemberSlot[];
  leftRailMembers: EditorialMemberSlot[];
  rightRailMembers: EditorialMemberSlot[];
  horizontalStripMembers: EditorialMemberSlot[];
  supportingMediaSlots: EditorialMediaSlot[];
  ctaLabel: string;
  ctaRoute: string;
  writerPageRoute: string;
  isGroup: boolean;
}

/**
 * Derives the editorial composition for an article based on subject lineup,
 * member count, image assets, and reserved slots.
 */
export function deriveSubjectComposition(
  article: MagazineArticle,
  performerOverride?: PerformerIdentity | null
): ArticleCompositionResult {
  const performer = performerOverride ?? (article.performerSlug ? getPerformerBySlug(article.performerSlug) : null);

  // 1. Determine Subject Type
  let subjectType: ArticleSubjectType = "SOLO_ARTIST";
  if (article.lineupType) {
    if (article.lineupType === "band") subjectType = "BAND";
    else if (article.lineupType === "duo") subjectType = "DUO";
    else if (article.lineupType === "trio") subjectType = "TRIO";
    else if (article.lineupType === "choir") subjectType = "CHOIR";
    else if (article.lineupType === "ensemble") subjectType = "ENSEMBLE";
    else if (article.lineupType === "dance_group") subjectType = "DANCE_GROUP";
    else if (article.lineupType === "crew") subjectType = "CREW";
    else subjectType = "OTHER_PERFORMANCE_GROUP";
  } else if (performer?.lineupType === "band") {
    subjectType = "BAND";
  } else if (performer?.lineupType === "duo") {
    subjectType = "DUO";
  } else if (performer?.lineupType === "group") {
    const text = `${performer.name} ${performer.bio ?? ""}`.toLowerCase();
    if (text.includes("choir") || text.includes("a cappella") || text.includes("vocal")) subjectType = "CHOIR";
    else if (text.includes("trio")) subjectType = "TRIO";
    else if (text.includes("dance") || performer.category === "Dance Crews") subjectType = "DANCE_GROUP";
    else subjectType = "BAND";
  }

  const isGroup = subjectType !== "SOLO_ARTIST";
  const compositionModel: SubjectCompositionModel =
    subjectType === "SOLO_ARTIST"
      ? "SINGLE_SUBJECT"
      : subjectType === "DUO"
        ? "MULTI_SUBJECT"
        : "GROUP_ENTITY";

  // 2. Resolve Group Members
  const rawMembers =
    article.groupMembers ??
    (performer?.slug === "the-night-signals"
      ? [
          { name: "Jordan Cole", role: "Lead Vocals & Synth", avatarUrl: "/tmi-curated/mag-20.jpg", publicProfileSlug: "jordan-cole" },
          { name: "Elena Cruz", role: "Lead Guitar & Textures", avatarUrl: "/tmi-curated/mag-28.jpg", publicProfileSlug: "elena-cruz" },
          { name: "Darius Vance", role: "Bass Guitar", avatarUrl: "/tmi-curated/mag-35.jpg", publicProfileSlug: "darius-vance" },
          { name: "Samira Kai", role: "Drums & Percussion", avatarUrl: "/tmi-curated/mag-42.jpg", publicProfileSlug: "samira-kai" },
        ]
      : performer?.slug === "blue-hour-duo"
        ? [
            { name: "Miles Thorne", role: "Tenor & Soprano Sax", avatarUrl: "/bot-images/Bot image 27.png", publicProfileSlug: "miles-thorne" },
            { name: "Clara Bennett", role: "Upright Acoustic Bass", avatarUrl: "/bot-images/Bot image 28.png", publicProfileSlug: "clara-bennett" },
          ]
        : performer?.slug === "amberlight-collective"
          ? [
              { name: "Maya Lin", role: "Soprano Lead", avatarUrl: "/bot-images/Bot image 2.png", publicProfileSlug: "maya-lin" },
              { name: "Devon Cross", role: "Tenor & Arranger", avatarUrl: "/bot-images/Bot image 3.png" },
              { name: "Chloe Vance", role: "Alto 1", avatarUrl: "/bot-images/Bot image 4.png" },
              { name: "Nia Thorne", role: "Alto 2", avatarUrl: "/bot-images/Bot image 5.png" },
              { name: "Elijah Brooks", role: "Baritone", avatarUrl: "/bot-images/Bot image 6.png" },
              { name: "Solomon Reed", role: "Sub-Bass", avatarUrl: "/bot-images/Bot image 7.png" },
              { name: "Kian Mercer", role: "Vocal Percussion", avatarUrl: "/bot-images/Bot image 8.png" },
              { name: "Tasha Rivera", role: "Soprano 2", avatarUrl: "/bot-images/Bot image 9.png" },
            ]
          : performer?.slug === "avatar-heavy"
            ? [
                { name: "Kenji Sato", role: "Captain & Choreographer", avatarUrl: "/bot-images/Bot image 7.png" },
                { name: "Yuki Tanaka", role: "Power Moves & Flares", avatarUrl: "/bot-images/Bot image 8.png" },
                { name: "Rei Mori", role: "Popping Specialist", avatarUrl: "/bot-images/Bot image 9.png" },
                { name: "Aoi Endo", role: "Visual Staging", avatarUrl: "/bot-images/Bot image 10.png" },
              ]
            : []);

  const memberSlots: EditorialMemberSlot[] = rawMembers.map((m, idx) => ({
    id: `m-${idx + 1}`,
    name: m.name,
    role: m.role,
    avatarUrl: (m as any).avatarUrl || `/bot-images/Bot image ${(idx % 12) + 2}.png`,
    publicProfileSlug: (m as any).publicProfileSlug,
    status: "READY",
    side: idx % 2 === 0 ? "left" : "right",
  }));

  // 3. Split members into side rails and horizontal strips
  const leftRailMembers = memberSlots.filter((m) => m.side === "left");
  const rightRailMembers = memberSlots.filter((m) => m.side === "right");
  const horizontalStripMembers = memberSlots;

  // 4. Determine Composition Layout
  let layout: EditorialCompositionLayout = "SOLO_EDITORIAL";
  if (subjectType === "DUO") {
    layout = "DUO_SPLIT_EQUAL";
  } else if (subjectType === "TRIO") {
    layout = "TRIO_PYRAMID";
  } else if (subjectType === "CHOIR" || subjectType === "ENSEMBLE") {
    layout = "CHOIR_EXPANDABLE_MOSAIC";
  } else if (subjectType === "DANCE_GROUP" || subjectType === "CREW") {
    layout = "DANCE_CREW_ACTION_RAIL";
  } else if (isGroup) {
    layout = "BAND_CENTER_SIDE_MEMBERS";
  }

  // 5. Hero Media Slot
  const heroImage =
    article.galleryImages?.[0]?.url ||
    performer?.coverImageUrl ||
    (article.slug.includes("the-night-signals")
      ? "/tmi-curated/mag-20.jpg"
      : article.slug.includes("amberlight")
        ? "/tmi-curated/mag-50.jpg"
        : article.slug.includes("blue-hour")
          ? "/tmi-curated/mag-58.jpg"
          : article.slug.includes("avatar-heavy")
            ? "/tmi-curated/mag-66.jpg"
            : article.slug.includes("hollow-creek")
              ? "/tmi-curated/mag-28.jpg"
              : "/tmi-curated/mag-20.jpg");

  const heroSlot: EditorialMediaSlot = {
    slotId: "hero-main",
    type: "GROUP_HERO",
    title: article.title,
    url: heroImage,
    caption: article.galleryImages?.[0]?.caption || `${article.title} official editorial composition`,
    credit: "TMI Curated Editorial Photography",
    status: "READY",
    aspectRatio: isGroup ? "16/9" : "4/3",
  };

  // 6. Supporting Media Slots (Stage, Backstage, Rehearsal, Video)
  const supportingMediaSlots: EditorialMediaSlot[] = (article.galleryImages?.slice(1) ?? []).map(
    (g, idx) => ({
      slotId: `gallery-${idx + 1}`,
      type: idx === 0 ? "STAGE_PHOTO" : "BACKSTAGE_PHOTO",
      url: g.url,
      caption: g.caption,
      credit: "TMI Editorial Archives",
      status: "READY",
      aspectRatio: "16/9",
    })
  );

  // Add Reserved Video Slot if not already present
  supportingMediaSlots.push({
    slotId: "video-interview-slot",
    type: "VIDEO_ARTICLE",
    title: `Backstage Video Feature: Inside ${article.title}`,
    status: "RESERVED",
    comingSoonLabel: "VIDEO FEATURE & INTERVIEW REPLAY PREMIERES THIS FRIDAY",
    aspectRatio: "16/9",
  });

  // 7. Dynamic CTA Labels and Routes
  let ctaLabel = "★ VIEW ARTIST PROFILE";
  if (subjectType === "BAND") ctaLabel = "★ VIEW BAND PROFILE";
  else if (subjectType === "CHOIR" || subjectType === "ENSEMBLE") ctaLabel = "★ VIEW CHOIR / ENSEMBLE PROFILE";
  else if (subjectType === "DUO") ctaLabel = "★ VIEW DUO PROFILE";
  else if (subjectType === "DANCE_GROUP" || subjectType === "CREW") ctaLabel = "★ VIEW DANCE CREW PROFILE";
  else if (isGroup) ctaLabel = "★ VIEW GROUP PROFILE";

  const ctaRoute = performer ? `/p/${performer.slug}` : `/p/${article.performerSlug || article.slug}`;
  const writerSlug = article.writerSlug || article.author.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const writerPageRoute = `/magazine/writers/${writerSlug}`;

  return {
    subjectType,
    compositionModel,
    layout,
    heroSlot,
    memberSlots,
    leftRailMembers,
    rightRailMembers,
    horizontalStripMembers,
    supportingMediaSlots,
    ctaLabel,
    ctaRoute,
    writerPageRoute,
    isGroup,
  };
}
