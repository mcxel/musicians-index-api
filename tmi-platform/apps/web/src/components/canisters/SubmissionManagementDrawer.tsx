"use client";

/**
 * SubmissionManagementDrawer — Canonical destination-based submission management surface.
 *
 * Supports:
 * - STREAM & WIN (audio/track submissions)
 * - VIDEO SHUFFLE (video submissions)
 * - EVENTS → BEAT / INSTRUMENTAL (Battle | Cypher | World Dance Party; Slow Jam nested)
 * - Member counts: "YOUR SUBMISSIONS — X", "YOUR VIDEOS — Y"
 * - Lists exact titles/names of submitted items with status
 * - Remove item from submission queue (does NOT delete underlying media file)
 * - Replace item with another eligible media asset
 * - Add/Submit new eligible media
 * - Real API integration (/api/submissions) with durable client persistence fallback
 * - Fully responsive, flush layout for mobile (Galaxy portrait) without horizontal clipping
 */

import { useCallback, useEffect, useState } from "react";
import DrawerBezelChrome from "@/components/drawers/DrawerBezelChrome";
import DrawerCompositionLayout from "@/components/drawers/DrawerCompositionLayout";
import { DRAWER_LIVE_PREVIEW_BINDING_LAW_ID } from "@/lib/drawers/DrawerLivePreviewBindingLaw";
import { resolveSubmissionRemaining } from "@/lib/submissions/SubmissionEntitlementAuthority";
import {
  listBeatEventChooserCards,
  listWorldDancePartyModes,
  submitBeatToEvent,
  submitExistingBeatToAnotherEvent,
  listAssignmentsForBeat,
  type BeatPrimaryDestination,
  type WorldDancePartyMode,
} from "@/lib/beats/BeatLockerEventRoutingPolicy";

export type SubmissionDestination = "streaming_win_radio" | "video_shuffle" | "events";

export interface ManagedSubmissionItem {
  id: string;
  submitterId: string;
  title: string;
  artist: string;
  destination: SubmissionDestination;
  type: "track" | "video";
  status: "SUBMITTED" | "QUEUED" | "IN_ROTATION" | "PLAYED" | "PENDING_REVIEW";
  mediaUrl: string;
  genre?: string;
  bpm?: number | null;
  submittedAt: number;
}

export interface EligibleMediaItem {
  id: string;
  title: string;
  artist: string;
  type: "track" | "video";
  url: string;
  genre?: string;
  bpm?: number;
}

const LOCAL_STORAGE_RADIO_KEY = "tmi_radio_submissions_v1";
const LOCAL_STORAGE_VIDEO_KEY = "tmi_video_shuffle_submissions_v1";

// Canonical starter seed items if member has not yet submitted anything
const DEFAULT_RADIO_SUBMISSIONS: ManagedSubmissionItem[] = [
  {
    id: "sub-radio-001",
    submitterId: "member",
    title: "Midnight Neon Groove",
    artist: "Member / Creator",
    destination: "streaming_win_radio",
    type: "track",
    status: "IN_ROTATION",
    mediaUrl: "https://themusiciansindex.com/audio/sample-groove.mp3",
    genre: "Electronic / Synth",
    bpm: 124,
    submittedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "sub-radio-002",
    submitterId: "member",
    title: "City Lights Freestyle",
    artist: "Member / Creator",
    destination: "streaming_win_radio",
    type: "track",
    status: "QUEUED",
    mediaUrl: "https://themusiciansindex.com/audio/sample-freestyle.mp3",
    genre: "Hip-Hop",
    bpm: 96,
    submittedAt: Date.now() - 86400000,
  },
];

const DEFAULT_VIDEO_SUBMISSIONS: ManagedSubmissionItem[] = [
  {
    id: "sub-vid-001",
    submitterId: "member",
    title: "Live Arena Showcase 2026",
    artist: "Member / Creator",
    destination: "video_shuffle",
    type: "video",
    status: "IN_ROTATION",
    mediaUrl: "https://themusiciansindex.com/video/showcase.mp4",
    genre: "Live Performance",
    submittedAt: Date.now() - 86400000 * 3,
  },
  {
    id: "sub-vid-002",
    submitterId: "member",
    title: "Official Studio Cypher Take 2",
    artist: "Member / Creator",
    destination: "video_shuffle",
    type: "video",
    status: "SUBMITTED",
    mediaUrl: "https://themusiciansindex.com/video/cypher.mp4",
    genre: "Studio Cypher",
    submittedAt: Date.now() - 3600000 * 4,
  },
];

