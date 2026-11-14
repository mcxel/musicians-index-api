"use client";

import { useState } from "react";
import Link from "next/link";
import { getTierColor, type PerformerIdentity } from "@/lib/performers/PerformerRegistry";
import MotionPosterPlayer from "@/components/media/MotionPosterPlayer";
import ArtistIdShareStrip from "@/components/identity/ArtistIdShareStrip";
import DiscoveryRail from "@/components/discovery/DiscoveryRail";
import PublicProfileMediaComposer, { type MediaBlock } from "@/components/profile/PublicProfileMediaComposer";
import IdentityPlate, { type ProfileRoleType } from "@/components/profile/IdentityPlate";
import ProfileCustomizer from "@/components/profile/ProfileCustomizer";
import ProfileMediaPlayerShowcase from "@/components/profile/ProfileMediaPlayerShowcase";
import ProfileSoundtrackPlayer from "@/components/profile/ProfileSoundtrackPlayer";
import PersonalWritingWall from "@/components/profile/PersonalWritingWall";
import ProfileHeroBanner from "@/components/profile/ProfileHeroBanner";
import GroupMemberRoster from "@/components/profile/GroupMemberRoster";
import ProfileShareModal from "@/components/profile/ProfileShareModal";
import { DEFAULT_PUBLIC_PROFILE_CONFIG, type PublicProfileConfig, type GroupProfileMetadata } from "@/lib/profile/PublicProfileStyleEngine";
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

export interface PerformerPublicPageProps {
  performer: PerformerIdentity;
  /** True when the authenticated viewer owns this profile. */
  isOwner?: boolean;
  /** Authenticated owner id from the server session. Not a client-selected owner. */
  ownerUserId?: string;
  /** Account id for FAN THEM. Present for visitors. Not an editing grant. */
  profileUserId?: string;
  /** Current saved profile config (server-read). Defaults to canonical defaults. */
  profileConfig?: PublicProfileConfig;
  /** Style pack ids the owner currently owns. */
  ownedStylePacks?: string[];
  /** Owner-only in-memory draft. The live /p route does not pass this. */
  draftDocument?: PublicPageDocument | null;
  /** Read-only published document. Visitors never receive an owner draft here. */
  publishedPresentation?: DocumentPreviewPresentation | null;
}

const TABS = ["FEATURED", "ABOUT", "MUSIC", "EVENTS", "MAGAZINE", "MERCH"] as const;
type Tab = typeof TABS[number];

