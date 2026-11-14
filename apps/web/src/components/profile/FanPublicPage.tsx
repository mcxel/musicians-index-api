"use client";

import { useState } from "react";
import Link from "next/link";
import UniversalMediaPanel from "@/components/media/UniversalMediaPanel";
import ArtistIdShareStrip from "@/components/identity/ArtistIdShareStrip";
import DiscoveryRail from "@/components/discovery/DiscoveryRail";
import PublicProfileMediaComposer, { type MediaBlock } from "@/components/profile/PublicProfileMediaComposer";
import IdentityPlate from "@/components/profile/IdentityPlate";
import ProfileCustomizer from "@/components/profile/ProfileCustomizer";
import ProfileSoundtrackPlayer from "@/components/profile/ProfileSoundtrackPlayer";
import PersonalWritingWall from "@/components/profile/PersonalWritingWall";
import ProfileHeroBanner from "@/components/profile/ProfileHeroBanner";
import ProfileShareModal from "@/components/profile/ProfileShareModal";
import { DEFAULT_PUBLIC_PROFILE_CONFIG, type PublicProfileConfig } from "@/lib/profile/PublicProfileStyleEngine";
import { useProfileConfig } from "@/hooks/useProfileConfig";
import { usePageWritingContent, toContentMediaBlocks } from "@/hooks/usePageWritingContent";
import { TMI_CANVAS_MAX_WIDTH_PX } from "@/lib/magazine/TmiSurfaceParityEngine";
import type { PublicPageDocument } from "@/lib/publicPage/publicPageDocument";
import type { DocumentPreviewPresentation } from "@/lib/publicPage/presentPublicPageDocument";
import { previewDraftDocument } from "@/lib/publicPage/editPublicPageDraft";
import PublicPageDraftPreview from "@/components/profile/PublicPageDraftPreview";
import PublicPagePublishedView from "@/components/profile/PublicPagePublishedView";
import PublicPageViewerStrip from "@/components/profile/PublicPageViewerStrip";
import FanThemButton from "@/components/identity/FanThemButton";

export interface FanPublicPageProps {
  slug: string;
  displayName: string;
  avatarUrl?: string | null;
  tier?: string;
  userId?: string;
  isLive?: boolean;
  liveRoomRoute?: string | null;
  /** True when the authenticated viewer owns this profile. */
  isOwner?: boolean;
  /** Current saved profile config (server-read). */
  profileConfig?: PublicProfileConfig;
  ownedStylePacks?: string[];
  /**
   * Owner-only in-memory draft. Omitted on the live /p route.
   * Never synthesized from PublicProfileConfig.
   */
  draftDocument?: PublicPageDocument | null;
  /** Read-only published document. Visitors never receive an owner draft here. */
  publishedPresentation?: DocumentPreviewPresentation | null;
}

const TABS = ["FEATURED", "PROFILE", "PLAYLISTS", "YOPHO", "ACTIVITY"] as const;
type Tab = typeof TABS[number];

function deriveFanBlocks({
  slug,
  displayName,
  avatarUrl,
  isLive,
  liveRoomRoute,
  userId,
}: FanPublicPageProps, ac: string): MediaBlock[] {
  const blocks: MediaBlock[] = [];

  if (isLive && liveRoomRoute) {
    blocks.push({
      id: "live",
      type: "LIVE_PREVIEW",
      isLive: true,
      liveRoomRoute,
      title: `${displayName}'s Fan Lobby`,
      featured: true,
    });
  }

  if (avatarUrl) {
    blocks.push({
      id: "avatar",
      type: "IMAGE",
      images: [{ url: avatarUrl, alt: displayName, shape: "circle", fit: "cover" }],
      title: "PROFILE",
    });
  }

  blocks.push({
    id: "playlist",
    type: "PLAYLIST",
    title: "PERSONAL PLAYLIST",
    href: `/playlists/${encodeURIComponent(slug)}`,
    subtitle: "Songs I love",
  });

  blocks.push({
    id: "yopho",
    type: "YOPHO",
    title: "YOPHO CARD",
    yophoCreateHref: `/yopho/card/${encodeURIComponent(slug)}`,
    accentColor: "#FF2DAA",
  });

  blocks.push({
    id: "memory",
    type: "MEMORY",
    title: "MEMORY WALL",
    href: `/memory/${encodeURIComponent(userId ?? slug)}`,
  });

  blocks.push({
    id: "magazine",
    type: "MAGAZINE",
    title: "MAGAZINE",
    href: "/magazine",
    subtitle: "Discover artists in the magazine",
    accentColor: "#FFD700",
  });

  return blocks;
}

const TIER_COLOR: Record<string, string> = {
  diamond: "#00FFFF",
  platinum: "#E5E4E2",
  gold: "#FFD700",
  silver: "#C0C0C0",
  ruby: "#FF2DAA",
  pro: "#AA2DFF",
  free: "#555",
};