// Sample eligible library assets for replacement / new submission picker
const ELIGIBLE_MEDIA_LIBRARY: EligibleMediaItem[] = [
  { id: "lib-trk-101", title: "Astral Sunset (Extended Mix)", artist: "You", type: "track", url: "/audio/track1.mp3", genre: "R&B", bpm: 105 },
  { id: "lib-trk-102", title: "Bassline Pressure Wave", artist: "You", type: "track", url: "/audio/track2.mp3", genre: "Electronic", bpm: 128 },
  { id: "lib-trk-103", title: "Velvet Rhymes Part 1", artist: "You", type: "track", url: "/audio/track3.mp3", genre: "Hip-Hop", bpm: 92 },
  { id: "lib-vid-201", title: "Visualizer: Electric Skyline", artist: "You", type: "video", url: "/video/vid1.mp4", genre: "Visualizer" },
  { id: "lib-vid-202", title: "Acoustic Stage Session Live", artist: "You", type: "video", url: "/video/vid2.mp4", genre: "Acoustic" },
  { id: "lib-vid-203", title: "Street Dance Routine 4K", artist: "You", type: "video", url: "/video/vid3.mp4", genre: "Dance" },
];

interface SubmissionManagementDrawerProps {
  userId?: string;
  displayName?: string;
  accentColor?: string;
  onClose?: () => void;
  /** Canonical persona + tier for submission entitlement enforcement (§9164/§9277). */
  accountType?: "fan" | "performer" | "artist";
  tier?: "free" | "pro" | "RUBY" | "silver" | "gold" | "platinum" | "diamond";
}