function derivePerformerBlocks(p: PerformerIdentity, ac: string): MediaBlock[] {
  const blocks: MediaBlock[] = [];

  if (p.isLive) {
    blocks.push({
      id: "live",
      type: "LIVE_PREVIEW",
      isLive: true,
      liveRoomRoute: p.liveRoomRoute,
      title: `${p.name}'s Live Session`,
      viewerCount: p.audienceCount,
      featured: true,
    });
  }

  if (p.introVideoUrl) {
    blocks.push({ id: "intro-video", type: "VIDEO", videoUrl: p.introVideoUrl, title: "VIDEO" });
  }

  const galleryImages = [
    p.profileImageUrl ? { url: p.profileImageUrl, alt: p.name } : null,
    p.coverImageUrl && p.coverImageUrl !== p.profileImageUrl
      ? { url: p.coverImageUrl, alt: `${p.name} cover` }
      : null,
    p.motionPosterUrl && p.motionPosterUrl !== p.profileImageUrl
      ? { url: p.motionPosterUrl, alt: `${p.name} motion poster` }
      : null,
  ].filter((x): x is { url: string; alt: string } => x !== null);

  if (galleryImages.length > 1) {
    blocks.push({
      id: "gallery",
      type: "GALLERY",
      images: galleryImages,
      galleryLayout: galleryImages.length === 2 ? "2-UP" : "3-UP_FEATURE",
      title: "PHOTOS",
    });
  } else if (galleryImages.length === 1 && !p.introVideoUrl) {
    blocks.push({ id: "hero-image", type: "IMAGE", images: galleryImages, title: "PHOTO" });
  }

  const firstSong = p.songs?.[0];
  if (firstSong) {
    blocks.push({
      id: "featured-track",
      type: "TRACK",
      trackTitle: firstSong.title,
      trackArtist: p.name,
      trackDurationSec: firstSong.durationSec,
      trackAudioUrl: firstSong.audioUrl,
      trackCoverUrl: firstSong.coverUrl,
      trackStreamingLinks: firstSong.streamingLinks as MediaBlock["trackStreamingLinks"],
      title: "FEATURED TRACK",
    });
  }

  blocks.push({
    id: "magazine",
    type: "MAGAZINE",
    title: "MAGAZINE FEATURE",
    href: `/magazine?performer=${encodeURIComponent(p.slug)}`,
    accentColor: "#FFD700",
  });

  if ((p.merch?.length ?? 0) > 0) {
    blocks.push({
      id: "merch",
      type: "MERCH",
      merch: p.merch!.map((m) => ({
        name: m.name,
        price: `$${m.price}`,
        imageUrl: m.imageUrl,
        purchaseUrl: m.purchaseUrl,
      })),
      title: "MERCH & SERVICES",
      accentColor: "#AA2DFF",
    });
  }

  return blocks;
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
  const isRgba = color.startsWith("rgba");
  return {
    display: "inline-block",
    padding: "9px 18px",
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: "0.08em",
    textDecoration: "none",
    cursor: "pointer",
    background: filled ? color : `${isRgba ? "rgba(255,255,255,0.07)" : `${color}14`}`,
    border: `1px solid ${isRgba ? "rgba(255,255,255,0.2)" : `${color}55`}`,
    color: filled ? "#050510" : (isRgba ? "rgba(255,255,255,0.6)" : color),
  };
}

/** Public performer page — reads PerformerRegistry; no duplicate profile system. */
function derivePlateRole(category: string): ProfileRoleType {
  const c = category.toLowerCase();
  if (c.includes("dj")) return "DJ";
  if (c.includes("producer")) return "PRODUCER";
  if (c.includes("band") || c.includes("group")) return "BAND";
  if (c.includes("comedian") || c.includes("comedy")) return "COMEDIAN";
  if (c.includes("dancer") || c.includes("dance")) return "DANCER";
  return "PERFORMER";
}

