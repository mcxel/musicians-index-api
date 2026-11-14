"use client";

/**
 * PerformerBioMagazineDrawer — Phase 1 foundation.
 * Tabs: Profile · Biography · Magazine Article · Gallery · Music · Interviews · Store & Commerce
 * Footer: Save · Preview Article
 * Data: PerformerRegistry + /api/profile/update + interview-requests stub + CommerceConnectorRegistry.
 * No Zoom studio / AI rewrite / press kit (deferred).
 * Commerce is performer-only (Rule 26); no ticket inventory creation (Rule 17).
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  getPerformerById,
  getPerformerBySlug,
  PERFORMER_REGISTRY,
  type PerformerIdentity,
  type PerformerSong,
  type PerformerTier,
} from "@/lib/performers/PerformerRegistry";
import {
  getGallerySlotLabel,
  getPerformerGallerySlotCount,
} from "@/lib/performers/performerGallerySlots";
import { findPerformerMagazineArticle, MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
import { magazineReaderArticleUrl } from "@/lib/magazine/MagazineReaderRoutes";
import { QRCodeSVG } from "qrcode.react";
import CommerceConnectorPanel from "@/components/commerce/CommerceConnectorPanel";
import ListenOwnTrackCard from "@/components/commerce/ListenOwnTrackCard";
import {
  getLivingCatalogForPerformer,
  HYBRID_ECONOMICS_COPY,
} from "@/lib/commerce/LivingCatalog";
import { listTitlesForHolder, listChampionshipTitles } from "@/lib/championship";
import ChampionshipChallengeCard from "@/components/championship/ChampionshipChallengeCard";
import { getChampionVisualIdentity, championCardStyle } from "@/lib/championship/championVisualIdentity";

type TabId =
  | "profile"
  | "biography"
  | "magazine"
  | "gallery"
  | "music"
  | "interviews"
  | "commerce";

export const PERFORMER_BIO_MAGAZINE_TAB_EVENT = "tmi:performer-bio-magazine-open-tab";

const TABS: { id: TabId; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "biography", label: "Biography" },
  { id: "magazine", label: "Magazine Article" },
  { id: "gallery", label: "Gallery" },
  { id: "music", label: "Music" },
  { id: "interviews", label: "Interviews" },
  { id: "commerce", label: "Store & Commerce" },
];

interface InterviewRow {
  id: string;
  performerSlug: string;
  requesterName: string;
  requesterRole: string;
  note: string;
  status: string;
  createdAt: string;
}

export interface PerformerBioMagazineDrawerProps {
  /** Registry slug when known (article page). */
  performerSlug?: string;
  /** Session user id — used to resolve registry row via getPerformerById. */
  userId?: string;
  /** Fallback display name for slug resolution / session draft. */
  displayName?: string;
  accentColor?: string;
  /** When false, hide writer "Request Interview" (owner/admin management view). */
  showRequestInterview?: boolean;
  onPreview?: () => void;
  /** Open first-class Creator Commerce Center drawer (Living OS). */
  onOpenCommerceCenter?: () => void;
  /** Optional initial tab for quick-link launches inside Command Center. */
  initialTab?: TabId;
}

function isTabId(value: unknown): value is TabId {
  return value === "profile"
    || value === "biography"
    || value === "magazine"
    || value === "gallery"
    || value === "music"
    || value === "interviews"
    || value === "commerce";
}

function resolveRegistryPerformer(
  slug?: string,
  userId?: string,
  displayName?: string,
): PerformerIdentity | null {
  if (slug) {
    const bySlug = getPerformerBySlug(slug);
    if (bySlug) return bySlug;
  }
  if (userId) {
    const byId = getPerformerById(userId);
    if (byId) return byId;
    const byUserSlug = getPerformerBySlug(userId);
    if (byUserSlug) return byUserSlug;
  }
  if (displayName) {
    const name = displayName.trim().toLowerCase();
    const byName = PERFORMER_REGISTRY.find(
      (p) => p.name.toLowerCase() === name || p.slug === name.replace(/\s+/g, "-"),
    );
    if (byName) return byName;
  }
  return null;
}