export default function SubmissionManagementDrawer({
  userId = "member",
  displayName = "Member",
  accentColor = "#FFD700",
  accountType = "performer",
  tier = "free",
}: SubmissionManagementDrawerProps) {
  const [destination, setDestination] = useState<SubmissionDestination>("streaming_win_radio");
  const [radioSubmissions, setRadioSubmissions] = useState<ManagedSubmissionItem[]>(DEFAULT_RADIO_SUBMISSIONS);
  const [videoSubmissions, setVideoSubmissions] = useState<ManagedSubmissionItem[]>(DEFAULT_VIDEO_SUBMISSIONS);
  
  // Picker modal state
  const [pickerMode, setPickerMode] = useState<"submit" | "replace" | null>(null);
  const [targetReplacingId, setTargetReplacingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  /** §11370 LIVE PREVIEW — selected / focused media before SAVE/SUBMIT. */
  const [livePreview, setLivePreview] = useState<{
    title: string;
    url: string;
    type: "track" | "video";
    genre?: string;
    bpm?: number | null;
  } | null>(null);

  /** §15058+ EVENTS → Beat destination chooser (Producer explicit). */
  const [eventStep, setEventStep] = useState<"chooser" | "wdp_mode" | "form" | "locker">("chooser");
  const [eventDestination, setEventDestination] = useState<BeatPrimaryDestination | null>(null);
  const [wdpMode, setWdpMode] = useState<WorldDancePartyMode | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventGenre, setEventGenre] = useState("Hip-Hop");
  const [eventPrice, setEventPrice] = useState("9.99");
  const [eventForSale, setEventForSale] = useState(true);
  const [eventMarketplaceFallback, setEventMarketplaceFallback] = useState<boolean | null>(null);
  const [lastBeatId, setLastBeatId] = useState<string | null>(null);
  const [eventHistory, setEventHistory] = useState<
    Array<{ beatId: string; title: string; destination: string; status: string }>
  >([]);

  // Load submissions from API & localStorage
  const loadSubmissions = useCallback(async () => {
    try {
      // 1. Check localStorage first for instant hydration
      const storedRadio = localStorage.getItem(LOCAL_STORAGE_RADIO_KEY);
      if (storedRadio) {
        try { setRadioSubmissions(JSON.parse(storedRadio)); } catch {}
      }
      const storedVideo = localStorage.getItem(LOCAL_STORAGE_VIDEO_KEY);
      if (storedVideo) {
        try { setVideoSubmissions(JSON.parse(storedVideo)); } catch {}
      }

      // 2. Query /api/submissions for server state
      const res = await fetch(`/api/submissions?submitterId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.submissions) && data.submissions.length > 0) {
          const rSubs: ManagedSubmissionItem[] = [];
          const vSubs: ManagedSubmissionItem[] = [];
          for (const s of data.submissions) {
            const item: ManagedSubmissionItem = {
              id: s.id,
              submitterId: s.submitterId,
              title: s.title,
              artist: displayName,
              destination: s.type === "video" ? "video_shuffle" : "streaming_win_radio",
              type: s.type === "video" ? "video" : "track",
              status: s.status === "live" ? "IN_ROTATION" : s.status === "approved" ? "QUEUED" : "SUBMITTED",
              mediaUrl: s.url,
              genre: s.genre,
              bpm: s.bpm,
              submittedAt: s.createdAt,
            };
            if (item.destination === "video_shuffle") vSubs.push(item);
            else rSubs.push(item);
          }
          if (rSubs.length > 0) {
            setRadioSubmissions(rSubs);
            localStorage.setItem(LOCAL_STORAGE_RADIO_KEY, JSON.stringify(rSubs));
          }
          if (vSubs.length > 0) {
            setVideoSubmissions(vSubs);
            localStorage.setItem(LOCAL_STORAGE_VIDEO_KEY, JSON.stringify(vSubs));
          }
        }
      }
    } catch {
      // Offline / fallback to stored state
    }
  }, [userId, displayName]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Remove submission
  const handleRemove = async (id: string) => {
    // 1. Optimistic removal from queue
    if (destination === "streaming_win_radio") {
      const next = radioSubmissions.filter((s) => s.id !== id);
      setRadioSubmissions(next);
      localStorage.setItem(LOCAL_STORAGE_RADIO_KEY, JSON.stringify(next));
    } else {
      const next = videoSubmissions.filter((s) => s.id !== id);
      setVideoSubmissions(next);
      localStorage.setItem(LOCAL_STORAGE_VIDEO_KEY, JSON.stringify(next));
    }
    setConfirmRemoveId(null);
    setStatusMessage("Submission removed from queue. Media file preserved in library.");
    setTimeout(() => setStatusMessage(null), 4000);

    // 2. Call backend DELETE
    try {
      await fetch(`/api/submissions?id=${encodeURIComponent(id)}&submitterId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
    } catch {}
  };

  // Submit new media or replace existing
  const handleSelectMedia = async (media: EligibleMediaItem) => {
    // Immediate visual bind (§11353) — preview updates before persistence.
    setLivePreview({
      title: media.title,
      url: media.url,
      type: media.type,
      genre: media.genre,
      bpm: media.bpm,
    });
    if (pickerMode === "replace" && targetReplacingId) {
      // REPLACE WORKFLOW
      const targetId = targetReplacingId;
      if (destination === "streaming_win_radio") {
        const next = radioSubmissions.map((s) =>
          s.id === targetId
            ? { ...s, title: media.title, mediaUrl: media.url, genre: media.genre, bpm: media.bpm, status: "QUEUED" as const }
            : s
        );
        setRadioSubmissions(next);
        localStorage.setItem(LOCAL_STORAGE_RADIO_KEY, JSON.stringify(next));
      } else {
        const next = videoSubmissions.map((s) =>
          s.id === targetId
            ? { ...s, title: media.title, mediaUrl: media.url, genre: media.genre, status: "QUEUED" as const }
            : s
        );
        setVideoSubmissions(next);
        localStorage.setItem(LOCAL_STORAGE_VIDEO_KEY, JSON.stringify(next));
      }

      setStatusMessage(`Submission replaced with "${media.title}".`);
      setTimeout(() => setStatusMessage(null), 4000);
      setPickerMode(null);
      setTargetReplacingId(null);

      // Call backend PUT
      try {
        await fetch("/api/submissions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: targetId,
            submitterId: userId,
            title: media.title,
            url: media.url,
            genre: media.genre,
            bpm: media.bpm,
          }),
        });
      } catch {}

    } else if (pickerMode === "submit") {
      // §9277 entitlement trace — resolve destination → entitlement → usage →
      // remaining BEFORE submitting. Fail-closed when unconfigured (§9278).
      const swDest = destination === "streaming_win_radio" ? "STREAM_WIN_RADIO" : "VIDEO_SHUFFLE";
      const usedInPeriod =
        destination === "streaming_win_radio" ? radioSubmissions.length : videoSubmissions.length;
      const remaining = resolveSubmissionRemaining({
        destination: swDest,
        tier,
        accountType,
        usedInPeriod,
      });
      if (!remaining.ok) {
        // NOT_AUTHORIZED or OWNER_VALUE_REQUIRED — do not grant unlimited submissions.
        setStatusMessage(
          remaining.reason === "NOT_AUTHORIZED"
            ? "This account cannot submit to this destination."
            : "Submission allowance is not configured for your tier yet.",
        );
        setTimeout(() => setStatusMessage(null), 4000);
        setPickerMode(null);
        return;
      }
      if (remaining.atLimit) {
        setStatusMessage(
          `You've used your ${remaining.allowed} ${destination === "video_shuffle" ? "Video Shuffle" : "Stream & Win"} submissions. Upgrade for more.`,
        );
        setTimeout(() => setStatusMessage(null), 4000);
        setPickerMode(null);
        return;
      }

      // NEW SUBMIT WORKFLOW
      const newItem: ManagedSubmissionItem = {
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        submitterId: userId,
        title: media.title,
        artist: displayName,
        destination,
        type: destination === "video_shuffle" ? "video" : "track",
        status: "SUBMITTED",
        mediaUrl: media.url,
        genre: media.genre,
        bpm: media.bpm,
        submittedAt: Date.now(),
      };

      if (destination === "streaming_win_radio") {
        const next = [newItem, ...radioSubmissions];
        setRadioSubmissions(next);
        localStorage.setItem(LOCAL_STORAGE_RADIO_KEY, JSON.stringify(next));
      } else {
        const next = [newItem, ...videoSubmissions];
        setVideoSubmissions(next);
        localStorage.setItem(LOCAL_STORAGE_VIDEO_KEY, JSON.stringify(next));
      }

      setStatusMessage(`Submitted "${media.title}" to ${destination === "video_shuffle" ? "Video Shuffle" : "Streaming Win Radio"}!`);
      setTimeout(() => setStatusMessage(null), 4000);
      setPickerMode(null);

      // Call backend POST
      try {
        await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submitterId: userId,
            title: media.title,
            type: destination === "video_shuffle" ? "video" : "track",
            url: media.url,
            genre: media.genre,
            bpm: media.bpm,
          }),
        });
      } catch {}
    }
  };

  const currentItems =
    destination === "streaming_win_radio"
      ? radioSubmissions
      : destination === "video_shuffle"
        ? videoSubmissions
        : [];
  const destinationLabel =
    destination === "streaming_win_radio"
      ? "STREAM & WIN"
      : destination === "video_shuffle"
        ? "VIDEO SHUFFLE"
        : "EVENTS";
  const countHeader =
    destination === "streaming_win_radio"
      ? `YOUR SUBMISSIONS — ${radioSubmissions.length}`
      : destination === "video_shuffle"
        ? `YOUR VIDEOS — ${videoSubmissions.length}`
        : `EVENT BEATS — ${eventHistory.length}`;

  const eligibleForDestination = ELIGIBLE_MEDIA_LIBRARY.filter((item) =>
    destination === "video_shuffle" ? item.type === "video" : item.type === "track"
  );

  const handleEventBeatSubmit = () => {
    if (!eventDestination) return;
    const priceCents = eventForSale
      ? Math.round(parseFloat(eventPrice || "0") * 100)
      : null;
    const result = submitBeatToEvent({
      producerId: userId,
      displayTitle: eventTitle,
      genre: eventGenre,
      mediaUrl: "/audio/producer-beat-fixture.mp3",
      destination: eventDestination,
      wdpMode: eventDestination === "WORLD_DANCE_PARTY" ? wdpMode ?? undefined : undefined,
      forSale: eventForSale,
      priceCents,
      licenseType: eventForSale ? "EXCLUSIVE" : null,
      marketplaceFallback:
        eventForSale && (eventDestination === "BATTLE" || eventDestination === "CYPHER")
          ? eventMarketplaceFallback
          : null,
    });
    if (!result.ok) {
      setStatusMessage(result.message);
      setTimeout(() => setStatusMessage(null), 5000);
      return;
    }
    setLastBeatId(result.beat.beatId);
    setEventHistory((prev) => [
      {
        beatId: result.beat.beatId,
        title: result.beat.displayTitle,
        destination:
          result.assignment.destination === "WORLD_DANCE_PARTY"
            ? `WORLD DANCE PARTY / ${result.assignment.wdpMode ?? "DANCE"}`
            : result.assignment.destination,
        status: result.assignment.status,
      },
      ...prev,
    ]);
    setStatusMessage(
      `Submitted "${result.beat.displayTitle}" as ${result.beat.beatId} → ${result.assignment.destination}`,
    );
    setTimeout(() => setStatusMessage(null), 5000);
    setEventStep("locker");
  };

  const handleSubmitElsewhere = (dest: BeatPrimaryDestination) => {
    if (!lastBeatId) return;
    if (dest === "WORLD_DANCE_PARTY") {
      setEventDestination("WORLD_DANCE_PARTY");
      setEventStep("wdp_mode");
      return;
    }
    const result = submitExistingBeatToAnotherEvent({
      beatId: lastBeatId,
      producerId: userId,
      destination: dest,
    });
    if (!result.ok) {
      setStatusMessage(result.message);
      setTimeout(() => setStatusMessage(null), 5000);
      return;
    }
    setEventHistory((prev) => [
      {
        beatId: result.beat.beatId,
        title: result.beat.displayTitle,
        destination: result.assignment.destination,
        status: result.assignment.status,
      },
      ...prev,
    ]);
    setStatusMessage(`Same Beat ${result.beat.beatId} also submitted to ${dest} — no reupload.`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  return (
    <div
      data-testid="submission-management-drawer"
      data-live-preview-binding={DRAWER_LIVE_PREVIEW_BINDING_LAW_ID}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <DrawerBezelChrome variant="gold" seriesLabel="SUBMISSION MANAGEMENT" accentColor={accentColor}>
        <DrawerCompositionLayout
          moduleId="submissions"
          previewCount={1}
          preview={
            <div
              data-testid="submission-live-preview"
              data-live-preview-id="submission-media"
              style={{
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${accentColor}55`,
                background: "rgba(0,0,0,0.4)",
                minHeight: 96,
              }}
            >
              {livePreview ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{livePreview.title}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                        {livePreview.type === "video" ? "VIDEO" : "TRACK"}
                        {livePreview.genre ? ` · ${livePreview.genre}` : ""}
                        {livePreview.bpm ? ` · ${livePreview.bpm} BPM` : ""}
                      </div>
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#00FF88", letterSpacing: "0.12em" }}>
                      LIVE PREVIEW
                    </span>
                  </div>
                  {livePreview.type === "video" ? (
                    <video
                      key={livePreview.url}
                      controls
                      src={livePreview.url}
                      style={{ width: "100%", maxHeight: 180, borderRadius: 8, background: "#000" }}
                    />
                  ) : (
                    <audio key={livePreview.url} controls src={livePreview.url} style={{ width: "100%" }} />
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.45 }}>
                  Select a queue item or choose eligible media — the preview updates immediately. Submit remains a separate action.
                </div>
              )}
            </div>
          }
          instruments={
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", boxSizing: "border-box" }}>
          
          {/* Destination Switcher Tabs — instruments below preview (§11350) */}
          <div
            style={{
              display: "flex",
              gap: 8,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              data-testid="sub-dest-tab-radio"
              onClick={() => { setDestination("streaming_win_radio"); setPickerMode(null); }}
              style={{
                flex: "1 1 140px",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
                border: destination === "streaming_win_radio" ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.12)",
                background: destination === "streaming_win_radio" ? "rgba(0,255,255,0.18)" : "rgba(255,255,255,0.03)",
                color: destination === "streaming_win_radio" ? "#00FFFF" : "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span>📻</span>
              <span>STREAM &amp; WIN</span>
              <span style={{ fontSize: 9, opacity: 0.8 }}>({radioSubmissions.length})</span>
            </button>

            <button
              type="button"
              data-testid="sub-dest-tab-video"
              onClick={() => { setDestination("video_shuffle"); setPickerMode(null); }}
              style={{
                flex: "1 1 140px",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
                border: destination === "video_shuffle" ? "1px solid #FF2DAA" : "1px solid rgba(255,255,255,0.12)",
                background: destination === "video_shuffle" ? "rgba(255,45,170,0.18)" : "rgba(255,255,255,0.03)",
                color: destination === "video_shuffle" ? "#FF2DAA" : "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span>🎬</span>
              <span>VIDEO SHUFFLE</span>
              <span style={{ fontSize: 9, opacity: 0.8 }}>({videoSubmissions.length})</span>
            </button>

            <button
              type="button"
              data-testid="sub-dest-tab-events"
              onClick={() => {
                setDestination("events");
                setPickerMode(null);
                setEventStep("chooser");
                setEventDestination(null);
                setWdpMode(null);
              }}
              style={{
                flex: "1 1 140px",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.08em",
                cursor: "pointer",
                border: destination === "events" ? "1px solid #FFD700" : "1px solid rgba(255,255,255,0.12)",
                background: destination === "events" ? "rgba(255,215,0,0.18)" : "rgba(255,255,255,0.03)",
                color: destination === "events" ? "#FFD700" : "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span>⚔️</span>
              <span>EVENTS</span>
              <span style={{ fontSize: 9, opacity: 0.8 }}>({eventHistory.length})</span>
            </button>
          </div>

          {/* Status Alert Banner */}
          {statusMessage ? (
            <div
              data-testid="sub-status-banner"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(0,255,136,0.12)",
                border: "1px solid rgba(0,255,136,0.4)",
                color: "#00FF88",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              ✓ {statusMessage}
            </div>
          ) : null}

          {destination === "events" ? (
            <div data-testid="events-beat-instrumental" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.1em", color: "#FFD700" }}>
                EVENTS → BEAT / INSTRUMENTAL
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
                You choose the destination. TMI tags the Beat once in Beat Locker — no duplicate uploads.
              </div>

              {eventStep === "chooser" ? (
                <div data-testid="beat-event-chooser" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>WHAT IS THIS BEAT FOR?</div>
                  {listBeatEventChooserCards().map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      data-testid={`beat-dest-${card.id.toLowerCase()}`}
                      onClick={() => {
                        setEventDestination(card.id);
                        if (card.id === "WORLD_DANCE_PARTY") {
                          setEventStep("wdp_mode");
                        } else {
                          setEventStep("form");
                        }
                      }}
                      style={{
                        textAlign: "left",
                        padding: "14px 16px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,215,0,0.35)",
                        background: "rgba(255,215,0,0.08)",
                        color: "#FFD700",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em" }}>{card.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{card.blurb}</div>
                    </button>
                  ))}
                </div>
              ) : null}

              {eventStep === "wdp_mode" ? (
                <div data-testid="wdp-mode-chooser" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    type="button"
                    data-testid="events-back-to-chooser"
                    onClick={() => { setEventStep("chooser"); setEventDestination(null); setWdpMode(null); }}
                    style={{ alignSelf: "flex-start", background: "transparent", border: "none", color: "#00FFFF", fontSize: 10, cursor: "pointer" }}
                  >
                    ← Back to Event Types
                  </button>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>WORLD DANCE PARTY — DANCE OR SLOW JAM?</div>
                  {listWorldDancePartyModes().map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      data-testid={`wdp-mode-${mode.id.toLowerCase()}`}
                      onClick={() => {
                        setWdpMode(mode.id);
                        if (lastBeatId && eventStep === "wdp_mode" && eventHistory.some((h) => h.beatId === lastBeatId)) {
                          const result = submitExistingBeatToAnotherEvent({
                            beatId: lastBeatId,
                            producerId: userId,
                            destination: "WORLD_DANCE_PARTY",
                            wdpMode: mode.id,
                          });
                          if (!result.ok) {
                            setStatusMessage(result.message);
                            setTimeout(() => setStatusMessage(null), 5000);
                            return;
                          }
                          setEventHistory((prev) => [
                            {
                              beatId: result.beat.beatId,
                              title: result.beat.displayTitle,
                              destination: `WORLD DANCE PARTY / ${mode.id}`,
                              status: result.assignment.status,
                            },
                            ...prev,
                          ]);
                          setStatusMessage(`Same Beat ${result.beat.beatId} → WDP / ${mode.id} — no reupload.`);
                          setTimeout(() => setStatusMessage(null), 5000);
                          setEventStep("locker");
                          return;
                        }
                        setEventStep("form");
                      }}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 10,
                        border: "1px solid rgba(0,255,255,0.35)",
                        background: "rgba(0,255,255,0.08)",
                        color: "#00FFFF",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {eventStep === "form" && eventDestination ? (
                <div data-testid="beat-event-form" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    type="button"
                    data-testid="events-back-from-form"
                    onClick={() => {
                      if (eventDestination === "WORLD_DANCE_PARTY") setEventStep("wdp_mode");
                      else { setEventStep("chooser"); setEventDestination(null); }
                    }}
                    style={{ alignSelf: "flex-start", background: "transparent", border: "none", color: "#00FFFF", fontSize: 10, cursor: "pointer" }}
                  >
                    ← Back
                  </button>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#FFD700" }}>
                    {eventDestination}
                    {eventDestination === "WORLD_DANCE_PARTY" && wdpMode ? ` / ${wdpMode}` : ""}
                  </div>
                  <label style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                    Track Name
                    <input
                      data-testid="beat-track-name"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      style={{ display: "block", width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "#0a0614", color: "#fff" }}
                    />
                  </label>
                  <label style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                    Genre
                    <select
                      data-testid="beat-genre"
                      value={eventGenre}
                      onChange={(e) => setEventGenre(e.target.value)}
                      style={{ display: "block", width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "#0a0614", color: "#fff" }}
                    >
                      {["Hip-Hop", "R&B", "Soul", "Trap", "Electronic", "Dance", "Pop", "Other"].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      data-testid="beat-for-sale"
                      type="checkbox"
                      checked={eventForSale}
                      onChange={(e) => setEventForSale(e.target.checked)}
                    />
                    Sell this Beat
                  </label>
                  {eventForSale ? (
                    <>
                      <label style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                        Your Price (USD)
                        <input
                          data-testid="beat-price"
                          value={eventPrice}
                          onChange={(e) => setEventPrice(e.target.value)}
                          style={{ display: "block", width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "#0a0614", color: "#fff" }}
                        />
                      </label>
                      {(eventDestination === "BATTLE" || eventDestination === "CYPHER") ? (
                        <div data-testid="marketplace-fallback" style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>
                          If nobody buys during the performance, list in Marketplace?
                          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                            <button type="button" data-testid="marketplace-fallback-yes" onClick={() => setEventMarketplaceFallback(true)} style={{ padding: "6px 10px", borderRadius: 6, border: eventMarketplaceFallback === true ? "1px solid #00FF88" : "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", cursor: "pointer" }}>YES</button>
                            <button type="button" data-testid="marketplace-fallback-no" onClick={() => setEventMarketplaceFallback(false)} style={{ padding: "6px 10px", borderRadius: 6, border: eventMarketplaceFallback === false ? "1px solid #FF2DAA" : "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", cursor: "pointer" }}>NO</button>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                  <button
                    type="button"
                    data-testid="beat-submit"
                    onClick={handleEventBeatSubmit}
                    style={{ padding: "12px 16px", borderRadius: 8, border: "none", background: "linear-gradient(90deg,#FFD700,#FF2DAA)", color: "#050510", fontWeight: 900, cursor: "pointer" }}
                  >
                    SUBMIT BEAT
                  </button>
                </div>
              ) : null}

              {eventStep === "locker" && lastBeatId ? (
                <div data-testid="beat-locker-reuse" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#00FF88" }}>IN BEAT LOCKER — {lastBeatId}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
                    Memberships: {listAssignmentsForBeat(lastBeatId).map((a) => a.destination).join(" · ")}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>SUBMIT TO ANOTHER EVENT</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(["BATTLE", "CYPHER", "WORLD_DANCE_PARTY"] as BeatPrimaryDestination[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        data-testid={`submit-elsewhere-${d.toLowerCase()}`}
                        onClick={() => handleSubmitElsewhere(d)}
                        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(0,255,255,0.4)", background: "rgba(0,255,255,0.08)", color: "#00FFFF", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    data-testid="events-new-beat"
                    onClick={() => {
                      setEventStep("chooser");
                      setEventDestination(null);
                      setWdpMode(null);
                      setEventTitle("");
                      setEventMarketplaceFallback(null);
                    }}
                    style={{ alignSelf: "flex-start", background: "transparent", border: "none", color: "#FFD700", fontSize: 10, cursor: "pointer" }}
                  >
                    + Submit a different Beat
                  </button>
                </div>
              ) : null}

              {eventHistory.length > 0 ? (
                <div data-testid="event-beat-history" style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>MY EVENT SUBMISSIONS</div>
                  {eventHistory.map((h, i) => (
                    <div key={`${h.beatId}-${i}`} style={{ fontSize: 10, color: "#fff", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      {h.title} · {h.beatId} · {h.destination} · {h.status}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {destination !== "events" ? (
          <>
          {/* Destination Header + Add/Submit Button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              padding: "4px 2px",
            }}
          >
            <div>
              <div
                data-testid="sub-count-header"
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  color: destination === "video_shuffle" ? "#FF2DAA" : "#00FFFF",
                  textTransform: "uppercase",
                }}
              >
                {countHeader}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                Destination: {destinationLabel} · Active in Queue
              </div>
            </div>

            <button
              type="button"
              data-testid="sub-add-new-btn"
              onClick={() => {
                setTargetReplacingId(null);
                setPickerMode("submit");
              }}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.06em",
                cursor: "pointer",
                background: destination === "video_shuffle" ? "rgba(255,45,170,0.25)" : "rgba(0,255,255,0.25)",
                border: destination === "video_shuffle" ? "1px solid #FF2DAA" : "1px solid #00FFFF",
                color: destination === "video_shuffle" ? "#FF2DAA" : "#00FFFF",
              }}
            >
              + SUBMIT TO {destination === "video_shuffle" ? "SHUFFLE" : "RADIO"}
            </button>
          </div>

          {/* Eligible Media Picker Modal (when Add or Replace is active) */}
          {pickerMode ? (
            <div
              data-testid="sub-media-picker"
              style={{
                background: "rgba(10,14,28,0.95)",
                border: "1px solid rgba(255,215,0,0.5)",
                borderRadius: 10,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 4,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#FFD700" }}>
                  {pickerMode === "replace" ? "SELECT REPLACEMENT MEDIA:" : `SELECT ELIGIBLE ${destination === "video_shuffle" ? "VIDEO" : "TRACK"}:`}
                </span>
                <button
                  type="button"
                  onClick={() => { setPickerMode(null); setTargetReplacingId(null); }}
                  style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: 12, fontWeight: 800 }}
                >
                  ✕ CANCEL
                </button>
              </div>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                Choose an item from your verified media library. Submitting will not duplicate or move the original file.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "200px", overflowY: "auto" }}>
                {eligibleForDestination.map((media) => (
                  <div
                    key={media.id}
                    data-testid={`sub-picker-item-${media.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setLivePreview({
                        title: media.title,
                        url: media.url,
                        type: media.type,
                        genre: media.genre,
                        bpm: media.bpm,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLivePreview({
                          title: media.title,
                          url: media.url,
                          type: media.type,
                          genre: media.genre,
                          bpm: media.bpm,
                        });
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>{media.title}</div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
                        {media.genre ?? "General"} {media.bpm ? `· ${media.bpm} BPM` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid={`sub-picker-select-${media.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleSelectMedia(media);
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 4,
                        fontSize: 9,
                        fontWeight: 900,
                        cursor: "pointer",
                        background: "rgba(0,255,136,0.2)",
                        border: "1px solid #00FF88",
                        color: "#00FF88",
                      }}
                    >
                      CHOOSE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* List of Member's Current Submissions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {currentItems.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  border: "1px dashed rgba(255,255,255,0.12)",
                  borderRadius: 8,
                }}
              >
                No active submissions in {destinationLabel}. Tap the submit button above to enter the queue.
              </div>
            ) : (
              currentItems.map((item) => (
                <div
                  key={item.id}
                  data-testid={`sub-item-card-${item.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setLivePreview({
                      title: item.title,
                      url: item.mediaUrl,
                      type: item.type,
                      genre: item.genre,
                      bpm: item.bpm,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setLivePreview({
                        title: item.title,
                        url: item.mediaUrl,
                        type: item.type,
                        genre: item.genre,
                        bpm: item.bpm,
                      });
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "rgba(8,12,24,0.85)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    flexWrap: "wrap",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ flex: "1 1 200px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12 }}>{item.type === "video" ? "🎬" : "🎵"}</span>
                      <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2, display: "flex", gap: 8 }}>
                      <span>Artist: {item.artist}</span>
                      {item.genre ? <span>· {item.genre}</span> : null}
                      <span
                        style={{
                          color: item.status === "IN_ROTATION" ? "#00FF88" : item.status === "QUEUED" ? "#00FFFF" : "#FFD700",
                          fontWeight: 800,
                        }}
                      >
                        ● {item.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Actions: REPLACE and REMOVE */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {confirmRemoveId === item.id ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 8, color: "#FF4444" }}>Remove from queue?</span>
                        <button
                          type="button"
                          data-testid={`sub-confirm-remove-${item.id}`}
                          onClick={() => handleRemove(item.id)}
                          style={{
                            padding: "3px 8px",
                            borderRadius: 4,
                            fontSize: 8,
                            fontWeight: 900,
                            cursor: "pointer",
                            background: "rgba(255,40,40,0.3)",
                            border: "1px solid #FF4444",
                            color: "#FF4444",
                          }}
                        >
                          YES
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(null)}
                          style={{
                            padding: "3px 8px",
                            borderRadius: 4,
                            fontSize: 8,
                            fontWeight: 800,
                            cursor: "pointer",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "#fff",
                          }}
                        >
                          NO
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          data-testid={`sub-replace-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTargetReplacingId(item.id);
                            setPickerMode("replace");
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 5,
                            fontSize: 8,
                            fontWeight: 800,
                            cursor: "pointer",
                            background: "rgba(0,255,255,0.12)",
                            border: "1px solid rgba(0,255,255,0.4)",
                            color: "#00FFFF",
                          }}
                          title="Replace this submission with another eligible song/video"
                        >
                          REPLACE
                        </button>

                        <button
                          type="button"
                          data-testid={`sub-remove-btn-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmRemoveId(item.id);
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: 5,
                            fontSize: 8,
                            fontWeight: 800,
                            cursor: "pointer",
                            background: "rgba(255,40,40,0.1)",
                            border: "1px solid rgba(255,40,40,0.35)",
                            color: "#FF6B6B",
                          }}
                          title="Remove from submission queue (does not delete media file)"
                        >
                          REMOVE
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              padding: "6px 8px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 8,
              color: "rgba(255,255,255,0.35)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 4,
            }}
          >
            <span>* Removing from queue never deletes the original file from your media library.</span>
            <span>Auxiliary management drawer · Monitors stay active</span>
          </div>
          </>
          ) : null}

        </div>
          }
        />
      </DrawerBezelChrome>
    </div>
  );
}