export default function PerformerPublicPage({ performer: p, isOwner = false, ownerUserId, profileUserId, profileConfig, ownedStylePacks = [], draftDocument = null, publishedPresentation = null }: PerformerPublicPageProps) {
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
  const ac = getTierColor(p.tier);
  const plateRole = derivePlateRole(p.category);

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
    isOwner ? { mode: "owner" } : { mode: "public", slug: p.slug },
  );

  const isGroup = p.lineupType === "band" || p.lineupType === "group" || Boolean(activeCfg.groupMetadata);
  const effectiveGroupMetadata: GroupProfileMetadata | undefined =
    activeCfg.groupMetadata ??
    (isGroup
      ? {
          groupName: p.name,
          formationYear: "2024",
          genre: p.category,
          originCity: p.city,
          originCountry: p.countryName,
          members: [
            { id: "m1", name: "Jordan Cole", role: "Lead Vocals & Synth", publicProfileSlug: "jordan-cole", avatarUrl: "/tmi-curated/mag-20.jpg" },
            { id: "m2", name: "Elena Cruz", role: "Bass & Backing Vocals", avatarUrl: "/tmi-curated/mag-28.jpg" },
            { id: "m3", name: "Darius Vance", role: "Drums & Live Percussion", avatarUrl: "/tmi-curated/mag-35.jpg" },
            { id: "m4", name: "Samira Kai", role: "Lead Guitar & Production", avatarUrl: "/tmi-curated/mag-50.jpg" },
          ],
          tourDates: [
            { id: "t1", date: "OCT 12", city: "Chicago, IL", venue: "Metro Hall", ticketUrl: "/tickets/night-signals-chicago" },
            { id: "t2", date: "OCT 19", city: "Detroit, MI", venue: "The Majestic", ticketUrl: "/tickets/night-signals-detroit" },
            { id: "t3", date: "NOV 02", city: "Toronto, ON", venue: "Danforth Music Hall", ticketUrl: "/tickets/night-signals-toronto" },
          ],
        }
      : undefined);

  if (publishedPresentation?.mode === "DOCUMENT_PREVIEW") {
    return (
      <main data-testid="personal-public-page" style={{ minHeight: "100vh", width: "100%", background: "#050510", color: "#fff" }}>
        <PublicPageViewerStrip />
        <div data-testid="personal-page-actions" style={{ position: "fixed", top: 12, right: 12, zIndex: 40, display: "flex", gap: 8 }}>
          <Link href={`/messages/new?recipientId=${encodeURIComponent(p.slug)}&name=${encodeURIComponent(p.name)}`} style={ctaStyle(ac)}>MESSAGE</Link>
          {!isOwner && profileUserId ? <FanThemButton targetUserId={profileUserId} returnPath={`/p/${encodeURIComponent(p.slug)}`} accent={ac} /> : null}
          <button type="button" data-testid="share-profile-btn" onClick={() => setShareModalOpen(true)} style={ctaStyle(ac)}>SHARE</button>
        </div>
        <div data-testid="personal-canvas-frame" style={{ width: "100%", maxWidth: "none" }}>
          <PublicPagePublishedView presentation={publishedPresentation} ownerUserId={ownerUserId ?? profileUserId} />
        </div>
        <ProfileShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          profileName={p.name}
          username={p.slug}
          role={isGroup ? "BAND" : "PERFORMER"}
          accentColor={ac}
          heroImageUrl={activeCfg.hero?.imageUrl ?? p.profileImageUrl}
        />
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a0614, #050310)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Breadcrumb nav */}
      <div
        style={{
          padding: "12px 20px",
          display: "flex",
          gap: 8,
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.12em",
        }}
      >
        <Link href="/explore" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← EXPLORE</Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
        <span style={{ color: ac }}>{p.name}</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href={`/explore?profile=${p.slug}`}
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
        profileName={p.name}
        username={p.slug}
        roleType={isGroup ? "GROUP" : "PERFORMER"}
        tier={p.tier}
        accentColor={activeCfg.accentColor}
        isLive={p.isLive}
        liveRoomRoute={p.liveRoomRoute}
        rank={p.rank}
        location={`${p.city}, ${p.countryName} ${p.flag}`}
        isOwner={isOwner}
        onEditHero={() => setCustomizerOpen(true)}
        onShare={() => setShareModalOpen(true)}
        nowPlayingTrack={draftMode ? undefined : (activeCfg.soundtrack?.enabled ? activeCfg.soundtrack.title : undefined)}
        thoughtOfTheDay={draftMode ? undefined : (activeCfg.statusMessage ?? activeCfg.personalWritings?.find((w) => w.type === "THOUGHT_OF_DAY")?.body)}
      />
      </div>

      {/* Identity + Action bar container */}
      <div style={{ maxWidth: TMI_CANVAS_MAX_WIDTH_PX, margin: "0 auto", padding: "18px 24px 10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <IdentityPlate
              roleType={plateRole}
              tier={p.tier}
              accentColor={ac}
              isLive={p.isLive}
            />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
              {p.fanCount.toLocaleString()} fans · {p.likes.toLocaleString()} likes
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {p.isLive ? (
              <Link href={p.liveRoomRoute} style={ctaStyle("#E63000", true)}>🔴 WATCH LIVE</Link>
            ) : null}
            {!isOwner && (
              <Link href={`/messages/new?recipientId=${encodeURIComponent(p.slug)}&name=${encodeURIComponent(p.name)}`} style={ctaStyle(ac)}>
                MESSAGE
              </Link>
            )}
            {!isOwner && <Link href={`/tips?to=${encodeURIComponent(p.slug)}`} style={ctaStyle("#FFD700")}>TIP</Link>}
            {!isOwner && <Link href={`/booking?performer=${encodeURIComponent(p.slug)}`} style={ctaStyle("#00FF88")}>BOOK</Link>}
            {!isOwner && profileUserId ? <FanThemButton targetUserId={profileUserId} returnPath={`/p/${encodeURIComponent(p.slug)}`} accent={ac} /> : null}
            <Link href={`/yopho/card/${encodeURIComponent(p.slug)}`} style={ctaStyle("#00FFFF")}>YOPHO</Link>
            <button
              type="button"
              data-testid="share-profile-btn"
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
      </div>

      {/* Profile Share Modal (Profile Share Law) */}
      <ProfileShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        profileName={p.name}
        username={p.slug}
        role={isGroup ? "BAND" : "PERFORMER"}
        accentColor={ac}
        heroImageUrl={activeCfg.hero?.imageUrl ?? p.profileImageUrl}
        personalQuote={draftMode ? undefined : activeCfg.personalWritings?.find((w) => w.type === "HAPPY_DAY_QUOTE")?.body}
        nowPlayingTrack={draftMode ? undefined : (activeCfg.soundtrack?.enabled ? activeCfg.soundtrack.title : undefined)}
      />

      {/* Owner customizer overlay */}
      {isOwner && customizerOpen && (
        <ProfileCustomizer
          config={activeCfg}
          profileName={p.name}
          profileSlug={p.slug}
          profileRole="PERFORMER"
          ownedPackIds={ownedStylePacks}
          accountTier={p.tier}
          onSave={async (next) => { await save(next); }}
          onClose={() => setCustomizerOpen(false)}
          saveStatus={saveStatus}
          saveError={saveError}
        />
      )}

      {/* Section tab bar */}
      {(() => {
        const isMusicEnabled =
          !activeCfg.visibleModules ||
          activeCfg.visibleModules.includes("FEATURED_TRACK") ||
          activeCfg.visibleModules.includes("PLAYLIST");
        const filteredTabs = TABS.filter((t) => t !== "MUSIC" || isMusicEnabled);

        return (
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 20px", display: "flex", gap: 0, overflowX: "auto" }}>
            {filteredTabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  padding: "14px 20px",
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
        );
      })()}

      {/* Tab content */}
      <div style={{ maxWidth: TMI_CANVAS_MAX_WIDTH_PX, margin: "0 auto", padding: "28px 20px 96px" }}>

        {publishedPresentation?.mode === "DOCUMENT_PREVIEW" ? (
          <PublicPagePublishedView presentation={publishedPresentation} ownerUserId={ownerUserId ?? profileUserId} />
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
          ownerName={p.name}
          ownerSlug={p.slug}
          accentColor={ac}
          isOwner={isOwner}
          onEditSoundtrack={() => setCustomizerOpen(true)}
        />
        )}

        {/* ── WORDS & PERSONAL JOURNAL (owner editing surface only — public
             rendering of this same canonical Content now goes through
             PublicProfileMediaComposer's CONTENT block below, the one
             canonical public-render path, per the composition-reference
             closure of the Content foundation slice) ── */}
        {isOwner && !pageWritingsLoading && (
          // PersonalWritingWall seeds its internal state from `writings`
          // only on first mount and never re-syncs a later prop change —
          // gating on the fetch's loading state (rather than passing [] and
          // letting the real data arrive post-mount) ensures its FIRST
          // render already has the real, canonical data.
          <PersonalWritingWall
            writings={pageWritings}
            accentColor={ac}
            isOwner={isOwner}
            onUpdateWritings={(next) => {
              void handlePageWritingUpdate(next);
            }}
          />
        )}

        {/* ── GROUP / BAND ROSTER (Group/Band Profile Law) ── */}
        {effectiveGroupMetadata && (
          <GroupMemberRoster
            metadata={effectiveGroupMetadata}
            accentColor={ac}
            isOwner={isOwner}
            onEditRoster={() => setCustomizerOpen(true)}
          />
        )}

        {/* ── MAGAZINE FEATURE TEASER (Strict Separation Law) ── */}
        {p.articleIds && p.articleIds.length > 0 && (
          <section
            data-testid="performer-magazine-feature-teaser"
            style={{
              margin: "0 0 28px 0",
              background: "linear-gradient(135deg, rgba(255,215,0,0.06), rgba(170,45,255,0.06))",
              border: "1px solid rgba(255,215,0,0.25)",
              borderRadius: 12,
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#FFD700", marginBottom: 6 }}>
                ★ FEATURED IN TMI MAGAZINE
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                {p.name} Talks Cyphers, Fans, and the Power of Sound
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                Read the full cover-story editorial and backstage interview in TMI Magazine Issue 1.
              </div>
            </div>
            <Link
              href={`/magazine/issue/current?article=${p.articleIds[0]}`}
              style={{
                background: "#FFD700",
                color: "#050510",
                padding: "9px 20px",
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.1em",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <span>READ MAGAZINE ARTICLE</span>
              <span>→</span>
            </Link>
          </section>
        )}

        {/* ── FEATURED (media composer) ── */}
        {tab === "FEATURED" && (
          <>
            <ProfileMediaPlayerShowcase ownerSlug={p.slug} accentColor={ac} />
            <PublicProfileMediaComposer
              blocks={[...derivePerformerBlocks(p, ac), ...toContentMediaBlocks(pageWritings)]}
              accentColor={ac}
              role="performer"
              ownerSlug={p.slug}
              ownerName={p.name}
            />
          </>
        )}

        {/* ── ABOUT ── */}
        {tab === "ABOUT" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr clamp(220px, 30%, 320px)", gap: 24, alignItems: "start" }}>
            <div>
              <SectionLabel label="ABOUT" color={ac} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, margin: "0 0 28px", maxWidth: 560 }}>
                {p.bio ?? "No bio yet."}
              </p>

              {(p.songs?.length ?? 0) > 0 ? (
                <>
                  <SectionLabel label="FEATURED TRACKS" color={ac} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {p.songs!.slice(0, 5).map((s, i) => {
                      const playHref = s.audioUrl ?? s.streamingLinks?.spotify ?? s.streamingLinks?.youtube;
                      return (
                        <div
                          key={s.title}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}
                        >
                          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", minWidth: 22, textAlign: "right" }}>{i + 1}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{s.title}</div>
                            {s.streams != null && (
                              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.streams.toLocaleString()} streams</div>
                            )}
                          </div>
                          {playHref ? (
                            <Link href={playHref} style={{ fontSize: 9, fontWeight: 900, color: ac, textDecoration: "none", padding: "5px 12px", border: `1px solid ${ac}44`, borderRadius: 6 }}>
                              ▶ PLAY
                            </Link>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>No catalog uploaded yet.</p>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
                <SectionLabel label="STATS" color={ac} />
                {[
                  { label: "Rank", value: `#${p.rank}`, color: "#FFD700" },
                  { label: "XP", value: p.xp.toLocaleString(), color: ac },
                  { label: "Fans", value: p.fanCount.toLocaleString(), color: "#FF2DAA" },
                  { label: "Likes", value: p.likes.toLocaleString(), color: "#00FF88" },
                ].map((stat) => (
                  <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{stat.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 900, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: "18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
                <SectionLabel label="BOOKING" color="#00FF88" />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: "0 0 12px" }}>
                  Available for shows, features, and collaborations.
                </p>
                <Link href={`/booking?performer=${encodeURIComponent(p.slug)}`} style={{ ...ctaStyle("#00FF88", true), display: "block", textAlign: "center" }}>
                  BOOK THIS ARTIST
                </Link>
              </div>

              <ArtistIdShareStrip userId={p.slug} displayName={p.name} role="performer" artistSlug={p.slug} />
            </div>
          </div>
        )}

        {/* ── MUSIC ── */}
        {tab === "MUSIC" && (
          <div>
            <SectionLabel label="MUSIC & MEDIA" color={ac} />
            {(p.songs?.length ?? 0) > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.songs!.map((s, i) => {
                  const links = s.streamingLinks ?? {};
                  const playHref = s.audioUrl ?? links.spotify ?? links.youtube ?? links.soundcloud;
                  return (
                    <div
                      key={s.title}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.2)", minWidth: 26, textAlign: "right" }}>{i + 1}</span>
                      {s.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.coverUrl} alt={s.title} style={{ width: 42, height: 42, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 42, height: 42, borderRadius: 6, background: `${ac}22`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎵</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                        {s.streams != null && (
                          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.streams.toLocaleString()} streams</div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        {playHref ? (
                          <Link href={playHref} style={ctaStyle(ac)}>▶ PLAY</Link>
                        ) : null}
                        {links.spotify ? <Link href={links.spotify} style={{ fontSize: 9, color: "#1DB954", fontWeight: 800, textDecoration: "none" }}>SPOTIFY</Link> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>No music uploaded yet.</p>
            )}
          </div>
        )}

        {/* ── EVENTS ── */}
        {tab === "EVENTS" && (
          <div>
            <SectionLabel label="LIVE & UPCOMING" color={ac} />
            {p.isLive ? (
              <Link
                href={p.liveRoomRoute}
                style={{ display: "flex", gap: 16, padding: "18px 20px", background: "rgba(230,48,0,0.1)", border: "2px solid rgba(230,48,0,0.4)", borderRadius: 14, textDecoration: "none", marginBottom: 20 }}
              >
                <span style={{ fontSize: 32, flexShrink: 0 }}>🔴</span>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: "#E63000", letterSpacing: "0.14em" }}>LIVE RIGHT NOW</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginTop: 4 }}>Join {p.name}'s live room</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                    {p.audienceCount.toLocaleString()} watching · Started {p.timeLive}
                  </div>
                </div>
              </Link>
            ) : null}
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {p.isLive ? "Other upcoming events:" : "No upcoming events scheduled."}{" "}
              Follow {p.name} to get notified of their next live session.
            </p>
            <div style={{ marginTop: 20 }}>
              <DiscoveryRail type="liveRooms" limit={6} accentColor={ac} enableLiveStatus />
            </div>
          </div>
        )}

        {/* ── MAGAZINE ── */}
        {tab === "MAGAZINE" && (
          <div>
            <SectionLabel label="FEATURED IN THE MUSICIANS INDEX" color="#FFD700" />
            <DiscoveryRail type="articles" tags={[p.category]} limit={6} accentColor="#FFD700" />
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
              <Link
                href={`/magazine?performer=${encodeURIComponent(p.slug)}`}
                style={{ fontSize: 11, fontWeight: 800, color: "#FFD700", textDecoration: "none", letterSpacing: "0.12em" }}
              >
                SEE ALL FEATURES IN THE MAGAZINE →
              </Link>
            </div>
          </div>
        )}

        {/* ── MERCH ── */}
        {tab === "MERCH" && (
          <div>
            <SectionLabel label="MERCH & SERVICES" color="#AA2DFF" />
            {(p.merch?.length ?? 0) > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                {p.merch!.map((m) => (
                  <a
                    key={m.name}
                    href={m.purchaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "block", padding: "16px", background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 12, textDecoration: "none" }}
                  >
                    {m.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.imageUrl} alt={m.name} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />
                    ) : (
                      <div style={{ width: "100%", height: 80, borderRadius: 8, background: "rgba(170,45,255,0.15)", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🛍️</div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{m.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#AA2DFF", marginTop: 4 }}>${m.price}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#AA2DFF", marginTop: 8, letterSpacing: "0.1em" }}>BUY NOW →</div>
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>No merch available yet.</p>
            )}
          </div>
        )}

        {/* Discovery rails — always shown */}
        <div style={{ marginTop: 40 }}>
          <DiscoveryRail type="performers" exclude={p.slug} limit={6} accentColor={ac} label="MORE PERFORMERS" />
        </div>
      </div>
    </main>
  );
}