function galleryDraftKey(slug: string) {
  return `tmi_bio_magazine_gallery_${slug}`;
}

function readGalleryDraft(slug: string, slotCount: number): string[] {
  if (typeof window === "undefined") return Array(slotCount).fill("");
  try {
    const raw = localStorage.getItem(galleryDraftKey(slug));
    if (!raw) return Array(slotCount).fill("");
    const parsed = JSON.parse(raw) as string[];
    const next = Array(slotCount).fill("") as string[];
    for (let i = 0; i < slotCount; i++) next[i] = parsed[i] ?? "";
    return next;
  } catch {
    return Array(slotCount).fill("");
  }
}

function writeGalleryDraft(slug: string, urls: string[]) {
  try {
    localStorage.setItem(galleryDraftKey(slug), JSON.stringify(urls));
  } catch {
    /* ignore quota */
  }
}

const fieldStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  fontSize: 12,
  fontFamily: "inherit",
};

const labelStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.45)",
  marginBottom: 4,
  display: "block",
};

export default function PerformerBioMagazineDrawer({
  performerSlug,
  userId,
  displayName,
  accentColor = "#00FFFF",
  showRequestInterview = false,
  onPreview,
  onOpenCommerceCenter,
  initialTab,
}: PerformerBioMagazineDrawerProps) {
  const registryPerformer = useMemo(
    () => resolveRegistryPerformer(performerSlug, userId, displayName),
    [performerSlug, userId, displayName],
  );

  const [sessionSlug, setSessionSlug] = useState(
    performerSlug || registryPerformer?.slug || userId || "session",
  );
  const [tier, setTier] = useState<PerformerTier | string>(registryPerformer?.tier ?? "FREE");
  const [tab, setTab] = useState<TabId>(initialTab && isTabId(initialTab) ? initialTab : "profile");
  const [articleQrOrigin, setArticleQrOrigin] = useState<string | null>(null);
  const [stageName, setStageName] = useState(
    registryPerformer?.name ?? displayName ?? "",
  );
  const [location, setLocation] = useState(
    registryPerformer ? `${registryPerformer.city}, ${registryPerformer.countryName}` : "",
  );
  const [genres, setGenres] = useState(
    registryPerformer?.category ?? "",
  );
  const [bio, setBio] = useState(registryPerformer?.bio ?? "");
  const bioEpochRef = useRef(0);
  const bioDirtyRef = useRef(false);
  const applyAuthoritativeBio = (value: string, epoch: number) => {
    if (bioDirtyRef.current || bioEpochRef.current !== epoch) return;
    setBio(value);
  };
  const [songLinks, setSongLinks] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [saving, setSaving] = useState(false);
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [interviewNote, setInterviewNote] = useState("");
  const [interviewSubmitting, setInterviewSubmitting] = useState(false);
  const [rankLabel, setRankLabel] = useState(
    registryPerformer ? `#${registryPerformer.rank}` : "—",
  );

  // Living Article (CLAUDE.md Rule 36: ONE PERFORMER -> ONE LIVING ARTICLE).
  // Independent load/save cycle from the Biography/Profile saveAll() below —
  // this is a separate authoring surface, not the same save action.
  const [articleTitle, setArticleTitle] = useState("");
  const [articleSubtitle, setArticleSubtitle] = useState("");
  const [articleBody, setArticleBody] = useState("");
  const [articleHeroUrl, setArticleHeroUrl] = useState("");
  const [articleStatus, setArticleStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED" | null>(null);
  const [articleLoadState, setArticleLoadState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [articleSaveState, setArticleSaveState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const customHeroFileRef = useRef<HTMLInputElement>(null);

  const effectiveSlug = registryPerformer?.slug ?? sessionSlug;
  const slotCount = getPerformerGallerySlotCount(tier);
  const articleHref = `/articles/performer/${effectiveSlug}`;
  const magazineArticles = useMemo(
    () => MAGAZINE_ISSUE_1.filter((a) => a.performerSlug === effectiveSlug),
    [effectiveSlug],
  );
  const magazineSpreadHref = useMemo(() => {
    const article = findPerformerMagazineArticle(effectiveSlug);
    return article ? magazineReaderArticleUrl(article.slug) : null;
  }, [effectiveSlug]);
  const songs: PerformerSong[] = registryPerformer?.songs ?? [];

  useEffect(() => {
    if (initialTab && isTabId(initialTab)) {
      setTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const queued = (window as Window & { __TMI_BIO_MAGAZINE_TAB__?: string }).__TMI_BIO_MAGAZINE_TAB__;
    if (isTabId(queued)) {
      setTab(queued);
      delete (window as Window & { __TMI_BIO_MAGAZINE_TAB__?: string }).__TMI_BIO_MAGAZINE_TAB__;
    }
    const onOpenTab = (event: Event) => {
      const detail = (event as CustomEvent<{ tab?: unknown }>).detail;
      const nextTab = detail?.tab;
      if (isTabId(nextTab)) setTab(nextTab);
    };
    window.addEventListener(PERFORMER_BIO_MAGAZINE_TAB_EVENT, onOpenTab);
    return () => window.removeEventListener(PERFORMER_BIO_MAGAZINE_TAB_EVENT, onOpenTab);
  }, []);

  useEffect(() => {
    const epoch = bioEpochRef.current;
    let active = true;
    if (registryPerformer) {
      setSessionSlug(registryPerformer.slug);
      setTier(registryPerformer.tier);
      setStageName(registryPerformer.name);
      setLocation(`${registryPerformer.city}, ${registryPerformer.countryName}`);
      setGenres(registryPerformer.category);
      applyAuthoritativeBio(registryPerformer.bio ?? "", epoch);
      setRankLabel(`#${registryPerformer.rank}`);
      const links = (registryPerformer.songs ?? [])
        .map((s) => s.audioUrl || s.title)
        .filter(Boolean)
        .join("\n");
      setSongLinks(links);
      const draft = readGalleryDraft(registryPerformer.slug, slotCount);
      if (!draft[0] && registryPerformer.coverImageUrl) draft[0] = registryPerformer.coverImageUrl;
      if (!draft[0] && registryPerformer.profileImageUrl) draft[0] = registryPerformer.profileImageUrl;
      setGalleryUrls(draft);
      void fetch("/api/profile/self", { credentials: "include", cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { profile?: { bio?: string | null } } | null) => {
          if (active && data?.profile) applyAuthoritativeBio(data.profile.bio ?? "", epoch);
        })
        .catch(() => {
          // Keep the registry bio if the authoritative profile read is unavailable.
        });
      return () => {
        active = false;
      };
    }

    fetch("/api/profile/self", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: {
        profile?: {
          stageName?: string | null;
          displayName?: string | null;
          bio?: string | null;
          genres?: string[];
          tier?: string | null;
          bannerUrl?: string | null;
          avatarUrl?: string | null;
        };
      } | null) => {
        if (!active || !data?.profile) return;
        const p = data.profile;
        const name = p.stageName || p.displayName || displayName || "Performer";
        setStageName(name);
        applyAuthoritativeBio(p.bio ?? "", epoch);
        setGenres((p.genres ?? []).join(", "));
        if (p.tier) setTier(p.tier);
        const slugGuess =
          performerSlug ||
          name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
          userId ||
          "session";
        setSessionSlug(slugGuess);
        const slots = getPerformerGallerySlotCount(p.tier ?? "FREE");
        const draft = readGalleryDraft(slugGuess, slots);
        if (!draft[0] && p.bannerUrl) draft[0] = p.bannerUrl;
        if (!draft[0] && p.avatarUrl) draft[0] = p.avatarUrl;
        setGalleryUrls(draft);
        setRankLabel("session");
      })
      .catch(() => {
        /* honest empty — keep draft fields */
      });
    return () => {
      active = false;
    };
  }, [registryPerformer, performerSlug, userId, displayName, slotCount]);

  useEffect(() => {
    let active = true;
    fetch("/api/articles/performer-draft", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { article?: { title: string; subtitle: string | null; content: { body?: string; heroImageUrl?: string | null }; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" } | null } | null) => {
        if (!active) return;
        if (data?.article) {
          setArticleTitle(data.article.title);
          setArticleSubtitle(data.article.subtitle ?? "");
          setArticleBody(data.article.content?.body ?? "");
          setArticleHeroUrl(data.article.content?.heroImageUrl ?? "");
          setArticleStatus(data.article.status);
        }
        setArticleLoadState("ready");
      })
      .catch(() => {
        if (active) setArticleLoadState("unavailable");
      });
    return () => {
      active = false;
    };
  }, []);

  const insertArticleSnippet = (prefix: string, placeholder: string, suffix = "") => {
    setArticleBody((prev) => (prev ? `${prev}\n\n${prefix}${placeholder}${suffix}` : `${prefix}${placeholder}${suffix}`));
  };

  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setArticleHeroUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveArticle = useCallback(async () => {
    if (!articleTitle.trim()) {
      setArticleSaveState("failed");
      return;
    }
    setArticleSaveState("saving");
    try {
      const res = await fetch("/api/articles/performer-draft", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: articleTitle,
          subtitle: articleSubtitle,
          body: articleBody,
          heroImageUrl: articleHeroUrl || null,
        }),
      });
      if (!res.ok) {
        setArticleSaveState("failed");
        return;
      }
      const data = (await res.json()) as { article?: { status: "DRAFT" | "PUBLISHED" | "ARCHIVED" } };
      if (data.article) setArticleStatus(data.article.status);
      setArticleSaveState("saved");
    } catch {
      setArticleSaveState("failed");
    }
  }, [articleTitle, articleSubtitle, articleBody, articleHeroUrl]);

  const loadInterviews = useCallback(async () => {
    setInterviewsLoading(true);
    try {
      const res = await fetch(
        `/api/performers/interview-requests?performerSlug=${encodeURIComponent(effectiveSlug)}`,
        { credentials: "include", cache: "no-store" },
      );
      if (res.ok) {
        const data = (await res.json()) as { requests?: InterviewRow[] };
        setInterviews(data.requests ?? []);
      } else {
        setInterviews([]);
      }
    } catch {
      setInterviews([]);
    } finally {
      setInterviewsLoading(false);
    }
  }, [effectiveSlug]);

  useEffect(() => {
    if (tab === "interviews") void loadInterviews();
  }, [tab, loadInterviews]);

  async function saveAll() {
    setSaving(true);
    setSaveStatus("saving");
    setStatusMsg("SAVING");
    writeGalleryDraft(effectiveSlug, galleryUrls);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName: stageName,
          stageName,
          bio,
          location,
          genres: genres
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean),
          articleHeroImageUrl: galleryUrls[0] || undefined,
        }),
      });
      if (res.ok) {
        bioDirtyRef.current = false;
        setSaveStatus("saved");
        setStatusMsg("SAVED");
      } else {
        writeGalleryDraft(effectiveSlug, galleryUrls);
        setSaveStatus("failed");
        setStatusMsg("SAVE FAILED");
      }
    } catch {
      writeGalleryDraft(effectiveSlug, galleryUrls);
      setSaveStatus("failed");
      setStatusMsg("SAVE FAILED");
    } finally {
      setSaving(false);
    }
  }

  async function submitInterviewRequest() {
    setInterviewSubmitting(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/performers/interview-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          performerSlug: effectiveSlug,
          requesterName: "Writer",
          requesterRole: "WRITER",
          note: interviewNote,
        }),
      });
      if (res.ok) {
        setInterviewNote("");
        setStatusMsg("Interview request sent.");
        await loadInterviews();
      } else {
        setStatusMsg("Could not send interview request.");
      }
    } catch {
      setStatusMsg("Network error sending interview request.");
    } finally {
      setInterviewSubmitting(false);
    }
  }

  const ac = accentColor;
  const sourceLabel = registryPerformer
    ? "PerformerRegistry"
    : "session profile (/api/profile/self)";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 280 }}>
      <div style={{ padding: "10px 14px 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.08em",
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                border: active ? `1px solid ${ac}` : "1px solid rgba(255,255,255,0.12)",
                background: active ? `${ac}22` : "transparent",
                color: active ? ac : "rgba(255,255,255,0.45)",
              }}
            >
              {t.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px 8px" }}>
        {tab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              className={
                registryPerformer
                  ? getChampionVisualIdentity(registryPerformer.id).className || undefined
                  : undefined
              }
              style={{
                padding: 10,
                borderRadius: 10,
                ...(registryPerformer ? championCardStyle(registryPerformer.id) : {}),
              }}
            >
              <div>
                <label style={labelStyle}>STAGE NAME</label>
                <input style={fieldStyle} value={stageName} onChange={(e) => setStageName(e.target.value)} />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>LOCATION</label>
                <input style={fieldStyle} value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>GENRES</label>
                <input
                  style={fieldStyle}
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  placeholder="Hip-Hop, R&B"
                />
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 10 }}>
                Tier {String(tier).toUpperCase()} · Rank {rankLabel} · from {sourceLabel}
              </div>
            </div>
            {registryPerformer ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: ac }}>
                  CHAMPIONSHIP CHALLENGE
                </div>
                {(listTitlesForHolder(registryPerformer.id).length > 0
                  ? listTitlesForHolder(registryPerformer.id)
                  : listChampionshipTitles().filter((t) => t.assetType === "CROWN").slice(0, 2)
                ).map((title) => (
                  <ChampionshipChallengeCard
                    key={title.id}
                    title={title}
                    challengerId={userId}
                    role="performer"
                    showLineage
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}

        {tab === "biography" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>BIOGRAPHY</label>
            <textarea
              data-testid="bio-magazine-text"
              style={{ ...fieldStyle, minHeight: 140, resize: "vertical", lineHeight: 1.45 }}
              value={bio}
              onChange={(e) => {
                bioDirtyRef.current = true;
                bioEpochRef.current += 1;
                setBio(e.target.value);
              }}
              placeholder="Tell your story…"
            />
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
              Saves via /api/profile/update when signed in. Otherwise kept as a local draft note after Save.
            </p>
          </div>
        )}

        {tab === "magazine" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              data-testid="living-article-editor"
              style={{
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${ac}33`,
                background: `${ac}0c`,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: ac }}>
                YOUR LIVING ARTICLE — DRAFT
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                {articleLoadState === "loading"
                  ? "Loading your article…"
                  : articleLoadState === "unavailable"
                    ? "Couldn't reach your article draft. Retry Save once you're back online."
                    : articleStatus === "PUBLISHED"
                      ? "Published. Edits here save as a new draft and won't change the public article until publishing is available."
                      : "This is one article that stays the same over time — saving updates it in place, it never creates a second one."}
              </div>
              <input
                type="text"
                data-testid="living-article-title"
                placeholder="Title"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                disabled={articleLoadState === "loading"}
                style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: 12, fontFamily: "inherit" }}
              />
              <input
                type="text"
                data-testid="living-article-subtitle"
                placeholder="Subtitle (optional)"
                value={articleSubtitle}
                onChange={(e) => setArticleSubtitle(e.target.value)}
                disabled={articleLoadState === "loading"}
                style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: 12, fontFamily: "inherit" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  data-testid="living-article-hero"
                  placeholder="Hero image URL or upload custom below (optional)"
                  value={articleHeroUrl}
                  onChange={(e) => setArticleHeroUrl(e.target.value)}
                  disabled={articleLoadState === "loading"}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: 12, fontFamily: "inherit" }}
                />
                <input
                  type="file"
                  ref={customHeroFileRef}
                  accept="image/*"
                  onChange={handleHeroFileUpload}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => customHeroFileRef.current?.click()}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${ac}88`,
                    background: `${ac}15`,
                    color: ac,
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>📷</span> UPLOAD PHOTO
                </button>
              </div>

              {articleHeroUrl ? (
                <div style={{ position: "relative", width: "100%", height: 120, borderRadius: 8, overflow: "hidden", border: `1px solid ${ac}44` }}>
                  <img src={articleHeroUrl} alt="Article Hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => setArticleHeroUrl("")}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      background: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "#fff",
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    REMOVE
                  </button>
                </div>
              ) : null}

              {/* EDITORIAL TOOLSTRIP */}
              <div
                data-testid="living-article-toolstrip"
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 900, color: ac, letterSpacing: "0.1em", marginRight: 2 }}>
                  TOOLS:
                </span>
                <button
                  type="button"
                  data-testid="tool-headline"
                  onClick={() => insertArticleSnippet("## ", "Section Headline", "\n")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Headline
                </button>
                <button
                  type="button"
                  data-testid="tool-callout"
                  onClick={() => insertArticleSnippet("> \"", "Pull quote / featured highlight goes here...", "\"\n")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#00FFFF",
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Quote
                </button>
                <button
                  type="button"
                  data-testid="tool-figure"
                  onClick={() => insertArticleSnippet("![", "Figure Caption", "](https://themusiciansindex.com/yopho/hero.jpg)\n")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#FF2DAA",
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Figure
                </button>
                <button
                  type="button"
                  data-testid="tool-divider"
                  onClick={() => insertArticleSnippet("***\n", "")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#FFD700",
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Divider
                </button>
                <button
                  type="button"
                  data-testid="tool-author-note"
                  onClick={() => insertArticleSnippet("*Author's Note: ", "Exclusive statement from the artist...", "*\n")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Note
                </button>
                <button
                  type="button"
                  data-testid="tool-badge"
                  onClick={() => insertArticleSnippet("[✦ VERIFIED PERFORMER DISPATCH]\n", "")}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid rgba(0, 255, 255, 0.4)",
                    background: "rgba(0, 255, 255, 0.12)",
                    color: "#00FFFF",
                    fontSize: 9,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ✦ Dispatch
                </button>
              </div>

              <textarea
                data-testid="living-article-body"
                placeholder="Write your article… use tools above to format headlines, quotes, notes, and figure breaks"
                value={articleBody}
                onChange={(e) => setArticleBody(e.target.value)}
                disabled={articleLoadState === "loading"}
                rows={8}
                style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: 12, fontFamily: "inherit", resize: "vertical" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  data-testid="living-article-save"
                  onClick={() => void saveArticle()}
                  disabled={articleSaveState === "saving" || articleLoadState === "loading"}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${ac}`, background: ac, color: "#050510", fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {articleSaveState === "saving" ? "SAVING…" : "SAVE"}
                </button>
                <span data-testid="living-article-save-status" style={{ fontSize: 10, color: articleSaveState === "failed" ? "#FF6B6B" : "rgba(255,255,255,0.4)" }}>
                  {articleSaveState === "saved" ? "Saved" : articleSaveState === "failed" ? "Save failed — try again" : ""}
                </span>
              </div>
            </div>
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${ac}33`,
                background: `${ac}0c`,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: ac, marginBottom: 6 }}>
                MAGAZINE ARTICLE
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{stageName || "Performer"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
                {magazineSpreadHref ? "Opens your magazine article spread." : "No magazine spread is published for this performer yet."}
              </div>
              {magazineSpreadHref ? (
                <Link
                  href={magazineSpreadHref}
                  data-testid="view-performer-spread"
                  style={{
                    display: "inline-block",
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: `1px solid ${ac}`,
                    color: ac,
                    fontSize: 10,
                    fontWeight: 900,
                    textDecoration: "none",
                    letterSpacing: "0.08em",
                  }}
                >
                  VIEW ARTICLE
                </Link>
              ) : (
                <span data-testid="view-performer-spread" style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.35)" }}>
                  VIEW ARTICLE
                </span>
              )}
              {magazineSpreadHref ? (
                <button
                  type="button"
                  data-testid="show-article-qr"
                  onClick={() => setArticleQrOrigin((current) => current ? null : window.location.origin)}
                  style={{ marginLeft: 8, padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "#fff", fontSize: 10, fontWeight: 900, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit" }}
                >
                  SHOW ARTICLE QR
                </button>
              ) : null}
              {articleQrOrigin && magazineSpreadHref ? (
                <div data-testid="article-qr-panel" style={{ marginTop: 12, background: "#fff", padding: 8, width: "fit-content", borderRadius: 8 }}>
                  <QRCodeSVG value={`${articleQrOrigin}${magazineSpreadHref}`} size={180} bgColor="#ffffff" fgColor="#050510" level="M" />
                </div>
              ) : null}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              Publish status:{" "}
              {magazineArticles.length > 0
                ? `${magazineArticles.length} magazine issue article(s) linked in magazineIssueData`
                : "No magazine issue row yet — artist article page still live from PerformerRegistry"}
            </div>
            {magazineArticles.slice(0, 3).map((a) => (
              <Link
                key={a.slug}
                href={magazineReaderArticleUrl(a.slug)}
                style={{ fontSize: 11, color: "#FFD700", textDecoration: "none" }}
              >
                {a.title} →
              </Link>
            ))}
          </div>
        )}

        {tab === "gallery" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              {slotCount} image slot{slotCount === 1 ? "" : "s"} unlocked for{" "}
              <span style={{ color: ac, fontWeight: 800 }}>{String(tier).toUpperCase()}</span>
              {" · "}
              FREE 1 → PRO 3 → RUBY 6 → SILVER 8 → GOLD 10 → PLATINUM 15 → DIAMOND 20
            </div>
            {Array.from({ length: slotCount }, (_, i) => {
              const url = galleryUrls[i] ?? "";
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={labelStyle}>
                    {getGallerySlotLabel(i).toUpperCase()}
                    {i === 0 ? " · REQUIRED" : ""}
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        border: `1px solid ${ac}44`,
                        background: url
                          ? `center/cover url(${url})`
                          : "rgba(255,255,255,0.04)",
                        flexShrink: 0,
                      }}
                    />
                    <input
                      style={{ ...fieldStyle, flex: 1 }}
                      value={url}
                      onChange={(e) => {
                        const next = Array.from({ length: slotCount }, (__, j) => galleryUrls[j] ?? "");
                        next[i] = e.target.value;
                        setGalleryUrls(next);
                      }}
                      placeholder={url ? "Image URL" : "No image yet — paste URL or upgrade for more slots"}
                    />
                  </div>
                </div>
              );
            })}
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.32)", lineHeight: 1.4 }}>
              Upload pipeline not bound in this drawer yet — URL / slot picker with honest empty. Hero saves to
              articleHeroImageUrl when profile API accepts it.
            </p>
          </div>
        )}

        {tab === "music" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.45 }}>
              Listen uses distributor / streaming links. Own / Support uses your TMI-linked storefront.{" "}
              {HYBRID_ECONOMICS_COPY}
            </p>
            {songs.length === 0 ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", padding: "12px 0" }}>
                No featured tracks in PerformerRegistry yet. Add song links below or manage Media Locker.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {getLivingCatalogForPerformer(effectiveSlug).map((t) => (
                  <ListenOwnTrackCard key={t.id} track={t} accentColor={ac} compact />
                ))}
              </div>
            )}
            <div>
              <label style={labelStyle}>SONG LINKS / FEATURED TRACKS (one per line)</label>
              <textarea
                style={{ ...fieldStyle, minHeight: 100, resize: "vertical" }}
                value={songLinks}
                onChange={(e) => setSongLinks(e.target.value)}
                placeholder="https://… or track title"
              />
            </div>
            <Link
              href="/hub/performer"
              style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", textDecoration: "none" }}
            >
              OPEN PERFORMER COMMAND CENTER →
            </Link>
          </div>
        )}

        {tab === "commerce" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {onOpenCommerceCenter ? (
              <button
                type="button"
                onClick={onOpenCommerceCenter}
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,215,0,0.55)",
                  background: "rgba(255,215,0,0.12)",
                  color: "#FFD700",
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  width: "fit-content",
                }}
              >
                Open Commerce Center →
              </button>
            ) : (
              <Link
                href="/hub/performer?drawer=commerce_center"
                style={{
                  display: "inline-block",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,215,0,0.55)",
                  background: "rgba(255,215,0,0.12)",
                  color: "#FFD700",
                  fontWeight: 800,
                  fontSize: 12,
                  textDecoration: "none",
                  width: "fit-content",
                }}
              >
                Open Commerce Center →
              </Link>
            )}
            <CommerceConnectorPanel
              performerId={effectiveSlug}
              accentColor={ac}
              articleHref={articleHref}
            />
          </div>
        )}

        {tab === "interviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: ac }}>
              PENDING REQUESTS
            </div>
            {interviewsLoading ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Loading interviews…</div>
            ) : interviews.length === 0 ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.45 }}>
                No interview requests yet. Writers can request an interview; full in-app studio is not built in
                this phase.
              </div>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {interviews.map((r) => (
                  <li
                    key={r.id}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(0,0,0,0.25)",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                      {r.requesterName}{" "}
                      <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 10 }}>
                        · {r.requesterRole} · {r.status}
                      </span>
                    </div>
                    {r.note ? (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{r.note}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            {showRequestInterview ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                <label style={labelStyle}>REQUEST INTERVIEW</label>
                <textarea
                  style={{ ...fieldStyle, minHeight: 72 }}
                  value={interviewNote}
                  onChange={(e) => setInterviewNote(e.target.value)}
                  placeholder="Pitch / topics for the interview…"
                />
                <button
                  type="button"
                  disabled={interviewSubmitting}
                  onClick={() => void submitInterviewRequest()}
                  style={{
                    alignSelf: "flex-start",
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: `1px solid ${ac}`,
                    background: `${ac}22`,
                    color: ac,
                    fontWeight: 900,
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    cursor: interviewSubmitting ? "wait" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {interviewSubmitting ? "SENDING…" : "REQUEST INTERVIEW"}
                </button>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.32)" }}>
                Writers can request interviews from the public article (role-gated). In-app video interview
                studio deferred.
              </p>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          padding: "10px 16px 14px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          data-testid="bio-magazine-save"
          data-save-status={saving ? "saving" : saveStatus}
          disabled={saving}
          onClick={() => void saveAll()}
          style={{
            padding: "9px 16px",
            borderRadius: 8,
            border: `1.5px solid ${ac}`,
            background: ac,
            color: "#050510",
            fontWeight: 900,
            fontSize: 10,
            letterSpacing: "0.08em",
            cursor: saving ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {saving ? "SAVING…" : "SAVE"}
        </button>
        {magazineSpreadHref ? (
          <Link
            href={magazineSpreadHref}
            data-testid="view-performer-spread-footer"
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "1.5px solid rgba(0,255,255,0.65)",
              background: "rgba(0,255,255,0.08)",
              color: "#00FFFF",
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            VIEW ARTICLE
          </Link>
        ) : null}
        <Link
          href={articleHref}
          onClick={onPreview}
          style={{
            padding: "9px 16px",
            borderRadius: 8,
            border: "1.5px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            fontWeight: 900,
            fontSize: 10,
            letterSpacing: "0.08em",
            textDecoration: "none",
          }}
        >
          PREVIEW ARTICLE
        </Link>
        {statusMsg ? (
          <span data-testid="bio-magazine-save-status" style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", flex: "1 1 160px" }}>{statusMsg}</span>
        ) : null}
      </div>
    </div>
  );
}