function tierColor(tier: string): string {
  return TIER_COLOR[tier.toLowerCase()] ?? "#555";
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 3, height: 14, background: color, borderRadius: 2, display: "inline-block" }} />
      {label}
    </div>
  );
}

function ctaStyle(color: string, filled = false): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "9px 18px",
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textDecoration: "none",
    cursor: "pointer",
    background: filled ? color : `${color}14`,
    border: `1px solid ${color}55`,
    color: filled ? "#050510" : color,
  };
}

/** Public fan page — MySpace-style personal corner of the TMI world. */
export default function FanPublicPage({
  slug,
  displayName,
  avatarUrl,
  tier = "free",
  userId,
  isLive = false,
  liveRoomRoute,
  isOwner = false,
  profileConfig,
  ownedStylePacks = [],
  draftDocument = null,
  publishedPresentation = null,
}: FanPublicPageProps) {
  const [tab, setTab] = useState<Tab>("FEATURED");
  const [customizerOpen, setCustomizerOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("edit") === "1";
    }
    return false;
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState<PublicPageDocument | null>(draftDocument);
  const draftPreview = previewDraftDocument(ownerDraft, ["BASE"]);
  const draftHero = draftPreview.mode === "DOCUMENT_PREVIEW" ? draftPreview.hero : null;
  const draftMode = draftPreview.mode === "DOCUMENT_PREVIEW";
  const ac = tierColor(tier);
  const initial = displayName.charAt(0).toUpperCase();

  // Owner: live config from API; visitor: use server-passed config or defaults
  const { config: liveConfig, saveStatus, saveError, save } = useProfileConfig(
    isOwner ? (profileConfig ?? DEFAULT_PUBLIC_PROFILE_CONFIG) : undefined
  );
  const activeCfg = isOwner ? liveConfig : (profileConfig ?? DEFAULT_PUBLIC_PROFILE_CONFIG);

  // PAGE_WRITING now backed by canonical Content — personalWritings JSON was
  // structurally proven to have no persistence destination (see
  // ContentService.ts / schema.prisma). The four hardcoded
  // DEFAULT_PUBLIC_PROFILE_CONFIG.personalWritings samples are placeholder
  // copy only and must never render as if the owner authored them.
  const {
    writings: pageWritings,
    loading: pageWritingsLoading,
    handleUpdate: handlePageWritingUpdate,
  } = usePageWritingContent(
    isOwner ? { mode: "owner" } : { mode: "public", slug },
  );

  if (publishedPresentation?.mode === "DOCUMENT_PREVIEW") {
    return (
      <main data-testid="personal-public-page" style={{ minHeight: "100vh", width: "100%", background: "#050510", color: "#fff" }}>
        <PublicPageViewerStrip />
        <div data-testid="personal-page-actions" style={{ position: "fixed", top: 12, right: 12, zIndex: 40, display: "flex", gap: 8 }}>
          <Link href={`/messages/new?recipientId=${encodeURIComponent(userId ?? slug)}&name=${encodeURIComponent(displayName)}`} style={ctaStyle(ac)}>MESSAGE</Link>
          {!isOwner && userId ? <FanThemButton targetUserId={userId} returnPath={`/p/${encodeURIComponent(slug)}`} accent={ac} /> : null}
          <button type="button" data-testid="share-profile-btn" onClick={() => setShareModalOpen(true)} style={ctaStyle(ac)}>SHARE</button>
        </div>
        <div data-testid="personal-canvas-frame" style={{ width: "100%", maxWidth: "none" }}>
          <PublicPagePublishedView presentation={publishedPresentation} ownerUserId={userId} />
        </div>
        <ProfileShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          profileName={displayName}
          username={slug}
          role="FAN"
          accentColor={ac}
          heroImageUrl={activeCfg.hero?.imageUrl ?? avatarUrl ?? "/bot-images/Bot image 2.png"}
        />
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #06040e, #050310)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: 80,
      }}
    >
      {/* Breadcrumb nav */}
      <div style={{ padding: "12px 20px", display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em" }}>
        <Link href="/explore" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← EXPLORE</Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
        <span style={{ color: ac }}>{displayName}</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href={`/explore?profile=${slug}`}
            style={{
              color: "#00FFFF",
              textDecoration: "none",
              fontSize: 9,
              fontWeight: 800,
              background: "rgba(0,255,255,0.08)",
              border: "1px solid rgba(0,255,255,0.2)",
              padding: "4px 8px",
              borderRadius: 4,
            }}
          >
            EXPLORE SWIPE MODE ‹ ›
          </Link>
        </div>
      </div>

      {/* Hero stage — opening presentation can compact this shell. Identity stays the profile hero. */}
      <div
        data-testid="profile-opening"
        data-opening={publishedPresentation?.canvas?.opening ?? "KEEP"}
        style={publishedPresentation?.canvas?.opening === "COMPACT" ? { maxHeight: 220, overflow: "hidden" } : undefined}
      >
      <ProfileHeroBanner
        hero={
          draftHero
            ? {
                enabled: true,
                variant: "WIDE_CINEMATIC",
                headline: draftHero.headline,
                showNowPlaying: false,
                showLiveIndicator: false,
                showBio: false,
              }
            : activeCfg.hero
        }
        profileName={displayName}
        username={slug}
        roleType="FAN"
        tier={tier}
        accentColor={activeCfg.accentColor}
        isLive={isLive}
        liveRoomRoute={liveRoomRoute}
        isOwner={isOwner}
        onEditHero={() => setCustomizerOpen(true)}
        onShare={() => setShareModalOpen(true)}
        nowPlayingTrack={draftMode ? undefined : (activeCfg.soundtrack?.enabled ? activeCfg.soundtrack.title : undefined)}
        thoughtOfTheDay={draftMode ? undefined : (activeCfg.statusMessage ?? activeCfg.personalWritings?.find((w) => w.type === "THOUGHT_OF_DAY")?.body)}
      />
      </div>

      {/* Identity block — overlaps banner bottom */}
      <div style={{ maxWidth: TMI_CANVAS_MAX_WIDTH_PX, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", marginTop: -48, marginBottom: 20, flexWrap: "wrap" }}>
          {/* Avatar */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              overflow: "hidden",
              border: `3px solid ${ac}`,
              background: `linear-gradient(135deg, ${ac}22, rgba(5,3,16,0.95))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 900,
              color: ac,
              flexShrink: 0,
              boxShadow: `0 0 28px ${ac}33`,
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initial
            )}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 180, paddingBottom: 4 }}>
            <div style={{ marginBottom: 8 }}>
              <IdentityPlate roleType="FAN" tier={tier} accentColor={ac} isLive={isLive && !!liveRoomRoute} />
            </div>

            <h1 style={{ margin: "0 0 4px", fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, lineHeight: 1 }}>
              {displayName}
            </h1>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>@{slug}</div>
          </div>

          {/* Action bar */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 4 }}>
            {!isOwner && (
              <Link href={`/messages/new?recipientId=${encodeURIComponent(userId ?? slug)}&name=${encodeURIComponent(displayName)}`} style={ctaStyle(ac)}>
                MESSAGE
              </Link>
            )}
            {isLive && liveRoomRoute ? (
              <Link href={liveRoomRoute} style={ctaStyle("#E63000", true)}>JOIN LOBBY</Link>
            ) : null}
            <button
              type="button"
              data-testid="share-fan-profile-btn"
              onClick={() => setShareModalOpen(true)}
              style={ctaStyle(ac)}
            >
              🚀 SHARE PAGE
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={() => setCustomizerOpen(true)}
                style={{ ...ctaStyle("rgba(255,255,255,0.5)"), border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.06)" }}
              >
                ✏ CUSTOMIZE PAGE
              </button>
            )}
          </div>
        </div>

        {/* Profile Share Modal (Profile Share Law) */}
        <ProfileShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          profileName={displayName}
          username={slug}
          role="FAN"
          accentColor={ac}
          heroImageUrl={activeCfg.hero?.imageUrl ?? avatarUrl ?? "/bot-images/Bot image 2.png"}
          personalQuote={draftMode ? undefined : activeCfg.personalWritings?.find((w) => w.type === "HAPPY_DAY_QUOTE")?.body}
          nowPlayingTrack={draftMode ? undefined : (activeCfg.soundtrack?.enabled ? activeCfg.soundtrack.title : undefined)}
        />

        {/* Owner customizer overlay */}
        {isOwner && customizerOpen && (
          <ProfileCustomizer
            config={activeCfg}
            profileName={displayName}
            profileSlug={slug}
            profileRole="FAN"
            ownedPackIds={ownedStylePacks}
            accountTier={tier}
            onSave={async (next) => { await save(next); }}
            onClose={() => setCustomizerOpen(false)}
            saveStatus={saveStatus}
            saveError={saveError}
          />
        )}

        {publishedPresentation?.mode === "DOCUMENT_PREVIEW" ? (
          <PublicPagePublishedView presentation={publishedPresentation} ownerUserId={userId} />
        ) : ownerDraft ? (
          <PublicPageDraftPreview
            document={ownerDraft}
            authorizedCapabilities={["BASE"]}
            onDocumentChange={setOwnerDraft}
          />
        ) : null}

        {/* ── PROFILE SOUNDTRACK (MySpace Music Law) ── */}
        {ownerDraft ? null : (
        <ProfileSoundtrackPlayer
          soundtrack={activeCfg.soundtrack}
          ownerName={displayName}
          ownerSlug={slug}
          accentColor={ac}
          isOwner={isOwner}
          onEditSoundtrack={() => setCustomizerOpen(true)}
        />
        )}

        {/* ── WORDS & PERSONAL JOURNAL (Thought of the day, happy quotes) ── */}
        {isOwner && !pageWritingsLoading && (
          // See PerformerPublicPage.tsx — PersonalWritingWall only reads its
          // `writings` prop on first mount, so gate on loading rather than
          // passing [] and hoping a later prop change re-syncs it.
          <PersonalWritingWall
            writings={pageWritings}
            accentColor={ac}
            isOwner={isOwner}
            onUpdateWritings={(next) => {
              void handlePageWritingUpdate(next);
            }}
          />
        )}

        {/* Tab bar */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 0, overflowX: "auto", marginBottom: 28 }}>
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: "13px 20px",
                background: "none",
                border: "none",
                borderBottom: tab === t ? `2px solid ${ac}` : "2px solid transparent",
                color: tab === t ? ac : "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 900,
                cursor: "pointer",
                letterSpacing: "0.1em",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── FEATURED (media composer) ── */}
        {tab === "FEATURED" && (
          <PublicProfileMediaComposer
            blocks={[
              ...deriveFanBlocks({ slug, displayName, avatarUrl, tier, userId, isLive, liveRoomRoute }, ac),
              ...toContentMediaBlocks(pageWritings),
            ]}
            accentColor={ac}
            role="fan"
            ownerSlug={slug}
            ownerName={displayName}
          />
        )}

        {/* ── PROFILE tab ── */}
        {tab === "PROFILE" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr clamp(220px, 30%, 300px)", gap: 24, alignItems: "start" }}>
            <div>
              <SectionLabel label="ABOUT" color={ac} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontStyle: "italic", margin: "0 0 28px" }}>
                No bio yet.
              </p>

              <SectionLabel label="FAVORITE PERFORMERS" color={ac} />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                No performers followed yet.{" "}
                <Link href="/explore" style={{ color: ac, textDecoration: "none" }}>Explore artists →</Link>
              </p>

              <div style={{ marginTop: 32 }}>
                <SectionLabel label="COMMUNITY ACTIVITY" color={ac} />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>No public activity yet.</p>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Achievements */}
              <div style={{ padding: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
                <SectionLabel label="BADGES & ACHIEVEMENTS" color={ac} />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>No badges earned yet.</p>
              </div>

              {userId ? (
                <ArtistIdShareStrip userId={userId} displayName={displayName} role="fan" username={slug} />
              ) : null}
            </div>
          </div>
        )}

        {/* ── PLAYLISTS tab ── */}
        {tab === "PLAYLISTS" && (
          <div>
            <SectionLabel label="PUBLIC PLAYLISTS" color={ac} />
            <UniversalMediaPanel slug={slug} displayName={displayName} role="fan" accentColor={ac} />
          </div>
        )}

        {/* ── YOPHO tab ── */}
        {tab === "YOPHO" && (
          <div>
            <SectionLabel label="YOPHO SHOWCASE" color={ac} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: `1px dashed ${ac}33`, borderRadius: 14, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🃏</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                  No YoPho cards yet.
                </div>
                <Link
                  href={`/yopho/card/${encodeURIComponent(slug)}`}
                  style={{ display: "inline-block", marginTop: 12, fontSize: 10, fontWeight: 800, color: ac, textDecoration: "none" }}
                >
                  CREATE YOUR YOPHO CARD →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY tab ── */}
        {tab === "ACTIVITY" && (
          <div>
            <SectionLabel label="PUBLIC ACTIVITY" color={ac} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
              {[
                { label: "ROOMS ATTENDED", value: "0", color: ac },
                { label: "VOTES CAST", value: "0", color: "#FFD700" },
                { label: "ARTISTS FOLLOWED", value: "0", color: "#FF2DAA" },
                { label: "TIPS SENT", value: "0", color: "#00FF88" },
              ].map((s) => (
                <div key={s.label} style={{ padding: "16px", background: `${s.color}08`, border: `1px solid ${s.color}22`, borderRadius: 12 }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 20 }}>
              Activity data populates once the fan interacts on the platform.
            </p>
          </div>
        )}

        {/* Discovery rails — always shown */}
        <div style={{ marginTop: 40 }}>
          <DiscoveryRail type="performers" limit={6} accentColor={ac} label="DISCOVER PERFORMERS" />
          <DiscoveryRail type="articles" limit={4} accentColor="#FFD700" />
        </div>
      </div>
    </main>
  );
}
