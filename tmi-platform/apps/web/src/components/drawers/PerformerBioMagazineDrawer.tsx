"use client";

/**
 * PerformerBioMagazineDrawer — Phase 1 foundation.
 * Tabs: Profile · Biography · Magazine Article · Gallery · Music · Interviews · Store & Commerce
 * Footer: Save · Preview Article
 * Data: PerformerRegistry + /api/profile/update + interview-requests stub + CommerceConnectorRegistry.
 * No Zoom studio / AI rewrite / press kit (deferred).
 * Commerce is performer-only (Rule 26); no ticket inventory creation (Rule 17).
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
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
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
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
}: PerformerBioMagazineDrawerProps) {
  const registryPerformer = useMemo(
    () => resolveRegistryPerformer(performerSlug, userId, displayName),
    [performerSlug, userId, displayName],
  );

  const [sessionSlug, setSessionSlug] = useState(
    performerSlug || registryPerformer?.slug || userId || "session",
  );
  const [tier, setTier] = useState<PerformerTier | string>(registryPerformer?.tier ?? "FREE");
  const [tab, setTab] = useState<TabId>("profile");
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
  const [songLinks, setSongLinks] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [interviewNote, setInterviewNote] = useState("");
  const [interviewSubmitting, setInterviewSubmitting] = useState(false);
  const [rankLabel, setRankLabel] = useState(
    registryPerformer ? `#${registryPerformer.rank}` : "—",
  );

  const effectiveSlug = registryPerformer?.slug ?? sessionSlug;
  const slotCount = getPerformerGallerySlotCount(tier);
  const articleHref = `/articles/performer/${effectiveSlug}`;
  const magazineArticles = useMemo(
    () => MAGAZINE_ISSUE_1.filter((a) => a.performerSlug === effectiveSlug),
    [effectiveSlug],
  );
  const songs: PerformerSong[] = registryPerformer?.songs ?? [];

  useEffect(() => {
    if (registryPerformer) {
      setSessionSlug(registryPerformer.slug);
      setTier(registryPerformer.tier);
      setStageName(registryPerformer.name);
      setLocation(`${registryPerformer.city}, ${registryPerformer.countryName}`);
      setGenres(registryPerformer.category);
      setBio(registryPerformer.bio ?? "");
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
      return;
    }

    let active = true;
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
        setBio(p.bio ?? "");
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
    setStatusMsg("");
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
        setStatusMsg("Saved profile & bio. Gallery URLs kept as local draft until upload pipeline binds.");
      } else {
        writeGalleryDraft(effectiveSlug, galleryUrls);
        setStatusMsg("API save failed — bio/gallery kept as local draft on this device.");
      }
    } catch {
      writeGalleryDraft(effectiveSlug, galleryUrls);
      setStatusMsg("Offline — draft saved locally on this device.");
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
              style={{ ...fieldStyle, minHeight: 140, resize: "vertical", lineHeight: 1.45 }}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
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
              style={{
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${ac}33`,
                background: `${ac}0c`,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: ac, marginBottom: 6 }}>
                ARTIST ARTICLE
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{stageName || "Performer"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>
                Preview route: {articleHref}
              </div>
              <Link
                href={articleHref}
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
                OPEN ARTICLE PREVIEW →
              </Link>
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
                href={`/magazine/article/${a.slug}`}
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
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", flex: "1 1 160px" }}>{statusMsg}</span>
        ) : null}
      </div>
    </div>
  );
}
